# Import Consolidation Summary

## ✅ Completed

### 1. Template Download Fixed
- **Issue**: Server endpoint was failing due to route ordering
- **Solution**: Template now generates directly in frontend (no API call)
- **Result**: Download works perfectly with all 19 fields and 3 example rows

### 2. Routes Consolidated
- Both `/upload` and `/excel-import` now point to the same Excel Import page
- Old CSV upload page (upload.tsx) is deprecated but kept for reference
- Single unified import experience

### 3. Excel Import Features
✅ **Template Download** - 3 comprehensive example rows with all RCSA fields
✅ **File Upload** - Drag & drop or click to browse
✅ **Validation** - Real-time validation with detailed error reporting
✅ **Import** - Direct import to risk register

## Current Import Workflow

### Step 1: Download Template
- Click "Download Excel Template"
- Get file with 3 complete examples
- 19 fields including all RCSA data

### Step 2: Fill Data
- Use template format
- Fill required fields (Title, Department, Likelihood, Impact)
- Add optional RCSA fields for comprehensive risk assessment

### Step 3: Upload & Validate
- Upload filled Excel file
- System validates all data
- Shows errors with row numbers and field names

### Step 4: Import
- If validation passes, click "Import X Risks"
- Risks created directly in database
- Auto-generates Risk IDs
- Auto-calculates scores

## Staging Workflow (Available but Not Integrated)

The old upload page has staging functionality:
- Upload → Staging Area → Admin Approval → Risk Register

**Current Status**: 
- Staging endpoints exist in backend (`/api/ingest/*`)
- Old upload.tsx page has staging UI
- **Not integrated** into new Excel Import page

## To Add Staging to Excel Import

If you want staging approval workflow:

1. **Add Staging Toggle**
   - Checkbox: "Send to staging for approval"
   - Default: Direct import (current behavior)
   - When checked: Import to staging instead

2. **Add Staging View**
   - Show pending imports
   - Admin can review and approve
   - Or reject and clear

3. **Update Import Logic**
   - If staging enabled: POST to `/api/ingest/upload`
   - If direct: POST to `/api/risks/import/execute` (current)

## Files

### Active
- `client/src/pages/excel-upload.tsx` - Main import page (consolidated)
- `server/excel-import.ts` - Validation logic
- `server/routes.ts` - Import endpoints

### Deprecated (Kept for Reference)
- `client/src/pages/upload.tsx` - Old CSV upload with staging

## API Endpoints

### Excel Import (Current)
```
GET  /api/risks/template          - Download template (not used, frontend generates)
POST /api/risks/import/validate   - Validate Excel data
POST /api/risks/import/execute    - Import validated risks
```

### Staging (Available but Not Used)
```
GET    /api/ingest/staging        - Get staging data
POST   /api/ingest/upload         - Upload to staging
POST   /api/ingest/approve        - Approve staging → risks
DELETE /api/ingest/staging        - Clear staging
```

## Template Fields (19 Total)

### Core (7 fields)
1. Risk Title *
2. Risk Type *
3. Risk Category *
4. Business Unit *
5. Department * (16 Chief Offices)
6. Status *
7. Date Reported *

### RCSA (7 fields)
8. Objectives
9. Process/Key Activity
10. Risk Description
11. Root Causes
12. Risk Impact
13. Existing Risk Control
14. Potential Risk Response

### Scoring (3 fields)
15. Likelihood * (0-100)
16. Impact * (0-100)
17. Control Effectiveness (0-100)

### Additional (2 fields)
18. Justification
19. Mitigation Plan

## Next Steps (Optional)

If you want to add staging approval:

1. Add toggle in excel-upload.tsx
2. Add staging area view
3. Connect to existing staging endpoints
4. Add admin approval workflow

Otherwise, current direct import works perfectly!

---

**System is ready to use!** 🎉

Restart server: `npm start`
