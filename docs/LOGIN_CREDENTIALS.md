# Login Credentials - Awash Bank Risk Management Dashboard

**Default Password for All Users:** `password123`

---

## Admin Account

**Email:** `admin@awashbank.com`  
**Password:** `admin123`  
**Role:** Administrator  
**Access:** Full system access

---

## Department Chief Office Users

All department users have the role `chief_office` and can only access risks in their department.

### 1. Wholesale Banking
**Email:** `wholesalebanking@awashbank.com`  
**Password:** `password123`  
**Department:** Wholesale Banking

### 2. Retail Banking
**Email:** `retailbanking@awashbank.com`  
**Password:** `password123`  
**Department:** Retail Banking

### 3. International Banking
**Email:** `internationalbanking@awashbank.com`  
**Password:** `password123`  
**Department:** International Banking

### 4. Treasury and Investment
**Email:** `treasuryinvestment@awashbank.com`  
**Password:** `password123`  
**Department:** Treasury and Investment

### 5. Finance
**Email:** `finance@awashbank.com`  
**Password:** `password123`  
**Department:** Finance

### 6. Risk Management
**Email:** `riskmanagement@awashbank.com`  
**Password:** `password123`  
**Department:** Risk Management

### 7. Compliance
**Email:** `compliance@awashbank.com`  
**Password:** `password123`  
**Department:** Compliance

### 8. Internal Audit
**Email:** `internalaudit@awashbank.com`  
**Password:** `password123`  
**Department:** Internal Audit

### 9. Human Resources
**Email:** `humanresources@awashbank.com`  
**Password:** `password123`  
**Department:** Human Resources

### 10. Information Technology
**Email:** `informationtechnology@awashbank.com`  
**Password:** `password123`  
**Department:** Information Technology

### 11. Operations
**Email:** `operations@awashbank.com`  
**Password:** `password123`  
**Department:** Operations

### 12. Legal
**Email:** `legal@awashbank.com`  
**Password:** `password123`  
**Department:** Legal

### 13. Marketing and Corporate Communications
**Email:** `marketingcorporatecommunications@awashbank.com`  
**Password:** `password123`  
**Department:** Marketing and Corporate Communications

### 14. Strategy and Business Development
**Email:** `strategybusinessdevelopment@awashbank.com`  
**Password:** `password123`  
**Department:** Strategy and Business Development

### 15. Credit
**Email:** `credit@awashbank.com`  
**Password:** `password123`  
**Department:** Credit

### 16. Branch Network
**Email:** `branchnetwork@awashbank.com`  
**Password:** `password123`  
**Department:** Branch Network

---

## Quick Reference Table

| # | Department | Email | Password |
|---|------------|-------|----------|
| 1 | Wholesale Banking | wholesalebanking@awashbank.com | password123 |
| 2 | Retail Banking | retailbanking@awashbank.com | password123 |
| 3 | International Banking | internationalbanking@awashbank.com | password123 |
| 4 | Treasury and Investment | treasuryinvestment@awashbank.com | password123 |
| 5 | Finance | finance@awashbank.com | password123 |
| 6 | Risk Management | riskmanagement@awashbank.com | password123 |
| 7 | Compliance | compliance@awashbank.com | password123 |
| 8 | Internal Audit | internalaudit@awashbank.com | password123 |
| 9 | Human Resources | humanresources@awashbank.com | password123 |
| 10 | Information Technology | informationtechnology@awashbank.com | password123 |
| 11 | Operations | operations@awashbank.com | password123 |
| 12 | Legal | legal@awashbank.com | password123 |
| 13 | Marketing & Corporate Comms | marketingcorporatecommunications@awashbank.com | password123 |
| 14 | Strategy & Business Dev | strategybusinessdevelopment@awashbank.com | password123 |
| 15 | Credit | credit@awashbank.com | password123 |
| 16 | Branch Network | branchnetwork@awashbank.com | password123 |

