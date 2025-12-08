# Access Control Rules - Awash Bank Risk Management Dashboard

**Last Updated:** December 8, 2025

---

## Overview

The system implements strict role-based access control (RBAC) with department-level isolation to ensure users only see and manage risks within their scope of responsibility.

---

## Role Definitions

### 1. Admin (`admin`)
**Full System Access**

**Can:**
- ✅ View ALL risks from ALL departments
- ✅ Create risks for ANY department
- ✅ Edit ANY risk
- ✅ Delete ANY risk
- ✅ Access Admin panel
- ✅ Manage users
- ✅ View Reports
- ✅ Import/Export data
- ✅ View all dashboard statistics

**Navigation:**
- Dashboard
- Risk Register
- Excel Import
- Reports
- Admin

**Example User:** `admin@awashbank.com`

---

### 2. Risk Manager (`risk_manager`)
**Full Risk Management Access**

**Can:**
- ✅ View ALL risks from ALL departments
- ✅ Create risks for ANY department
- ✅ Edit ANY risk
- ✅ Delete ANY risk
- ✅ View Reports
- ✅ Import/Export data
- ✅ View all dashboard statistics

**Cannot:**
- ❌ Access Admin panel
- ❌ Manage users

**Navigation:**
- Dashboard
- Risk Register
- Excel Import
- Reports

**Example User:** `riskmanagement@awashbank.com`

---

### 3. Chief Office (`chief_office`)
**Department-Level Access**

**Can:**
- ✅ View ONLY their department's risks
- ✅ Create risks ONLY for their department
- ✅ Edit ONLY their department's risks
- ✅ Delete ONLY their department's risks
- ✅ Import/Export their department's data
- ✅ View dashboard (filtered to their department)

**Cannot:**
- ❌ See other departments' risks
- ❌ Create risks for other departments
- ❌ Edit other departments' risks
- ❌ Access Reports
- ❌ Access Admin panel

**Navigation:**
- Dashboard
- Risk Register
- Excel Import

**Example Users:**
- `finance@awashbank.com` - See only Finance risks
- `informationtechnology@awashbank.com` - See only IT risks
- `wholesalebanking@awashbank.com` - See only Wholesale risks

---

### 4. User (`user`)
**Read-Only Access**

**Can:**
- ✅ View their department's risks (read-only)
- ✅ View dashboard (filtered to their department)

**Cannot:**
- ❌ Create risks
- ❌ Edit risks
- ❌ Delete risks
- ❌ Import/Export data
- ❌ Access Reports
- ❌ Access Admin panel

**Navigation:**
- Dashboard
- Risk Register (view only)

---

## Department Isolation Examples

### Example 1: Finance Chief Office User

**Login:** `finance@awashbank.com`

**What they see:**
- Dashboard showing ONLY Finance department statistics
- Risk Register showing ONLY risks where `department = "Finance"`
- Can create new risks, but department field is locked to "Finance"

**What they DON'T see:**
- Wholesale Banking risks
- Information Technology risks
- Any other department's risks

---

### Example 2: Wholesale Banking Chief Office User

**Login:** `wholesalebanking@awashbank.com`

**What they see:**
- Dashboard showing ONLY Wholesale Banking statistics
- Risk Register showing ONLY risks where `department = "Wholesale Banking"`
- Risk IDs like WS-01, WS-02, WS-03

**What they DON'T see:**
- Finance risks (FN-01, FN-02)
- IT risks (IT-01, IT-02)
- Any other department's risks

---

### Example 3: Admin User

**Login:** `admin@awashbank.com`

**What they see:**
- Dashboard showing ALL departments' statistics
- Risk Register showing ALL risks from ALL departments
- Can filter by department or see all
- Risk IDs from all departments (WS-01, FN-01, IT-01, etc.)

---

### Example 4: Risk Manager User

**Login:** `riskmanagement@awashbank.com`

**What they see:**
- Same as Admin for risk management
- Dashboard showing ALL departments' statistics
- Risk Register showing ALL risks
- Can create/edit/delete any risk

**What they DON'T see:**
- Admin panel (user management)

---

## Access Control Implementation

### Backend (Server-Side)

**API Endpoint Filtering:**
```typescript
// GET /api/risks
// Automatically filters based on user role and department

if (user.role === 'admin' || user.role === 'risk_manager') {
  // Return ALL risks
  return allRisks;
} else if (user.role === 'chief_office') {
  // Return only user's department risks
  return risks.filter(r => r.department === user.department);
} else {
  // Read-only users see their department
  return risks.filter(r => r.department === user.department);
}
```

**Risk Creation:**
```typescript
// POST /api/risks
// Validates department access

if (user.role === 'chief_office') {
  // Can only create for their department
  if (riskData.department !== user.department) {
    return 403 Forbidden;
  }
}
```

