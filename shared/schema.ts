import { sql } from "drizzle-orm";
import { pgTable, serial, text, varchar, boolean, timestamp, numeric, jsonb, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with RBAC and department support
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull(), // superadmin, risk_admin, business_user, reviewer, auditor
  department: text("department").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  mfaEnabled: boolean("mfa_enabled").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Risk records table
export const riskRecords = pgTable("risk_records", {
  id: serial("id").primaryKey(),
  riskType: text("risk_type").notNull(),
  riskCategory: text("risk_category").notNull(),
  businessUnit: text("business_unit").notNull(),
  department: text("department").notNull(),
  likelihood: numeric("likelihood", { precision: 5, scale: 2 }).notNull(),
  impact: numeric("impact", { precision: 5, scale: 2 }).notNull(),
  inherentRisk: numeric("inherent_risk", { precision: 10, scale: 2 }),
  residualRisk: numeric("residual_risk", { precision: 10, scale: 2 }),
  riskScore: numeric("risk_score", { precision: 10, scale: 2 }),
  ownerId: varchar("owner_id").references(() => users.id),
  status: text("status").notNull().default("Open"), // Open, Mitigating, Closed
  dateReported: date("date_reported").notNull(),
  description: text("description"),
  mitigationPlan: text("mitigation_plan"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Ingestion staging table
export const ingestionStaging = pgTable("ingestion_staging", {
  id: serial("id").primaryKey(),
  sourceFile: text("source_file").notNull(),
  rawRow: jsonb("raw_row").notNull(),
  mapped: boolean("mapped").notNull().default(false),
  mappingMeta: jsonb("mapping_meta"),
  errors: jsonb("errors"),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Audit logs table
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  resourceId: text("resource_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Email reports configuration table
export const emailReports = pgTable("email_reports", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cronExpr: text("cron_expr").notNull(),
  recipients: text("recipients").array().notNull(),
  reportType: text("report_type").notNull(),
  filters: jsonb("filters"),
  lastRun: timestamp("last_run"),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  name: z.string().min(2),
  passwordHash: z.string().min(8),
  role: z.enum(["superadmin", "risk_admin", "business_user", "reviewer", "auditor"]),
  department: z.string().min(2),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const insertRiskRecordSchema = createInsertSchema(riskRecords, {
  riskType: z.string().min(1),
  riskCategory: z.string().min(1),
  businessUnit: z.string().min(1),
  department: z.string().min(1),
  likelihood: z.coerce.number().min(0).max(100),
  impact: z.coerce.number().min(0).max(100),
  status: z.enum(["Open", "Mitigating", "Closed"]),
  dateReported: z.string(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertIngestionStagingSchema = createInsertSchema(ingestionStaging).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertEmailReportSchema = createInsertSchema(emailReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastRun: true,
});

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;

export type RiskRecord = typeof riskRecords.$inferSelect;
export type InsertRiskRecord = z.infer<typeof insertRiskRecordSchema>;

export type IngestionStaging = typeof ingestionStaging.$inferSelect;
export type InsertIngestionStaging = z.infer<typeof insertIngestionStagingSchema>;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

export type EmailReport = typeof emailReports.$inferSelect;
export type InsertEmailReport = z.infer<typeof insertEmailReportSchema>;

// Additional types for API responses
export type AuthResponse = {
  user: Omit<User, "passwordHash">;
  token: string;
};

export type RiskStatistics = {
  total: number;
  high: number;
  medium: number;
  low: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  trend: Array<{ month: string; count: number }>;
};
