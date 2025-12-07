# Database Migration Guide

## Quick Migration (Recommended)

Run the automated migration script:

```bash
npm run migrate
```

This will:
- ✅ Add all new columns to risk_records table
- ✅ Create 4 new tables (collaborators, RCSA, progress, department codes)
- ✅ Insert 16 department codes
- ✅ Create performance indexes
- ✅ Update existing records

## Alternative: Manual SQL Migration

If the automated script doesn't work, you can run the SQL file manually:

```bash
psql -U postgres -d aw_rdm -f migrations/001_add_new_features.sql
```

## Alternative: Drizzle Push

You can also use Drizzle's push command (may prompt for confirmations):

```bash
npm run db:push
```

## Verify Migration

After running the migration, verify it worked:

```sql
-- Check new columns exist
\d risk_records

-- Check new tables exist
\dt

-- Check department codes were inserted
SELECT * FROM department_codes;
```

## Troubleshooting

### Error: "relation already exists"
This is normal if you run the migration twice. The script uses `IF NOT EXISTS` to prevent errors.

### Error: "column already exists"
This is also normal. The script uses `ADD COLUMN IF NOT EXISTS` to be safe.

### Error: "permission denied"
Make sure your database user has CREATE TABLE and ALTER TABLE permissions.

### Error: "database connection failed"
Check your DATABASE_URL in .env file:
```
DATABASE_URL=postgresql://postgres:Fira%40123@localhost:5432/aw_rdm
```

## After Migration

1. Restart your application:
   ```bash
   npm run dev
   ```

2. Test the new features:
   - Create a new risk
   - Verify risk ID is auto-generated (e.g., IT-01)
   - Test risk scoring calculation
   - Add collaborators

## Rollback (if needed)

If you need to rollback the migration:

```sql
-- Remove new tables
DROP TABLE IF EXISTS risk_response_progress CASCADE;
DROP TABLE IF EXISTS rcsa_assessments CASCADE;
DROP TABLE IF EXISTS risk_collaborators CASCADE;
DROP TABLE IF EXISTS department_codes CASCADE;

-- Remove new columns (optional - will lose data)
ALTER TABLE risk_records DROP COLUMN IF EXISTS risk_id;
ALTER TABLE risk_records DROP COLUMN IF EXISTS objectives;
-- ... (drop other columns as needed)
```

**Note:** Rollback will delete all data in the new tables!
