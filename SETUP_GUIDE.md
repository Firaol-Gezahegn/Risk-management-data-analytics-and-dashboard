# Risk Management Dashboard - Setup Guide

## Quick Start

### 1. Database Migration

Run the migration to add all new features:

```bash
# Using psql
psql -U postgres -d aw_rdm -f migrations/001_add_new_features.sql

# OR using npm script (if you have one)
npm run db:push
```

### 2. Environment Configuration

The `.env` file has been updated with new configuration options:

```env
# Required
DATABASE_URL=postgresql://postgres:Fira%40123@localhost:5432/aw_rdm
JWT_SECRET=awash-bank-risk-management-secret-key-change-in-production

# Optional - Azure AD Authentication
# AZURE_AD_TENANT_ID=your-tenant-id
# AZURE_AD_CLIENT_ID=your-client-id
# AZURE_AD_CLIENT_SECRET=your-client-secret
# AZURE_AD_REDIRECT_URI=http://localhost:5000/api/auth/ad/callback
```

### 3. Start the Application

```bash
npm run dev
```

## New Features Overview

### 1. Active Directory Authentication

**Status:** ✅ Implemented (Optional)

To enable:
1. Uncomment AD variables in `.env`
2. Register app in Azure AD
3. Configure redirect URI
4. Users will see "Sign in with Active Directory" button on login page

### 2. Enhanced Risk Register

**Status:** ✅ Implemented

New fields added to risk records:
- Risk ID (auto-generated: CR-01, IT-05, etc.)
- Objectives
- Process/Key Activity
- Risk Title (required)
- Risk Description
- Root Causes
- Risk Impact
- Existing Risk Control
- Potential Risk Response
- Level of Impact
- Control Effectiveness Score
- Justification

### 3. 5×5 Risk Scoring Matrix

**Status:** ✅ Implemented

- Automatic calculation based on Likelihood × Impact
- 5 rating levels: Very Low, Low, Medium, High, Very High
- Residual risk calculation with control effectiveness
- Real-time computation as you type
- Color-coded risk badges

### 4. Alphanumeric Risk ID Generator

**Status:** ✅ Implemented

Format: `DEPT-NN` (e.g., CR-01, IT-15)

Department codes:
- CR = Credit Management Office
- CS = Corporate Strategy
- DB = Digital Banking
- FM = Facility Management
- FO = Finance Office
- HC = Human Capital
- IF = IFB
- IT = Information & IT Service
- IA = Internal Audit
- LS = Legal Service
- MO = Marketing Office
- RS = Retail & SME
- RC = Risk & Compliance
- TO = Transformation Office
- TS = Trade Service
- WS = Wholesale Banking

Features:
- Auto-generated on risk creation
- Regenerated if department changes
- No gaps (soft delete maintains sequence)

### 5. Collaborators System

**Status:** ✅ Implemented

- Add multiple collaborators per risk
- Department-based user selection
- Real-time updates
- View collaborator details

API Endpoints:
- `GET /api/risks/:id/collaborators`
- `POST /api/risks/:id/collaborators`

### 6. RCSA (Risk & Control Self-Assessment)

**Status:** ✅ Implemented

Track:
- Inherent Risk Rating
- Control Effectiveness Rating
- Residual Risk Rating
- Justification
- Additional Control Recommendations
- Proposed New Controls
- Recommendation Justification

API Endpoints:
- `GET /api/risks/:id/rcsa`
- `POST /api/risks/:id/rcsa`

### 7. Progress Tracking

**Status:** ✅ Implemented

Track quarterly progress on risk responses:
- Agreed Risk Response
- Progress This Quarter
- % Completion
- Observed Impact
- Impediments

API Endpoints:
- `GET /api/risks/:id/progress`
- `POST /api/risks/:id/progress`

## Testing the Implementation

### Test Risk Creation

1. Navigate to `/risks/new`
2. Fill in the enhanced form with tabs:
   - Basic Info: Title, department, description
   - Assessment: Likelihood and impact (watch auto-calculation)
   - Controls: Existing controls and effectiveness
   - Response: Mitigation plans
3. Submit and verify:
   - Risk ID is auto-generated (e.g., IT-01)
   - Risk scores are calculated correctly
   - Risk appears in the register

### Test Collaborators

1. Open an existing risk
2. Navigate to collaborators section
3. Add users from dropdown
4. Verify they appear in the list
5. Remove a collaborator
6. Verify real-time updates

