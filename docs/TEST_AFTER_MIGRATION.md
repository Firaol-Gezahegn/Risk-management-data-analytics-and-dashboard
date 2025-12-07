# Testing Guide - After Migration

## ⚠️ IMPORTANT: Run Migration First!

Before you can see the new features, you MUST run the database migration:

```bash
npm run migrate
```

## What You Should See After Migration

### 1. Enhanced Risk Form
When you click "Add New Risk", you should see:
- ✅ **4 Tabs**: Basic Info | Assessment | Controls | Response
- ✅ **New Fields**: Risk Title, Objectives, Process/Key Activity, Root Causes, etc.
- ✅ **Real-time Calculation**: Enter Likelihood & Impact → See auto-calculated risk score
- ✅ **Color-coded Badges**: Risk ratings with colors (Green, Blue, Yellow, Orange, Red)

### 2. Auto-Generated Risk IDs
- Create a risk with department "Information & IT Service"
- After saving, the risk should have ID: **IT-01**
- Create another risk in same department → **IT-02**
- Create risk in "Credit Management Office" → **CR-01**

### 3. Risk Scoring
- Enter Likelihood: **80**
- Enter Impact: **90**
- You should see:
  - **Inherent Risk Score**: ~75 (calculated automatically)
  - **Rating Badge**: "Very High" (red color)
- Add Control Effectiveness: **60**
- You should see:
  - **Residual Risk Score**: ~30 (calculated automatically)
  - **Rating Badge**: "Medium" (yellow color)

### 4. Active Directory Login (if configured)
- On login page, you should see:
  - Regular email/password fields
  - **"Sign in with Active Directory" button** (if AD is configured in .env)

## If You Don't See These Features

### Problem: Old form still showing
**Solution**: Clear browser cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Problem: Migration errors
**Solution**: Check the error message and see MIGRATION_GUIDE.md

### Problem: "Column does not exist" errors
**Solution**: Migration didn't run successfully. Try:
```bash
npm run migrate
```

### Problem: Risk ID not generating
**Solution**: 
1. Check migration ran successfully
2. Verify department_codes table exists:
```sql
SELECT * FROM department_codes;
```

### Problem: Scores not calculating
**Solution**:
1. Check browser console for errors (F12)
2. Verify backend is running
3. Check network tab for failed API calls

## Quick Verification Checklist

After running migration, verify:

- [ ] Database migration completed without errors
- [ ] Application starts without errors (`npm run dev`)
- [ ] Login page loads
- [ ] Can navigate to "Add New Risk"
- [ ] Form has 4 tabs (Basic Info, Assessment, Controls, Response)
- [ ] Can enter Risk Title field
- [ ] Can enter Likelihood and Impact
- [ ] Risk score calculates automatically
- [ ] Can save risk
- [ ] Risk appears in list with auto-generated ID

## Common Issues

### Issue: "riskTitle is required" error
This means the migration added the new column but your form data doesn't include it.
**Fix**: The new form includes this field - make sure you're using the updated form.

### Issue: Tabs not showing
**Fix**: Clear browser cache, the Tabs component might not be loaded.

### Issue: Badge component error
**Fix**: The Badge UI component was added - restart the dev server.

## Need More Help?

See these files:
- `MIGRATION_GUIDE.md` - Migration troubleshooting
- `QUICK_START.md` - Quick start guide
- `SETUP_GUIDE.md` - Complete setup instructions
