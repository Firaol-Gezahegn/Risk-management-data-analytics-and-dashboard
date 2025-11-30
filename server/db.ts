import "./env";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set...");
}

// Single pool instance for the entire app
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Single db instance using the pool
export const db = drizzle({ client: pool, schema });

// Optional helper to create a fresh db (if needed)
export function createDb() {
  const newPool = new Pool({ connectionString: process.env.DATABASE_URL });
  return drizzle({ client: newPool, schema });
}
