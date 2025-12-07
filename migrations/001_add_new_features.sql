-- Migration: Add new features for Risk Management Dashboard
-- Date: 2025-12-06

-- Add new columns to risk_records table
ALTER TABLE risk_records ADD COLUMN IF NOT EXISTS risk_id TEXT UNIQUE;
ALTER TABLE risk_records ADD COLUMN IF NOT EXISTS objectives TEXT;
ALTER TABLE risk_records ADD COLUMN IF NOT EXISTS process_key_activity TEXT;
ALTER TABLE risk_records ADD COLUMN IF NOT EXISTS risk_title TEXT;
ALTER TABLE risk_records ADD COLUMN IF NOT EXISTS risk_description TEXT;
ALTER TABLE risk_records ADD COLUMN IF NOT EXISTS root_causes TEXT;
ALTER TABLE risk_records ADD COLUMN IF NOT EXISTS risk_impact TEXT;
ALTER TABLE risk_records ADD COLUMN IF NOT EXISTS existing_risk_control TEXT;
ALTER TABLE risk_records ADD COLUMN IF NOT EXISTS potential_risk_response TEXT;
ALTER TABLE risk_records ADD COLUMN IF NOT EXISTS level_of_impact NUMERIC(5, 2);
ALTER TABLE risk_records ADD COLUMN IF NOT EXISTS control_effectiveness_score NUMERIC(5, 2);
ALTER TABLE risk_records ADD COLUMN IF NOT EXISTS justification TEXT;
ALTER TABLE risk_records ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;

-- Update existing records to have risk_title from description or risk_type
UPDATE risk_records SET risk_title = COALESCE(description, risk_type, 'Untitled Risk') WHERE risk_title IS NULL;
UPDATE risk_records SET level_of_impact = impact WHERE level_of_impact IS NULL;

-- Make risk_title NOT NULL after populating
ALTER TABLE risk_records ALTER COLUMN risk_title SET NOT NULL;
ALTER TABLE risk_records ALTER COLUMN level_of_impact SET NOT NULL;

-- Create risk_collaborators table
CREATE TABLE IF NOT EXISTS risk_collaborators (
  id SERIAL PRIMARY KEY,
  risk_id INTEGER NOT NULL REFERENCES risk_records(id) ON DELETE CASCADE,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(risk_id, user_id)
);

-- Create rcsa_assessments table
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
);

-- Create risk_response_progress table
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
);

-- Create department_codes table
CREATE TABLE IF NOT EXISTS department_codes (
  id SERIAL PRIMARY KEY,
  department_name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert department codes
INSERT INTO department_codes (department_name, code, description) VALUES
  ('Credit Management Office', 'CR', 'Manages credit risk and loan portfolios'),
  ('Corporate Strategy', 'CS', 'Strategic planning and corporate development'),
  ('Digital Banking', 'DB', 'Digital channels and online banking services'),
  ('Facility Management', 'FM', 'Building and facility operations'),
  ('Finance Office', 'FO', 'Financial management and accounting'),
  ('Human Capital', 'HC', 'Human resources and talent management'),
  ('IFB', 'IF', 'International Finance and Banking'),
  ('Information & IT Service', 'IT', 'Information technology and systems'),
  ('Internal Audit', 'IA', 'Internal audit and compliance monitoring'),
  ('Legal Service', 'LS', 'Legal affairs and regulatory compliance'),
  ('Marketing Office', 'MO', 'Marketing and brand management'),
  ('Retail & SME', 'RS', 'Retail banking and SME services'),
  ('Risk & Compliance', 'RC', 'Risk management and regulatory compliance'),
  ('Transformation Office', 'TO', 'Business transformation initiatives'),
  ('Trade Service', 'TS', 'Trade finance and international trade'),
  ('Wholesale Banking', 'WS', 'Corporate and wholesale banking services')
ON CONFLICT (department_name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_risk_records_risk_id ON risk_records(risk_id);
CREATE INDEX IF NOT EXISTS idx_risk_records_department ON risk_records(department);
CREATE INDEX IF NOT EXISTS idx_risk_records_is_deleted ON risk_records(is_deleted);
CREATE INDEX IF NOT EXISTS idx_risk_collaborators_risk_id ON risk_collaborators(risk_id);
CREATE INDEX IF NOT EXISTS idx_risk_collaborators_user_id ON risk_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_rcsa_assessments_risk_id ON rcsa_assessments(risk_id);
CREATE INDEX IF NOT EXISTS idx_risk_response_progress_risk_id ON risk_response_progress(risk_id);

-- Add comments
COMMENT ON COLUMN risk_records.risk_id IS 'Alphanumeric risk ID (e.g., CR-01, IT-05)';
COMMENT ON COLUMN risk_records.is_deleted IS 'Soft delete flag to maintain ID sequence';
COMMENT ON TABLE risk_collaborators IS 'Many-to-many relationship between risks and collaborating users';
COMMENT ON TABLE rcsa_assessments IS 'Risk & Control Self-Assessment records';
COMMENT ON TABLE risk_response_progress IS 'Progress tracking for agreed risk response actions';
