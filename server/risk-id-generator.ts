// Alphanumeric Risk ID Generator
// Format: <DEPT-CODE>-NN (e.g., CR-01, IT-15)

import { db } from "./db";
import { riskRecords } from "@shared/schema";
import { eq, and, sql, desc } from "drizzle-orm";

// Department code mapping
export const DEPARTMENT_CODES: Record<string, string> = {
  "Credit Management Office": "CR",
  "Corporate Strategy": "CS",
  "Digital Banking": "DB",
  "Facility Management": "FM",
  "Finance Office": "FO",
  "Human Capital": "HC",
  "IFB": "IF",
  "Information & IT Service": "IT",
  "Internal Audit": "IA",
  "Legal Service": "LS",
  "Marketing Office": "MO",
  "Retail & SME": "RS",
  "Risk & Compliance": "RC",
  "Transformation Office": "TO",
  "Trade Service": "TS",
  "Wholesale Banking": "WS",
};

// Get department code from department name
export function getDepartmentCode(departmentName: string): string {
  // Try exact match first
  if (DEPARTMENT_CODES[departmentName]) {
    return DEPARTMENT_CODES[departmentName];
  }
  
  // Try case-insensitive match
  const normalizedName = departmentName.toLowerCase();
  for (const [key, code] of Object.entries(DEPARTMENT_CODES)) {
    if (key.toLowerCase() === normalizedName) {
      return code;
    }
  }
  
  // Try partial match
  for (const [key, code] of Object.entries(DEPARTMENT_CODES)) {
    if (normalizedName.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedName)) {
      return code;
    }
  }
  
  // Default to first two letters uppercase
  return departmentName.substring(0, 2).toUpperCase();
}

// Generate next risk ID for a department
export async function generateRiskId(department: string): Promise<string> {
  const deptCode = getDepartmentCode(department);
  
  // Get the highest number for this department (including soft-deleted records)
  const existingRisks = await db
    .select({ riskId: riskRecords.riskId })
    .from(riskRecords)
    .where(sql`${riskRecords.riskId} LIKE ${deptCode + '-%'}`);
  
  let maxNumber = 0;
  
  for (const risk of existingRisks) {
    if (risk.riskId) {
      const parts = risk.riskId.split('-');
      if (parts.length === 2) {
        const num = parseInt(parts[1], 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    }
  }
  
  const nextNumber = maxNumber + 1;
  const paddedNumber = nextNumber.toString().padStart(2, '0');
  
  return `${deptCode}-${paddedNumber}`;
}

// Regenerate risk ID if department changes
export async function regenerateRiskIdIfNeeded(
  riskId: number,
  oldDepartment: string,
  newDepartment: string
): Promise<string | null> {
  if (oldDepartment === newDepartment) {
    return null; // No change needed
  }
  
  // Generate new risk ID for the new department
  return await generateRiskId(newDepartment);
}

// Get all department codes for UI
export function getAllDepartmentCodes(): Array<{ name: string; code: string }> {
  return Object.entries(DEPARTMENT_CODES).map(([name, code]) => ({
    name,
    code,
  }));
}