### Test Risk Scoring

1. Create/edit a risk
2. Enter Likelihood: 80
3. Enter Impact: 90
4. Watch the inherent risk score calculate automatically
5. Add Control Effectiveness: 60
6. Watch residual risk calculate
7. Verify color-coded badges

### Test AD Login (if configured)

1. Navigate to `/login`
2. Click "Sign in with Active Directory"
3. Complete Azure AD authentication
4. Verify automatic user creation/sync
5. Check role mapping from job title

## API Documentation

### New Endpoints

#### Authentication
```
GET  /api/auth/ad/config          - Check if AD is configured
GET  /api/auth/ad/login           - Initiate AD login
GET  /api/auth/ad/callback        - Handle AD callback
```

#### Risk Scoring
```
POST /api/risks/compute-scores    - Compute risk scores
Body: { likelihood, impact, controlEffectiveness? }
```

#### Collaborators
```
GET  /api/risks/:id/collaborators - Get collaborators
POST /api/risks/:id/collaborators - Update collaborators
Body: { userIds: string[] }
```

#### RCSA
```
GET  /api/risks/:id/rcsa          - Get RCSA assessments
POST /api/risks/:id/rcsa          - Create RCSA assessment
```

#### Progress Tracking
```
GET  /api/risks/:id/progress      - Get progress entries
POST /api/risks/:id/progress      - Create progress entry
```

#### Department Codes
```
GET  /api/department-codes        - Get all department codes
```

## Troubleshooting

### Migration Issues

If migration fails:
1. Check database connection
2. Verify user has CREATE TABLE permissions
3. Run migration statements one by one
4. Check for existing table conflicts

### AD Authentication Not Working

1. Verify environment variables are set
2. Check Azure AD app registration
3. Verify redirect URI matches
4. Check client secret hasn't expired
5. Review server logs for errors

### Risk ID Not Generating

1. Verify migration ran successfully
2. Check department name matches codes
3. Review server logs
4. Verify database has department_codes table

### Scores Not Calculating

1. Check browser console for errors
2. Verify `/api/risks/compute-scores` endpoint works
3. Test with curl:
```bash
curl -X POST http://localhost:5000/api/risks/compute-scores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"likelihood":80,"impact":90}'
```

## File Structure

```
server/
├── auth-ad.ts              # AD authentication module
├── risk-id-generator.ts    # Risk ID generation
├── seed-departments.ts     # Department code seeding
├── routes.ts               # API routes (enhanced)
└── storage.ts              # Database operations (enhanced)

shared/
├── schema.ts               # Main database schema (enhanced)
├── schema-additions.ts     # New tables (collaborators, RCSA, progress)
└── risk-scoring.ts         # 5×5 matrix scoring logic

client/src/
├── pages/
│   ├── login.tsx           # Login with AD support
│   └── risk-form-enhanced.tsx  # Comprehensive risk form
├── components/
│   ├── risk-collaborators.tsx  # Collaborators UI
│   └── ui/
│       ├── tabs.tsx
│       ├── badge.tsx
│       └── separator.tsx

migrations/
└── 001_add_new_features.sql    # Database migration
```

## Support

For issues or questions:
1. Check IMPLEMENTATION_SUMMARY.txt for detailed changes
2. Review server logs: `npm run dev`
3. Check browser console for frontend errors
4. Verify database schema matches migration

## Next Steps

1. ✅ Run database migration
2. ✅ Test risk creation with new fields
3. ✅ Test risk scoring calculations
4. ✅ Test collaborators functionality
5. ⏳ Configure Azure AD (optional)
6. ⏳ Create RCSA assessments
7. ⏳ Track progress on risk responses
8. ⏳ Train users on new features

## Production Deployment

Before deploying to production:

1. **Security:**
   - Change JWT_SECRET to a strong random value
   - Use environment-specific AD credentials
   - Enable HTTPS for AD callbacks
   - Review and restrict API permissions

2. **Database:**
   - Backup database before migration
   - Test migration on staging first
   - Monitor performance after deployment
   - Set up database indexes (included in migration)

3. **Monitoring:**
   - Set up error logging
   - Monitor AD authentication failures
   - Track API response times
   - Monitor database query performance

4. **Documentation:**
   - Update user documentation
   - Create training materials
   - Document AD setup process
   - Create runbooks for common issues
