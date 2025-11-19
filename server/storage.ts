import {
  users,
  riskRecords,
  ingestionStaging,
  auditLogs,
  emailReports,
  type User,
  type InsertUser,
  type RiskRecord,
  type InsertRiskRecord,
  type IngestionStaging,
  type InsertIngestionStaging,
  type AuditLog,
  type InsertAuditLog,
  type EmailReport,
  type InsertEmailReport,
  type RiskStatistics,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<Omit<User, "passwordHash">[]>;

  // Risk Records
  getRiskRecord(id: number): Promise<RiskRecord | undefined>;
  getAllRiskRecords(filters?: { department?: string; role?: string }): Promise<RiskRecord[]>;
  createRiskRecord(record: InsertRiskRecord): Promise<RiskRecord>;
  updateRiskRecord(id: number, updates: Partial<RiskRecord>): Promise<RiskRecord | undefined>;
  deleteRiskRecord(id: number): Promise<boolean>;
  getRiskStatistics(filters?: { department?: string }): Promise<RiskStatistics>;

  // Ingestion Staging
  getStagingData(): Promise<IngestionStaging[]>;
  createStagingData(data: InsertIngestionStaging): Promise<IngestionStaging>;
  clearStagingData(): Promise<void>;
  approveStagingData(): Promise<void>;

  // Audit Logs
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(limit?: number): Promise<AuditLog[]>;

  // Email Reports
  getEmailReports(): Promise<EmailReport[]>;
  createEmailReport(report: InsertEmailReport): Promise<EmailReport>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<Omit<User, "passwordHash">[]> {
    const allUsers = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      department: users.department,
      isActive: users.isActive,
      mfaEnabled: users.mfaEnabled,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users);
    return allUsers;
  }

  // Risk Records
  async getRiskRecord(id: number): Promise<RiskRecord | undefined> {
    const [record] = await db.select().from(riskRecords).where(eq(riskRecords.id, id));
    return record || undefined;
  }

  async getAllRiskRecords(filters?: { department?: string; role?: string }): Promise<RiskRecord[]> {
    let query = db.select().from(riskRecords).orderBy(desc(riskRecords.createdAt));
    
    if (filters?.department && filters.role !== "superadmin" && filters.role !== "auditor") {
      const records = await query;
      return records.filter(r => r.department === filters.department);
    }
    
    return await query;
  }

  async createRiskRecord(record: InsertRiskRecord): Promise<RiskRecord> {
    const inherentRisk = (Number(record.likelihood) * Number(record.impact)) / 100;
    const riskScore = inherentRisk;
    
    const [newRecord] = await db
      .insert(riskRecords)
      .values({
        ...record,
        inherentRisk: inherentRisk.toFixed(2),
        riskScore: riskScore.toFixed(2),
      })
      .returning();
    return newRecord;
  }

  async updateRiskRecord(id: number, updates: Partial<RiskRecord>): Promise<RiskRecord | undefined> {
    let updateData: any = { ...updates, updatedAt: new Date() };
    
    if (updates.likelihood !== undefined || updates.impact !== undefined) {
      const current = await this.getRiskRecord(id);
      if (current) {
        const likelihood = updates.likelihood !== undefined ? Number(updates.likelihood) : Number(current.likelihood);
        const impact = updates.impact !== undefined ? Number(updates.impact) : Number(current.impact);
        const inherentRisk = (likelihood * impact) / 100;
        updateData.inherentRisk = inherentRisk.toFixed(2);
        updateData.riskScore = inherentRisk.toFixed(2);
      }
    }
    
    const [record] = await db
      .update(riskRecords)
      .set(updateData)
      .where(eq(riskRecords.id, id))
      .returning();
    return record || undefined;
  }

  async deleteRiskRecord(id: number): Promise<boolean> {
    const result = await db.delete(riskRecords).where(eq(riskRecords.id, id));
    return true;
  }

  async getRiskStatistics(filters?: { department?: string }): Promise<RiskStatistics> {
    let records = await db.select().from(riskRecords);
    
    if (filters?.department) {
      records = records.filter(r => r.department === filters.department);
    }

    const total = records.length;
    const high = records.filter(r => Number(r.inherentRisk || 0) >= 70).length;
    const medium = records.filter(r => {
      const score = Number(r.inherentRisk || 0);
      return score >= 40 && score < 70;
    }).length;
    const low = records.filter(r => Number(r.inherentRisk || 0) < 40).length;

    const byStatus: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    
    records.forEach(r => {
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
      byCategory[r.riskCategory] = (byCategory[r.riskCategory] || 0) + 1;
    });

    const trend = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      const count = records.filter(r => {
        const reported = new Date(r.dateReported);
        return reported.getMonth() === date.getMonth() && reported.getFullYear() === date.getFullYear();
      }).length;
      trend.push({ month, count });
    }

    return { total, high, medium, low, byStatus, byCategory, trend };
  }

  // Ingestion Staging
  async getStagingData(): Promise<IngestionStaging[]> {
    return await db.select().from(ingestionStaging).orderBy(desc(ingestionStaging.createdAt));
  }

  async createStagingData(data: InsertIngestionStaging): Promise<IngestionStaging> {
    const [staging] = await db.insert(ingestionStaging).values(data).returning();
    return staging;
  }

  async clearStagingData(): Promise<void> {
    await db.delete(ingestionStaging);
  }

  async approveStagingData(): Promise<void> {
    const stagingRecords = await db.select().from(ingestionStaging);
    
    for (const staging of stagingRecords) {
      const rawData = staging.rawRow as any;
      
      try {
        await db.insert(riskRecords).values({
          riskType: rawData.riskType || rawData.risk_type || "Unknown",
          riskCategory: rawData.riskCategory || rawData.risk_category || "Operational",
          businessUnit: rawData.businessUnit || rawData.business_unit || "General",
          department: rawData.department || "General",
          likelihood: rawData.likelihood || "50",
          impact: rawData.impact || "50",
          inherentRisk: rawData.inherentRisk || "25",
          residualRisk: rawData.residualRisk || null,
          riskScore: rawData.riskScore || "25",
          status: rawData.status || "Open",
          dateReported: rawData.dateReported || rawData.date_reported || new Date().toISOString().split("T")[0],
          description: rawData.description || null,
          mitigationPlan: rawData.mitigationPlan || rawData.mitigation_plan || null,
        });
      } catch (error) {
        console.error("Error importing staging record:", error);
      }
    }
    
    await this.clearStagingData();
  }

  // Audit Logs
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [auditLog] = await db.insert(auditLogs).values(log).returning();
    return auditLog;
  }

  async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }

  // Email Reports
  async getEmailReports(): Promise<EmailReport[]> {
    return await db.select().from(emailReports).orderBy(desc(emailReports.createdAt));
  }

  async createEmailReport(report: InsertEmailReport): Promise<EmailReport> {
    const [emailReport] = await db.insert(emailReports).values(report).returning();
    return emailReport;
  }
}

export const storage = new DatabaseStorage();
