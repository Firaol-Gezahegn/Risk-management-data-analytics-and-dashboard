# Quick Fix Guide - Access Control Issues

**ONE COMMAND TO FIX EVERYTHING:**

## Quick Fix (Recommended)

```bash
node fix-all.js
```

This comprehensive script will:
- ✅ Fix all user roles (admin, risk_manager, chief_office, user)
- ✅ Ensure all users have departments
- ✅ Fix risk department mismatches
- ✅ Fix WS-01 risk specifically
- ✅ Restore deleted risks
- ✅ Show verification summary

Then restart:
```bash
npm start
```

---

## Alternative: Step-by-Step Fix

If you prefer to run fixes individually:

### Step 1: Check Risk Departments

```bash
node check-risk-departments.js
```

This will:
- ✅ Show all risks and their departments
- ✅ Show all users and their departments
- ✅ Identify department mismatches
- ✅ Suggest fixes

### Step 2: Fix WS-01 Risk (if needed)

```bash
node fix-ws01-risk.js
```

This will:
- ✅ Find WS-01 risk
- ✅ Update department to match Wholesale Banking users
- ✅ Restore if marked as deleted
- ✅ Show who should see the risk

### Step 3: Fix User Roles in Database

```bash
node fix-user-roles.js
```

This will:
- ✅ Update all users to correct roles (admin, risk_manager, chief_office, user)
- ✅ Ensure all users have departments
- ✅ Show summary of changes

### Step 4: Restart Server

```bash
npm start
```

## Step 3: Test Login

### Test Admin:
```
Email: admin@awashbank.com
Password: admin123
Expected: See all risks, Admin tab, Reports tab
```

### Test Risk Manager:
```
Email: riskmanagement@awashbank.com
Password: password123
Expected: See all risks, Reports tab, NO Admin tab
```

### Test Finance Chief:
```
Email: finance@awashbank.com
Password: password123
Expected: See ONLY Finance risks, NO Reports tab, NO Admin tab
```

### Test IT Chief:
```
Email: informationtechnology@awashbank.com
Password: password123
Expected: See ONLY IT risks, NO Reports tab, NO Admin tab
```

## What's Fixed:

✅ **Navigation** - Chiefs see correct menu items (no Admin tab)  
✅ **Department Isolation** - Each chief sees only their department  
✅ **Dashboard Stats** - Shows correct numbers for each department  
✅ **Risk List** - Filtered by department  
✅ **Reports Tab** - Only visible to admin & risk_manager  
✅ **Admin Tab** - Only visible to admin  

## If Issues Persist:

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh** (Ctrl+Shift+R)
3. **Logout and login again**
4. **Check browser console** (F12) for errors

## Verification:

After login, check:
- [ ] Navigation shows correct items for your role
- [ ] Dashboard shows correct department stats
- [ ] Risk list shows only your department's risks
- [ ] Cannot see other departments' risks

## Need Help?

See detailed documentation:
- `docs/ACCESS_CONTROL_IMPLEMENTATION.md` - Complete implementation details
- `docs/ACCESS_CONTROL_RULES.md` - Access control rules
- `docs/LOGIN_CREDENTIALS.md` - All user credentials

---

**Status:** ✅ All fixes implemented and ready to test
