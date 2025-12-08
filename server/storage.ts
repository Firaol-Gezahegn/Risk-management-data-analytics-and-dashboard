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
  getAllRiskRecords(filters?: { department?: string | null; role?: string; limit?: number; offset?: number }): Promise<RiskRecord[]>;
  getRiskCount(filters?: { department?: string | null; role?: string }): Promise<number>;
  createRiskRecord(record: InsertRiskRecord & { riskId?: string }): Promise<RiskRecord>;
  updateRiskRecord(id: number, updates: Partial<RiskRecord>): Promise<RiskRecord | undefined>;
  deleteRiskRecord(id: number): Promise<boolean>;
  getRiskStatistics(filters?: { department?: string | null; includeByDepartment?: boolean }): Promise<RiskStatistics>;
  getDashboardData(filters?: { department?: string | null }): Promise<any>;

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

  async getAllRiskRecords(filters?: { department?: string | null; role?: string; limit?: number; offset?: number }): Promise<RiskRecord[]> {
    let query = db.select().from(riskRecords)
      .where(eq(riskRecords.isDeleted, false))
      .orderBy(desc(riskRecords.createdAt));
    
    // Apply pagination
    if (filters?.limit) {
      query = query.limit(filters.limit) as any;
    }
    if (filters?.offset) {
      query = query.offset(filters.offset) as any;
    }
    
    const records = await query;
    
    // Filter by department if specified
    if (filters?.department) {
      return records.filter(r => r.department === filters.department);
    }
    
    return records;
  }

  async getRiskCount(filters?: { department?: string | null; role?: string }): Promise<number> {
    const records = await db.select().from(riskRecords)
      .where(eq(riskRecords.isDeleted, false));
    
    // Filter by department if specified
    if (filters?.department) {
      return records.filter(r => r.department === filters.department).length;
    }
    
    return records.length;
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
    
    // Note: Risk score calculations (inherentRisk, residualRisk, riskScore) are now
    // handled in routes.ts using the 5x5 matrix from computeRiskScores()
    // Do not recalculate here to avoid overriding the correct matrix-based values
    
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

  async getRiskStatistics(filters?: { department?: string | null; includeByDepartment?: boolean }): Promise<RiskStatistics> {
    let records = await db.select().from(riskRecords).where(eq(riskRecords.isDeleted, false));
    
    if (filters?.department) {
      records = records.filter(r => r.department === filters.department);
    }

    const total = records.length;
    const scores = records.map((record) => ({
      record,
      score: calculateRiskScore(record),
    }));

    // Risk levels based on 5x5 matrix ratings
    const veryHigh = scores.filter(({ score }) => score >= 83.33).length; // Matrix value 20-24
    const high = scores.filter(({ score }) => score >= 62.5 && score < 83.33).length; // Matrix value 15-19
    const medium = scores.filter(({ score }) => score >= 37.5 && score < 62.5).length; // Matrix value 9-14
    const low = scores.filter(({ score }) => score >= 16.67 && score < 37.5).length; // Matrix value 4-8
    const veryLow = scores.filter(({ score }) => score < 16.67).length; // Matrix value 0-3

    const byStatus: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const byDepartment: Record<string, number> = {};
    
    records.forEach(r => {
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
      byCategory[r.riskCategory] = (byCategory[r.riskCategory] || 0) + 1;
      if (filters?.includeByDepartment) {
        byDepartment[r.department] = (byDepartment[r.department] || 0) + 1;
      }
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

    // Top risks (highest inherent risk scores)
    const topRisks = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ record }) => ({
        id: record.id,
        riskId: record.riskId || `#${record.id}`,
        riskTitle: record.riskTitle || record.description || record.riskType || 'Untitled',
        inherentRisk: Number(record.inherentRisk || 0),
        department: record.department,
      }));

    // Control effectiveness
    const recordsWithControl = records.filter(r => r.controlEffectivenessScore && Number(r.controlEffectivenessScore) > 0);
    const avgControlEff = recordsWithControl.length > 0
      ? recordsWithControl.reduce((sum, r) => sum + Number(r.controlEffectivenessScore), 0) / recordsWithControl.length
      : 0;

    const controlEffByDept: Record<string, number> = {};
    if (filters?.includeByDepartment) {
      const deptGroups: Record<string, number[]> = {};
      recordsWithControl.forEach(r => {
        if (!deptGroups[r.department]) deptGroups[r.department] = [];
        deptGroups[r.department].push(Number(r.controlEffectivenessScore));
      });
      Object.entries(deptGroups).forEach(([dept, values]) => {
        controlEffByDept[dept] = values.reduce((sum, v) => sum + v, 0) / values.length;
      });
    }

    // RCSA completion
    let rcsaCompletion = {
      completed: 0,
      total: records.length,
      percentage: 0,
    };
    
    try {
      const assessments = await db.select().from(rcsaAssessments);
      rcsaCompletion = {
        completed: new Set(assessments.map(a => a.riskId)).size,
        total: records.length,
        percentage: records.length > 0 ? (new Set(assessments.map(a => a.riskId)).size / records.length) * 100 : 0,
      };
    } catch (error) {
      console.error('Error fetching RCSA assessments:', error);
    }

    return { 
      total,
      veryHigh,
      high, 
      medium, 
      low,
      veryLow,
      byStatus, 
      byCategory, 
      trend,
      ...(filters?.includeByDepartment && { byDepartment }),
      topRisks,
      controlEffectiveness: {
        average: avgControlEff,
        byDepartment: controlEffByDept,
      },
      rcsaCompletion,
    };
  }

  async getDashboardData(filters?: { department?: string | null }): Promise<any> {
    let records = await db.select().from(riskRecords).where(eq(riskRecords.isDeleted, false));
    
    if (filters?.department) {
      records = records.filter(r => r.department === filters.department);
    }

    // Map risks for visualization
    const risks = records.map(r => ({
      id: r.id,
      riskId: r.riskId || `#${r.id}`,
      riskTitle: r.riskTitle || 'Untitled',
      department: r.department,
      likelihood: Number(r.likelihood || 0),
      impact: Number(r.impact || 0),
      inherentRisk: Number(r.inherentRisk || 0),
      residualRisk: r.residualRisk ? Number(r.residualRisk) : null,
      controlEffectiveness: r.controlEffectivenessScore ? Number(r.controlEffectivenessScore) : null,
      riskScore: Number(r.riskScore || 0),
    }));

    // Calculate department-level control effectiveness
    const deptMap: Record<string, { total: number; count: number; risks: number }> = {};
    records.forEach(r => {
      if (!deptMap[r.department]) {
        deptMap[r.department] = { total: 0, count: 0, risks: 0 };
      }
      deptMap[r.department].risks++;
      if (r.controlEffectivenessScore) {
        deptMap[r.department].total += Number(r.controlEffectivenessScore);
        deptMap[r.department].count++;
      }
    });

    const departmentControls = Object.entries(deptMap).map(([department, data]) => ({
      department,
      avgControlEffectiveness: data.count > 0 ? data.total / data.count : 0,
      riskCount: data.risks,
    }));

    return { risks, departmentControls };
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
