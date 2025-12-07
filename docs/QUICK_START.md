# Quick Start - Run This Now!

## Step 1: Run the Migration

Choose ONE of these methods:

### Method A: Automated Script (Easiest) ⭐
```bash
npm run migrate
```

### Method B: Manual SQL
```bash
psql -U postgres -d aw_rdm -f migrations/001_add_new_features.sql
```

### Method C: Drizzle Push
```bash
npm run db:push
```

## Step 2: Start the Application

```bash
npm run dev
```

## Step 3: Test It Works

1. Open http://localhost:5000
2. Login with your credentials
3. Go to "Risks" → "Add New Risk"
4. Fill in the form and submit
5. Check that the Risk ID is auto-generated (e.g., IT-01, CR-02)

## That's It! ✅

Your application now has:
- ✅ Auto-generated Risk IDs
- ✅ 5×5 Risk Scoring Matrix
- ✅ Enhanced Risk Form (17 fields)
- ✅ Collaborators System
- ✅ RCSA Tracking
- ✅ Active Directory Login (optional)

## If Migration Fails

Check the error message and see MIGRATION_GUIDE.md for troubleshooting.

Common issues:
- Database not running → Start PostgreSQL
- Wrong credentials → Check .env file
- Permission denied → Grant CREATE TABLE permission

## Need Help?

See these files:
- `MIGRATION_GUIDE.md` - Detailed migration help
- `SETUP_GUIDE.md` - Complete setup instructions
- `DELIVERY_SUMMARY.txt` - What was implemented
