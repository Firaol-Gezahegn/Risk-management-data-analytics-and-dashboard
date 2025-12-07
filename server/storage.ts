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
import {
  riskCollaborators,
  rcsaAssessments,
  riskResponseProgress,
  type RiskCollaborator,
  type InsertRiskCollaborator,
  type RcsaAssessment,
  type InsertRcsaAssessment,
  type RiskResponseProgress,
  type InsertRiskResponseProgress,
} from "@shared/schema-additions";
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
  createRiskRecord(record: InsertRiskRecord & { riskId?: string }): Promise<RiskRecord>;
  updateRiskRecord(id: number, updates: Partial<RiskRecord>): Promise<RiskRecord | undefined>;
  deleteRiskRecord(id: number): Promise<boolean>;
  getRiskStatistics(filters?: { department?: string }): Promise<RiskStatistics>;

  // Collaborators
  getRiskCollaborators(riskId: number): Promise<any[]>;
  setRiskCollaborators(riskId: number, userIds: string[]): Promise<void>;

  // RCSA
  getRcsaAssessments(riskId: number): Promise<RcsaAssessment[]>;
  createRcsaAssessment(assessment: InsertRcsaAssessment): Promise<RcsaAssessment>;

  // Risk Response Progress
  getRiskResponseProgress(riskId: number): Promise<RiskResponseProgress[]>;
  createRiskResponseProgress(progress: InsertRiskResponseProgress): Promise<RiskResponseProgress>;

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
    let query = db.select().from(riskRecords)
      .where(eq(riskRecords.isDeleted, false))
      .orderBy(desc(riskRecords.createdAt));
    
    if (filters?.department && filters.role !== "superadmin" && filters.role !== "auditor") {
      const records = await query;
      return records.filter(r => r.department === filters.department);
    }
    
    return await query;
  }

  async createRiskRecord(record: InsertRiskRecord & { riskId?: string }): Promise<RiskRecord> {
    const [newRecord] = await db
      .insert(riskRecords)
      .values(record as any)
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
    // Soft delete
    await db
      .update(riskRecords)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(eq(riskRecords.id, id));
    return true;
  }

  // Collaborators
  async getRiskCollaborators(riskId: number): Promise<any[]> {
    const collaborators = await db
      .select({
        id: riskCollaborators.id,
        userId: riskCollaborators.userId,
        userName: users.name,
        userEmail: users.email,
        userDepartment: users.department,
      })
      .from(riskCollaborators)
      .leftJoin(users, eq(riskCollaborators.userId, users.id))
      .where(eq(riskCollaborators.riskId, riskId));
    
    return collaborators;
  }

  async setRiskCollaborators(riskId: number, userIds: string[]): Promise<void> {
    // Remove existing collaborators
    await db.delete(riskCollaborators).where(eq(riskCollaborators.riskId, riskId));
    
    // Add new collaborators
    if (userIds.length > 0) {
      await db.insert(riskCollaborators).values(
        userIds.map(userId => ({ riskId, userId }))
      );
    }
  }

  // RCSA
  async getRcsaAssessments(riskId: number): Promise<RcsaAssessment[]> {
    return await db
      .select()
      .from(rcsaAssessments)
      .where(eq(rcsaAssessments.riskId, riskId))
      .orderBy(desc(rcsaAssessments.createdAt));
  }

  async createRcsaAssessment(assessment: InsertRcsaAssessment): Promise<RcsaAssessment> {
    const [newAssessment] = await db
      .insert(rcsaAssessments)
      .values(assessment as any)
      .returning();
    return newAssessment;
  }

  // Risk Response Progress
  async getRiskResponseProgress(riskId: number): Promise<RiskResponseProgress[]> {
    return await db
      .select()
      .from(riskResponseProgress)
      .where(eq(riskResponseProgress.riskId, riskId))
      .orderBy(desc(riskResponseProgress.createdAt));
  }

  async createRiskResponseProgress(progress: InsertRiskResponseProgress): Promise<RiskResponseProgress> {
    const [newProgress] = await db
      .insert(riskResponseProgress)
      .values(progress as any)
      .returning();
    return newProgress;
  }

  async getRiskStatistics(filters?: { department?: string }): Promise<RiskStatistics> {
    let records = await db.select().from(riskRecords).where(eq(riskRecords.isDeleted, false));
    
    if (filters?.department) {
      records = records.filter(r => r.department === filters.department);
    }

    const total = records.length;
    const scores = records.map((record) => ({
      record,
      score: calculateRiskScore(record),
    }));

    const high = scores.filter(({ score }) => score >= 70).length;
    const medium = scores.filter(({ score }) => score >= 40 && score < 70).length;
    const low = scores.filter(({ score }) => score < 40).length;

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
      const normalized = normalizeRecord(rawData);
      
      try {
        await db.insert(riskRecords).values({
          riskTitle: getField(normalized, ["risktitle", "title"], "Imported Risk"),
          riskType: getField(normalized, ["risktype", "type", "risk"], "Unknown"),
          riskCategory: getField(normalized, ["riskcategory", "category"], "Operational"),
          businessUnit: getField(normalized, ["businessunit", "unit", "businessline"], "General"),
          department: getField(normalized, ["department", "dept", "division"], "General"),
          likelihood: getField(normalized, ["likelihood", "probability"], "50"),
          levelOfImpact: getField(normalized, ["levelofimpact", "impact", "severity"], "50"),
          impact: getField(normalized, ["impact", "severity"], "50"),
          inherentRisk: getField(normalized, ["inherentrisk", "inherent"], "25"),
          residualRisk: getField(normalized, ["residualrisk", "residual"], null),
          riskScore: getField(normalized, ["riskscore", "score"], "25"),
          status: getField(normalized, ["status", "state"], "Open"),
          dateReported:
            getField(normalized, ["datereported", "reporteddate", "date", "reportdate"], new Date().toISOString().split("T")[0]),
          description: getField(normalized, ["description", "details", "summary"], null),
          mitigationPlan: getField(normalized, ["mitigationplan", "plan", "response"], null),
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

function normalizeKey(key: string) {
  return key.toLowerCase().replace(/[\s_-]/g, "");
}

function normalizeRecord(record: Record<string, any>) {
  const normalized: Record<string, any> = {};
  for (const [key, value] of Object.entries(record || {})) {
    normalized[normalizeKey(key)] = value;
  }
  return normalized;
}

function getField(record: Record<string, any>, aliases: string[], fallback: any) {
  for (const alias of aliases) {
    const value = record[normalizeKey(alias)];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return fallback;
}

function calculateRiskScore(record: RiskRecord) {
  const inherent = Number(record.inherentRisk);
  if (Number.isFinite(inherent) && !Number.isNaN(inherent)) {
    return inherent;
  }

  const likelihood = Number(record.likelihood || 0);
  const impact = Number(record.impact || 0);
  const derived = (likelihood * impact) / 100;
  return Number.isFinite(derived) ? derived : 0;
}
