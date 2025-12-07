# Fix Common Errors

## Error: "Cannot read properties of undefined (reading 'score')"

**Cause:** The database migration hasn't been run yet, so the new API endpoints don't work.

**Solution:** Run the migration!

### Step 1: Stop the Server
Press `Ctrl+C` in the terminal

### Step 2: Run Migration
```bash
npm run migrate
```

You should see:
```
Starting migration...
Adding new columns to risk_records...
Creating risk_collaborators table...
Creating rcsa_assessments table...
Creating risk_response_progress table...
Creating department_codes table...
Inserting department codes...
Creating indexes...
✅ Migration completed successfully!
```

### Step 3: Start Server Again
```bash
npm run dev
```

### Step 4: Test
1. Go to http://localhost:5000
2. Login
3. Click "Add New Risk"
4. Fill in:
   - Risk Title: "Test Risk"
   - Department: "Information & IT Service"
   - Likelihood: 80
   - Impact: 90
5. You should see the risk score calculate automatically!

## Error: "listen EADDRINUSE: address already in use"

**Cause:** Port 5000 is already in use by another process.

**Solution:**

### Option 1: Find and close other terminal windows
Look for other PowerShell/CMD windows running the server

### Option 2: Kill the process
```powershell
# Find process on port 5000
netstat -ano | findstr :5000

# Kill it (replace 12345 with actual PID)
taskkill /PID 12345 /F
```

### Option 3: Use different port
Add to `.env`:
```
PORT=5001
```

## Error: Migration fails with "permission denied"

**Cause:** Database user doesn't have CREATE TABLE permission.

**Solution:**
1. Connect to PostgreSQL as admin:
```bash
psql -U postgres
```

2. Grant permissions:
```sql
GRANT ALL PRIVILEGES ON DATABASE aw_rdm TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
```

## Error: "relation 'risk_records' does not exist"

**Cause:** Database is empty or wrong database.

**Solution:**
1. Check DATABASE_URL in `.env`
2. Make sure database exists:
```bash
psql -U postgres -l
```
3. If database doesn't exist, create it:
```bash
psql -U postgres -c "CREATE DATABASE aw_rdm;"
```
4. Run the original schema setup (if you have one)
5. Then run the migration

## Error: "column 'risk_title' does not exist"

**Cause:** Migration didn't complete successfully.

**Solution:**
1. Check migration output for errors
2. Try running migration again:
```bash
npm run migrate
```
3. If it fails, run the SQL file manually:
```bash
psql -U postgres -d aw_rdm -f migrations/001_add_new_features.sql
```

## Error: Form shows but no tabs

**Cause:** Browser cache has old version.

**Solution:**
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Or clear browser cache completely
3. Restart the dev server

## Error: "Cannot find module '@/components/ui/tabs'"

**Cause:** New UI components not loaded.

**Solution:**
1. Restart the dev server:
```bash
# Stop with Ctrl+C
npm run dev
```
2. If still failing, check that these files exist:
   - `client/src/components/ui/tabs.tsx`
   - `client/src/components/ui/badge.tsx`
   - `client/src/components/ui/separator.tsx`

## Still Having Issues?

### Check Migration Status
```sql
-- Connect to database
psql -U postgres -d aw_rdm

-- Check if new columns exist
\d risk_records

-- Check if new tables exist
\dt

-- Check department codes
SELECT * FROM department_codes;
```

### Check Server Logs
Look at the terminal where you ran `npm run dev` for error messages.

### Check Browser Console
1. Press F12
2. Go to Console tab
3. Look for red error messages

### Verify Files Exist
Make sure these files were created:
- `server/migrate.ts`
- `server/auth-ad.ts`
- `server/risk-id-generator.ts`
- `shared/risk-scoring.ts`
- `shared/schema-additions.ts`
- `client/src/components/ui/tabs.tsx`
- `client/src/components/ui/badge.tsx`
- `client/src/pages/risk-form.tsx` (updated version)

## Quick Checklist

Before reporting issues, verify:
- [ ] Migration ran successfully (`npm run migrate`)
- [ ] Server starts without errors (`npm run dev`)
- [ ] Database connection works (check DATABASE_URL)
- [ ] Browser cache cleared (Ctrl+Shift+R)
- [ ] No other instance running on port 5000
- [ ] All new files exist in the project

## Get Help

If you're still stuck:
1. Check the error message carefully
2. Look in `MIGRATION_GUIDE.md` for detailed troubleshooting
3. Check `TEST_AFTER_MIGRATION.md` for what to expect
4. Review `QUICK_START.md` for the basic steps
