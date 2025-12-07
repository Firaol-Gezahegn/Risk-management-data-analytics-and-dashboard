// Additional schema tables for RCSA and Collaborators
import { pgTable, serial, text, varchar, boolean, timestamp, numeric, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users, riskRecords } from "./schema";

// Risk collaborators - many-to-many relationship
export const riskCollaborators = pgTable("risk_collaborators", {
  id: serial("id").primaryKey(),
  riskId: integer("risk_id").notNull().references(() => riskRecords.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// RCSA - Risk & Control Self-Assessment
export const rcsaAssessments = pgTable("rcsa_assessments", {
  id: serial("id").primaryKey(),
  riskId: integer("risk_id").notNull().references(() => riskRecords.id, { onDelete: "cascade" }),
  inherentRiskRating: text("inherent_risk_rating").notNull(), // Very Low, Low, Medium, High, Very High
  controlEffectivenessRating: text("control_effectiveness_rating").notNull(),
  residualRiskRating: text("residual_risk_rating").notNull(),
  justification: text("justification"),
  additionalControlRecommendations: text("additional_control_recommendations"),
  existingControlsIneffective: boolean("existing_controls_ineffective").notNull().default(false),
  proposedNewControl: text("proposed_new_control"),
  fromSuggestedList: boolean("from_suggested_list").notNull().default(false),
  recommendationJustification: text("recommendation_justification"),
  assessedBy: varchar("assessed_by").references(() => users.id),
  assessmentDate: date("assessment_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Progress tracking for agreed risk response actions
export const riskResponseProgress = pgTable("risk_response_progress", {
  id: serial("id").primaryKey(),
  riskId: integer("risk_id").notNull().references(() => riskRecords.id, { onDelete: "cascade" }),
  agreedRiskResponse: text("agreed_risk_response").notNull(),
  progressThisQuarter: text("progress_this_quarter"),
  percentComplete: numeric("percent_complete", { precision: 5, scale: 2 }).notNull().default("0"),
  observedImpact: text("observed_impact"),
  impediments: text("impediments"),
  quarter: text("quarter").notNull(), // e.g., "Q1 2025"
  updatedBy: varchar("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Department codes for risk ID generation
export const departmentCodes = pgTable("department_codes", {
  id: serial("id").primaryKey(),
  departmentName: text("department_name").notNull().unique(),
  code: text("code").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Zod schemas
export const insertRiskCollaboratorSchema = createInsertSchema(riskCollaborators).omit({
  id: true,
  createdAt: true,
});

export const insertRcsaAssessmentSchema = createInsertSchema(rcsaAssessments, {
  inherentRiskRating: z.enum(["Very Low", "Low", "Medium", "High", "Very High"]),
  controlEffectivenessRating: z.enum(["Very Low", "Low", "Medium", "High", "Very High"]),
  residualRiskRating: z.enum(["Very Low", "Low", "Medium", "High", "Very High"]),
  assessmentDate: z.string(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertRiskResponseProgressSchema = createInsertSchema(riskResponseProgress, {
  percentComplete: z.coerce.number().min(0).max(100),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertDepartmentCodeSchema = createInsertSchema(departmentCodes).omit({
  id: true,
  createdAt: true,
});

// TypeScript types
export type RiskCollaborator = typeof riskCollaborators.$inferSelect;
export type InsertRiskCollaborator = z.infer<typeof insertRiskCollaboratorSchema>;

export type RcsaAssessment = typeof rcsaAssessments.$inferSelect;
export type InsertRcsaAssessment = z.infer<typeof insertRcsaAssessmentSchema>;

export type RiskResponseProgress = typeof riskResponseProgress.$inferSelect;
export type InsertRiskResponseProgress = z.infer<typeof insertRiskResponseProgressSchema>;

export type DepartmentCode = typeof departmentCodes.$inferSelect;
export type InsertDepartmentCode = z.infer<typeof insertDepartmentCodeSchema>;