**Risk Editing:**
```typescript
// PUT /api/risks/:id
// Validates edit permission

const risk = await getRisk(id);

if (user.role === 'chief_office') {
  // Can only edit their department's risks
  if (risk.department !== user.department) {
    return 403 Forbidden;
  }
}
```

### Frontend (Client-Side)

**Navigation Filtering:**
```typescript
// Sidebar shows different items based on role
const navigationItems = [
  { title: "Dashboard", roles: ["admin", "risk_manager", "chief_office", "user"] },
  { title: "Risk Register", roles: ["admin", "risk_manager", "chief_office", "user"] },
  { title: "Excel Import", roles: ["admin", "risk_manager", "chief_office"] },
  { title: "Reports", roles: ["admin", "risk_manager"] }, // Only admin & risk_manager
  { title: "Admin", roles: ["admin"] }, // Only admin
];
```

**Department Field:**
```typescript
// In risk form for chief_office users
if (user.role === 'chief_office') {
  // Department field is disabled and locked to user's department
  <Input value={user.department} disabled />
}
```

---

## Testing Access Control

### Test 1: Department Isolation

1. **Login as Finance Chief:**
   - Email: `finance@awashbank.com`
   - Password: `password123`

2. **Create a risk:**
   - Department should be locked to "Finance"
   - Risk ID will be FN-01, FN-02, etc.

3. **Logout and login as IT Chief:**
   - Email: `informationtechnology@awashbank.com`
   - Password: `password123`

4. **Verify:**
   - ❌ Should NOT see Finance risks
   - ✅ Should only see IT risks
   - Department locked to "Information Technology"

### Test 2: Admin Access

1. **Login as Admin:**
   - Email: `admin@awashbank.com`
   - Password: `admin123`

2. **Verify:**
   - ✅ See ALL risks from ALL departments
   - ✅ Can create risk for ANY department
   - ✅ Can edit ANY risk
   - ✅ See "Admin" tab in navigation
   - ✅ See "Reports" tab in navigation

### Test 3: Risk Manager Access

1. **Login as Risk Manager:**
   - Email: `riskmanagement@awashbank.com`
   - Password: `password123`

2. **Verify:**
   - ✅ See ALL risks from ALL departments
   - ✅ Can create risk for ANY department
   - ✅ See "Reports" tab in navigation
   - ❌ Should NOT see "Admin" tab

---

## Security Notes

### Database Level
- All queries use parameterized statements (SQL injection prevention)
- Soft delete (risks marked as deleted, not removed)
- Audit trail with created_by and timestamps

### API Level
- JWT token authentication required for all endpoints
- Token includes userId, role, and department
- Middleware validates token on every request
- Access control checked before any database operation

### Frontend Level
- Navigation filtered by role
- Forms disabled/hidden based on permissions
- Department field locked for chief_office users
- All data fetching respects user permissions

---

## Troubleshooting

### Issue: Chief Office user sees other departments' risks

**Cause:** Token might have wrong department or role

**Solution:**
1. Logout and login again
2. Check user record in database:
   ```sql
   SELECT email, role, department FROM users WHERE email = 'user@email.com';
   ```
3. Verify department name matches exactly (case-sensitive)

### Issue: User cannot create risks

**Cause:** User role is 'user' (read-only)

**Solution:**
- Change role to 'chief_office' for department users
- Or 'risk_manager' for risk team members

### Issue: Reports tab not showing

**Expected:** Only Admin and Risk Manager see Reports

**Solution:**
- This is correct behavior
- Chief Office users should NOT see Reports tab

---

## Summary Table

| Feature | Admin | Risk Manager | Chief Office | User |
|---------|-------|--------------|--------------|------|
| View All Risks | ✅ | ✅ | ❌ | ❌ |
| View Own Dept | ✅ | ✅ | ✅ | ✅ |
| Create Risk (Any Dept) | ✅ | ✅ | ❌ | ❌ |
| Create Risk (Own Dept) | ✅ | ✅ | ✅ | ❌ |
| Edit Any Risk | ✅ | ✅ | ❌ | ❌ |
| Edit Own Dept | ✅ | ✅ | ✅ | ❌ |
| Delete Any Risk | ✅ | ✅ | ❌ | ❌ |
| Delete Own Dept | ✅ | ✅ | ✅ | ❌ |
| Excel Import | ✅ | ✅ | ✅ | ❌ |
| Reports | ✅ | ✅ | ❌ | ❌ |
| Admin Panel | ✅ | ❌ | ❌ | ❌ |
| Manage Users | ✅ | ❌ | ❌ | ❌ |

---

**For Support:** itsupport@awashbank.com
