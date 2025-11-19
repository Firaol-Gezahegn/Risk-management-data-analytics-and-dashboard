import { db } from "./db";
import { users, riskRecords } from "@shared/schema";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  // Check if admin already exists
  const existingAdmin = await db.select().from(users).limit(1);
  if (existingAdmin.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  await db.insert(users).values({
    email: "admin@awashbank.com",
    name: "System Administrator",
    passwordHash: adminPassword,
    role: "superadmin",
    department: "IT",
    isActive: true,
    mfaEnabled: false,
  });

  // Create risk admin user
  const riskAdminPassword = await bcrypt.hash("risk123", 10);
  await db.insert(users).values({
    email: "riskadmin@awashbank.com",
    name: "Risk Manager",
    passwordHash: riskAdminPassword,
    role: "risk_admin",
    department: "Risk Management",
    isActive: true,
    mfaEnabled: false,
  });

  // Create business user
  const userPassword = await bcrypt.hash("user123", 10);
  await db.insert(users).values({
    email: "user@awashbank.com",
    name: "Business Analyst",
    passwordHash: userPassword,
    role: "business_user",
    department: "Retail Banking",
    isActive: true,
    mfaEnabled: false,
  });

  // Create sample risk records
  const today = new Date().toISOString().split("T")[0];
  const sampleRisks = [
    {
      riskType: "Credit Default Risk",
      riskCategory: "Financial",
      businessUnit: "Retail Banking",
      department: "Retail Banking",
      likelihood: "75",
      impact: "85",
      inherentRisk: "63.75",
      residualRisk: "40",
      riskScore: "63.75",
      status: "Mitigating",
      dateReported: today,
      description: "Potential increase in loan defaults due to economic downturn",
      mitigationPlan: "Enhanced credit scoring, increased monitoring of high-risk accounts",
    },
    {
      riskType: "Operational Risk - System Failure",
      riskCategory: "Technology",
      businessUnit: "IT Operations",
      department: "IT",
      likelihood: "45",
      impact: "90",
      inherentRisk: "40.5",
      residualRisk: "25",
      riskScore: "40.5",
      status: "Open",
      dateReported: today,
      description: "Critical banking system downtime risk",
      mitigationPlan: "Implement redundant systems, regular disaster recovery testing",
    },
    {
      riskType: "Regulatory Compliance Risk",
      riskCategory: "Compliance",
      businessUnit: "Compliance",
      department: "Risk Management",
      likelihood: "60",
      impact: "70",
      inherentRisk: "42",
      residualRisk: "30",
      riskScore: "42",
      status: "Mitigating",
      dateReported: today,
      description: "Changes in banking regulations may impact operations",
      mitigationPlan: "Dedicated compliance team, regular regulatory reviews",
    },
    {
      riskType: "Fraud Risk",
      riskCategory: "Operational",
      businessUnit: "Retail Banking",
      department: "Retail Banking",
      likelihood: "55",
      impact: "75",
      inherentRisk: "41.25",
      residualRisk: "20",
      riskScore: "41.25",
      status: "Open",
      dateReported: today,
      description: "Internal fraud and external cyber fraud threats",
      mitigationPlan: "Enhanced fraud detection systems, employee training programs",
    },
    {
      riskType: "Market Risk",
      riskCategory: "Financial",
      businessUnit: "Treasury",
      department: "Treasury",
      likelihood: "65",
      impact: "80",
      inherentRisk: "52",
      residualRisk: "35",
      riskScore: "52",
      status: "Open",
      dateReported: today,
      description: "Foreign exchange and interest rate volatility",
      mitigationPlan: "Hedging strategies, diversified investment portfolio",
    },
    {
      riskType: "Liquidity Risk",
      riskCategory: "Financial",
      businessUnit: "Treasury",
      department: "Treasury",
      likelihood: "35",
      impact: "95",
      inherentRisk: "33.25",
      residualRisk: "15",
      riskScore: "33.25",
      status: "Closed",
      dateReported: today,
      description: "Insufficient liquid assets to meet short-term obligations",
      mitigationPlan: "Maintain adequate cash reserves, diversified funding sources",
    },
    {
      riskType: "Strategic Risk",
      riskCategory: "Strategic",
      businessUnit: "Executive",
      department: "Executive",
      likelihood: "50",
      impact: "85",
      inherentRisk: "42.5",
      residualRisk: "30",
      riskScore: "42.5",
      status: "Open",
      dateReported: today,
      description: "Digital transformation and competitive pressures",
      mitigationPlan: "Innovation initiatives, market research, strategic partnerships",
    },
    {
      riskType: "Reputational Risk",
      riskCategory: "Strategic",
      businessUnit: "Marketing",
      department: "Marketing",
      likelihood: "40",
      impact: "80",
      inherentRisk: "32",
      residualRisk: "18",
      riskScore: "32",
      status: "Mitigating",
      dateReported: today,
      description: "Negative publicity affecting brand image",
      mitigationPlan: "Crisis management plan, enhanced customer service, proactive communication",
    },
  ];

  for (const risk of sampleRisks) {
    await db.insert(riskRecords).values(risk);
  }

  console.log("Database seeded successfully!");
  console.log("\nLogin credentials:");
  console.log("Admin: admin@awashbank.com / admin123");
  console.log("Risk Admin: riskadmin@awashbank.com / risk123");
  console.log("Business User: user@awashbank.com / user123");
}

seed()
  .then(() => {
    console.log("Seed completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