---

## Creating Department Users

If the users don't exist yet, run this command:

```bash
node create-department-users.js
```

This will create all 16 department chief users with the credentials listed above.

---

## Testing Access Control

### Test 1: Department Isolation
1. Login as `informationtechnology@awashbank.com`
2. Create a risk - it should get ID `IT-01`
3. Logout and login as `credit@awashbank.com`
4. You should NOT see the IT risk
5. Create a risk - it should get ID `CR-01`

### Test 2: Admin Access
1. Login as `admin@awashbank.com`
2. You should see ALL risks from ALL departments
3. You can create, edit, and delete any risk

### Test 3: Risk Manager Access
If you have a risk manager user:
1. They can see all risks across departments
2. They can create, edit, and delete any risk
3. They cannot manage users or system settings

---

## Password Reset

To reset a user's password:

```sql
-- Connect to database
psql $DATABASE_URL

-- Reset password to 'newpassword123'
UPDATE users 
SET password_hash = '$2a$10$YourBcryptHashHere'
WHERE email = 'user@awashbank.com';
```

Or use bcrypt to generate hash:
```javascript
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('newpassword123', 10);
console.log(hash);
```

---

## Security Notes

⚠️ **IMPORTANT FOR PRODUCTION:**

1. **Change Default Passwords** - All users should change their passwords on first login
2. **Use Strong Passwords** - Minimum 8 characters, mix of letters, numbers, symbols
3. **Enable MFA** - Consider implementing multi-factor authentication
4. **Regular Password Rotation** - Enforce password changes every 90 days
5. **Monitor Access** - Review login logs regularly
6. **Disable Inactive Accounts** - Deactivate users who leave the organization

---

## Troubleshooting

### Cannot Login

**Problem:** "Invalid credentials" error

**Solutions:**
1. Verify email is typed correctly (no spaces)
2. Check password is exactly `password123` (case-sensitive)
3. Ensure users were created: `node create-department-users.js`
4. Check database connection
5. Verify user exists in database:
   ```sql
   SELECT email, role, department FROM users WHERE email = 'your@email.com';
   ```

### Users Not Created

**Problem:** Running `create-department-users.js` fails

**Solutions:**
1. Check `.env` file has correct `DATABASE_URL`
2. Verify PostgreSQL is running
3. Check database exists
4. Review error messages in console

### Wrong Department Access

**Problem:** User sees wrong department's risks

**Solutions:**
1. Verify user's department in database:
   ```sql
   SELECT email, department FROM users WHERE email = 'user@email.com';
   ```
2. Check department name matches exactly (case-sensitive)
3. Logout and login again to refresh token

---

**Document Created:** December 8, 2025  
**Last Updated:** December 8, 2025

For support, contact: itsupport@awashbank.com


---

## Navigation Access by Role

### Admin (`admin@awashbank.com`)
- ✓ Dashboard
- ✓ Risk Register
- ✓ Excel Import
- ✓ Reports
- ✓ Admin

### Risk Manager (if created)
- ✓ Dashboard
- ✓ Risk Register
- ✓ Excel Import
- ✓ Reports
- ✗ Admin

### Chief Office (All 16 department users)
- ✓ Dashboard
- ✓ Risk Register
- ✓ Excel Import
- ✓ Reports
- ✗ Admin

### User (Read-only, if created)
- ✓ Dashboard
- ✓ Risk Register
- ✗ Excel Import
- ✓ Reports
- ✗ Admin

---

## After Login

When you login as a chief office user, you should see:
1. **Sidebar** on the left with navigation menu
2. **Dashboard** as the default page
3. **Navigation items:**
   - Dashboard (home icon)
   - Risk Register (shield icon)
   - Excel Import (upload icon)
   - Reports (file icon)
4. **User info** at the bottom of sidebar with logout button

If the sidebar is not showing, try:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Logout and login again
4. Check browser console for errors (F12)

---
