// Seed department codes into the database
import { db } from "./db";
import { sql } from "drizzle-orm";

const DEPARTMENT_DATA = [
  { name: "Credit Management Office", code: "CR", description: "Manages credit risk and loan portfolios" },
  { name: "Corporate Strategy", code: "CS", description: "Strategic planning and corporate development" },
  { name: "Digital Banking", code: "DB", description: "Digital channels and online banking services" },
  { name: "Facility Management", code: "FM", description: "Building and facility operations" },
  { name: "Finance Office", code: "FO", description: "Financial management and accounting" },
  { name: "Human Capital", code: "HC", description: "Human resources and talent management" },
  { name: "IFB", code: "IF", description: "International Finance and Banking" },
  { name: "Information & IT Service", code: "IT", description: "Information technology and systems" },
  { name: "Internal Audit", code: "IA", description: "Internal audit and compliance monitoring" },
  { name: "Legal Service", code: "LS", description: "Legal affairs and regulatory compliance" },
  { name: "Marketing Office", code: "MO", description: "Marketing and brand management" },
  { name: "Retail & SME", code: "RS", description: "Retail banking and SME services" },
  { name: "Risk & Compliance", code: "RC", description: "Risk management and regulatory compliance" },
  { name: "Transformation Office", code: "TO", description: "Business transformation initiatives" },
  { name: "Trade Service", code: "TS", description: "Trade finance and international trade" },
  { name: "Wholesale Banking", code: "WS", description: "Corporate and wholesale banking services" },
];

export async function seedDepartmentCodes() {
  console.log("Seeding department codes...");
  
  try {
    // Create department_codes table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS department_codes (
        id SERIAL PRIMARY KEY,
        department_name TEXT NOT NULL UNIQUE,
        code TEXT NOT NULL UNIQUE,
        description TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Insert department codes
    for (const dept of DEPARTMENT_DATA) {
      await db.execute(sql`
        INSERT INTO department_codes (department_name, code, description)
        VALUES (${dept.name}, ${dept.code}, ${dept.description})
        ON CONFLICT (department_name) DO NOTHING
      `);
    }

    console.log("Department codes seeded successfully!");
  } catch (error) {
    console.error("Error seeding department codes:", error);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDepartmentCodes().then(() => process.exit(0));
}
