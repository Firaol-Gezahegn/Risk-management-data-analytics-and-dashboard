// Manual migration script to add new features
import { db, pool } from "./db";
import { sql } from "drizzle-orm";

async function runMigration() {
  console.log("Starting migration...");

  try {
    // Add new columns to risk_records table
    console.log("Adding new columns to risk_records...");
    
    await db.execute(sql`ALTER TABLE risk_records ADD COLUMN IF NOT EXISTS risk_id TEXT UNIQUE`);
    await db.execute(sql`ALTER TABLE risk_records ADD COLUMN IF NOT EXISTS objectives TEXT`);
    await db.execute(sql`ALTER TABLE risk_records ADD COLUMN IF NOT EXISTS process_key_activity TEXT`);
    await db.execute(sql`ALTER TABLE risk_records ADD COLUMN IF NOT EXISTS risk_title TEXT`);
    await db.execute(sql`ALTER TABLE risk_records ADD COLUMN IF NOT EXISTS risk_description TEXT`);
    await db.execute(sql`ALTER TABLE risk_records ADD COLUMN IF NOT EXISTS root_causes TEXT`);
    await db.execute(sql`ALTER TABLE risk_records ADD COLUMN IF NOT EXISTS risk_impact TEXT`);
    await db.execute(sql`ALTER TABLE risk_records ADD COLUMN IF NOT EXISTS existing_risk_control TEXT`);
    await db.execute(sql`ALTER TABLE risk_records ADD COLUMN IF NOT EXISTS potential_risk_response TEXT`);
    await db.execute(sql`ALTER TABLE risk_records ADD COLUMN IF NOT EXISTS level_of_impact NUMERIC(5, 2)`);
    await db.execute(sql`ALTER TABLE risk_records ADD COLUMN IF NOT EXISTS control_effectiveness_score NUMERIC(5, 2)`);
    await db.execute(sql`ALTER TABLE risk_records ADD COLUMN IF NOT EXISTS justification TEXT`);
    await db.execute(sql`ALTER TABLE risk_records ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false`);

    // Update existing records
    console.log("Updating existing records...");
    await db.execute(sql`UPDATE risk_records SET risk_title = COALESCE(description, risk_type, 'Untitled Risk') WHERE risk_title IS NULL`);
    await db.execute(sql`UPDATE risk_records SET level_of_impact = impact WHERE level_of_impact IS NULL`);

    // Make required columns NOT NULL
    await db.execute(sql`ALTER TABLE risk_records ALTER COLUMN risk_title SET NOT NULL`);
    await db.execute(sql`ALTER TABLE risk_records ALTER COLUMN level_of_impact SET NOT NULL`);

    // Create risk_collaborators table
    console.log("Creating risk_collaborators table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS risk_collaborators (
        id SERIAL PRIMARY KEY,
        risk_id INTEGER NOT NULL REFERENCES risk_records(id) ON DELETE CASCADE,
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(risk_id, user_id)
      )
    `);

    // Create rcsa_assessments table
    console.log("Creating rcsa_assessments table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS rcsa_assessments (
        id SERIAL PRIMARY KEY,
        risk_id INTEGER NOT NULL REFERENCES risk_records(id) ON DELETE CASCADE,
        inherent_risk_rating TEXT NOT NULL,
        control_effectiveness_rating TEXT NOT NULL,
        residual_risk_rating TEXT NOT NULL,
        justification TEXT,
        additional_control_recommendations TEXT,
        existing_controls_ineffective BOOLEAN NOT NULL DEFAULT false,
        proposed_new_control TEXT,
        from_suggested_list BOOLEAN NOT NULL DEFAULT false,
        recommendation_justification TEXT,
        assessed_by VARCHAR REFERENCES users(id),
        assessment_date DATE NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Create risk_response_progress table
    console.log("Creating risk_response_progress table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS risk_response_progress (
        id SERIAL PRIMARY KEY,
        risk_id INTEGER NOT NULL REFERENCES risk_records(id) ON DELETE CASCADE,
        agreed_risk_response TEXT NOT NULL,
        progress_this_quarter TEXT,
        percent_complete NUMERIC(5, 2) NOT NULL DEFAULT 0,
        observed_impact TEXT,
        impediments TEXT,
        quarter TEXT NOT NULL,
        updated_by VARCHAR REFERENCES users(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Create department_codes table
    console.log("Creating department_codes table...");
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
    console.log("Inserting department codes...");
    const departments = [
      { name: 'Credit Management Office', code: 'CR', desc: 'Manages credit risk and loan portfolios' },
      { name: 'Corporate Strategy', code: 'CS', desc: 'Strategic planning and corporate development' },
      { name: 'Digital Banking', code: 'DB', desc: 'Digital channels and online banking services' },
      { name: 'Facility Management', code: 'FM', desc: 'Building and facility operations' },
      { name: 'Finance Office', code: 'FO', desc: 'Financial management and accounting' },
      { name: 'Human Capital', code: 'HC', desc: 'Human resources and talent management' },
      { name: 'IFB', code: 'IF', desc: 'International Finance and Banking' },
      { name: 'Information & IT Service', code: 'IT', desc: 'Information technology and systems' },
      { name: 'Internal Audit', code: 'IA', desc: 'Internal audit and compliance monitoring' },
      { name: 'Legal Service', code: 'LS', desc: 'Legal affairs and regulatory compliance' },
      { name: 'Marketing Office', code: 'MO', desc: 'Marketing and brand management' },
      { name: 'Retail & SME', code: 'RS', desc: 'Retail banking and SME services' },
      { name: 'Risk & Compliance', code: 'RC', desc: 'Risk management and regulatory compliance' },
      { name: 'Transformation Office', code: 'TO', desc: 'Business transformation initiatives' },
      { name: 'Trade Service', code: 'TS', desc: 'Trade finance and international trade' },
      { name: 'Wholesale Banking', code: 'WS', desc: 'Corporate and wholesale banking services' },
    ];

    for (const dept of departments) {
      await db.execute(sql`
        INSERT INTO department_codes (department_name, code, description)
        VALUES (${dept.name}, ${dept.code}, ${dept.desc})
        ON CONFLICT (department_name) DO NOTHING
      `);
    }

    // Create indexes
    console.log("Creating indexes...");
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_risk_records_risk_id ON risk_records(risk_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_risk_records_department ON risk_records(department)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_risk_records_is_deleted ON risk_records(is_deleted)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_risk_collaborators_risk_id ON risk_collaborators(risk_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_risk_collaborators_user_id ON risk_collaborators(user_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_rcsa_assessments_risk_id ON rcsa_assessments(risk_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_risk_response_progress_risk_id ON risk_response_progress(risk_id)`);

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migration
runMigration()
  .then(() => {
    console.log("Migration finished. You can now start the application.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration error:", error);
    process.exit(1);
  });
