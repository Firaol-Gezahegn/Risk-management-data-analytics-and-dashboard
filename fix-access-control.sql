-- Fix Access Control Issues
-- This script ensures all users have correct roles and departments

-- 1. Check current user roles
SELECT id, email, name, role, department, is_active 
FROM users 
ORDER BY role, department;

-- 2. Update admin user to have 'admin' role (not 'superadmin')
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@awashbank.com' OR role = 'superadmin';

-- 3. Update risk management users to have 'risk_manager' role
UPDATE users 
SET role = 'risk_manager' 
WHERE email LIKE '%riskmanagement%' OR email LIKE '%risk%management%'
   OR department = 'Risk Management' OR department = 'Risk & Compliance';

-- 4. Update all department chief users to have 'chief_office' role
UPDATE users 
SET role = 'chief_office' 
WHERE role IN ('risk_admin', 'business_user', 'risk_team_full', 'reviewer', 'auditor')
   OR (role IS NULL AND department IS NOT NULL);

-- 5. Set default role for users without role
UPDATE users 
SET role = 'user' 
WHERE role IS NULL OR role = '';

-- 6. Ensure all users have a department (set to 'General' if missing)
UPDATE users 
SET department = 'General' 
WHERE department IS NULL OR department = '';

-- 7. Verify the changes
SELECT 
  role,
  COUNT(*) as user_count,
  STRING_AGG(DISTINCT department, ', ') as departments
FROM users 
WHERE is_active = true
GROUP BY role
ORDER BY role;

-- 8. List all users with their corrected roles
SELECT 
  email,
  name,
  role,
  department,
  is_active
FROM users 
ORDER BY role, department;
