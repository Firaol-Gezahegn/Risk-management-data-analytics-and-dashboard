# Final Checklist - Why Risks Aren't Showing

## Quick Diagnosis

Run these commands to diagnose the issue:

### 1. Check if risks exist in database
```bash
node check-deleted-risks.js
```

**Expected:** Should show 1 active risk (WS-01)

### 2. Check server is running
```bash
# In terminal, you should see:
# serving on port 5000
```

### 3. Check browser console
1. Open browser (F12)
2. Go to Console tab
3. Look for errors in red

### 4. Check Network tab
1. Open browser (F12)
2. Go to Network tab
3. Navigate to /risks page
4. Look for `/api/risks` request
5. Check if it returns 200 OK
6. Click on it and see the Response

## Common Issues & Fixes

### Issue 1: API Returns Empty Array `[]`
**Cause:** All risks are soft-deleted or filtered out

**Fix:**
```bash
# Check deleted risks
node check-deleted-risks.js

# If you see soft-deleted risks, clean them
node clean-database.js
```

### Issue 2: API Returns 401 Unauthorized
**Cause:** Not logged in or token expired

**Fix:**
1. Logout
2. Login again as admin@awashbank.com
3. Try again

### Issue 3: API Returns 500 Error
**Cause:** Server error (check terminal logs)

**Fix:**
1. Look at terminal where `npm run dev` is running
2. Check for error messages
3. Restart server if needed

### Issue 4: Network Error / No Response
**Cause:** Server not running or wrong port

**Fix:**
```bash
# Stop server (Ctrl+C)
# Start again
npm run dev
```

### Issue 5: Browser Shows Old Data
**Cause:** Browser cache

**Fix:**
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Or clear browser cache completely
3. Or open in Incognito/Private mode

## Step-by-Step Debugging

### Step 1: Verify Database
```bash
node check-deleted-risks.js
```

You should see:
```
✅ Active risks (is_deleted = false): 1
   ID: 23, Risk ID: WS-01, Title: Weak wholesale customer acquisition...
```

### Step 2: Verify Server Running
Check terminal - should show:
```
serving on port 5000
```

### Step 3: Test Login
1. Go to http://localhost:5000/login
2. Login as: `admin@awashbank.com`
3. Should redirect to dashboard

### Step 4: Check Risks Page
1. Click "Risks" in sidebar
2. Should show URL: http://localhost:5000/risks
3. Should see table with WS-01 risk

### Step 5: Check Browser Console
Press F12, go to Console tab:
- ✅ No errors = Good
- ❌ Red errors = Problem (copy the error message)

### Step 6: Check Network Tab
Press F12, go to Network tab:
1. Refresh page
2. Look for `/api/risks` request
3. Click on it
4. Check "Response" tab
5. Should see JSON array with risk data

## Manual API Test

Open browser console (F12) and run:

```javascript
// Get token from localStorage
const token = localStorage.getItem('auth_token');
console.log('Token:', token);

// Fetch risks
fetch('/api/risks', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => console.log('Risks:', data))
.catch(err => console.error('Error:', err));
```

**Expected output:**
```javascript
Risks: [{
  id: 23,
  riskId: "WS-01",
  riskTitle: "Weak wholesale customer acquisition and retention",
  department: "Wholesale Banking",
  isDeleted: false,
  ...
}]
```

## If Still Not Working

### Check These Files Exist:
- ✅ `client/src/pages/risks.tsx`
- ✅ `client/src/pages/risk-form.tsx` (updated version)
- ✅ `server/routes.ts` (with new endpoints)
- ✅ `server/storage.ts` (with soft delete logic)

### Verify Migration Ran:
```bash
node verify-migration.js
```

Should show:
```
✅ New columns in risk_records
✅ New tables created
✅ Department codes inserted
```

### Check Server Logs:
Look at terminal where `npm run dev` is running.
When you navigate to /risks page, you should see:
```
GET /api/risks 200 in XXms
```

If you see 500 error, there's a server problem.

## Emergency Reset

If nothing works, try this:

### 1. Stop Server
```bash
Ctrl+C
```

### 2. Clean Soft-Deleted Risks
```bash
node clean-database.js
```

### 3. Restart Server
```bash
npm run dev
```

### 4. Clear Browser Cache
```bash
Ctrl+Shift+R
```

### 5. Login Fresh
1. Logout
2. Login as admin@awashbank.com
3. Go to /risks

## Get Detailed Logs

Add this to see what's happening:

1. Open `server/routes.ts`
2. Find the `/api/risks` endpoint
3. Add console.log:

```typescript
app.get("/api/risks", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    console.log('📊 Fetching risks for user:', req.userId, 'role:', req.userRole, 'dept:', req.userDepartment);
    
    const risks = await storage.getAllRiskRecords({
      department: req.userDepartment,
      role: req.userRole,
    });
    
    console.log('📊 Found risks:', risks.length);
    res.json(risks);
  } catch (error) {
    console.error('❌ Error fetching risks:', error);
    res.status(500).json({ message: "Server error" });
  }
});
```

Then check terminal logs when you visit /risks page.

## Contact Info

If you're still stuck, provide:
1. Browser console errors (F12 → Console)
2. Network tab response (F12 → Network → /api/risks)
3. Server terminal logs
4. Output of `node check-deleted-risks.js`
