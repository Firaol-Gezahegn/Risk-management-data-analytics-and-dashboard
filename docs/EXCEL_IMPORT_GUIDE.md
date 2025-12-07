# Excel Import Guide - Comprehensive RCSA Fields

## Overview
The Excel Import feature allows you to bulk import multiple risks with full RCSA (Risk and Control Self-Assessment) fields including objectives, root causes, controls, and risk responses.

## Quick Start

1. **Download Template** → Click "Download Excel Template"
2. **Fill Data** → Complete all relevant fields in Excel
3. **Upload** → System validates automatically
4. **Import** → Click import if validation passes

## Template Fields

### Core Information (Required)
| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| Risk Title | ✅ Yes | Name of the risk | "Cybersecurity breach risk" |
| Risk Type | ✅ Yes | Type classification | "Operational" |
| Risk Category | ✅ Yes | Category | "Technology" |
| Business Unit | ✅ Yes | Business unit | "Information Technology" |
| Department | ✅ Yes | One of 16 Chief Offices | "Information Technology" |
| Status | ✅ Yes | Current status | "Open" |
| Date Reported | ✅ Yes | Report date | "2024-01-15" |

### RCSA Fields (Highly Recommended)
| Field | Description | Example |
|-------|-------------|---------|
| Objectives | What objectives are at risk? | "Protect customer data and maintain system integrity" |
| Process/Key Activity | Affected business process | "Data storage and transmission processes" |
| Risk Description | Detailed risk description | "Potential unauthorized access to sensitive data..." |
| Root Causes | What causes this risk? | "Outdated security protocols, insufficient access controls..." |
| Risk Impact | Potential consequences | "Financial loss, regulatory penalties, reputational damage..." |
| Existing Risk Control | Current controls | "Firewall, antivirus software, access controls" |
| Potential Risk Response | Mitigation strategies | "Implement MFA, conduct penetration testing..." |

### Risk Scoring (Required)
| Field | Required | Range | Description |
|-------|----------|-------|-------------|
| Likelihood | ✅ Yes | 0-100 | Probability of occurrence |
| Impact | ✅ Yes | 0-100 | Severity of consequences |
| Control Effectiveness | Optional | 0-100 | How effective are controls? |

### Additional Fields
| Field | Description | Example |
|-------|-------------|---------|
| Justification | Rationale for ratings | "High likelihood due to increasing cyber threats..." |
| Mitigation Plan | Detailed action plan | "Phase 1: Security audit, Phase 2: Infrastructure upgrade..." |

## 16 Valid Departments

Must use exactly one of these:

1. **Wholesale Banking**
2. **Retail Banking**
3. **International Banking**
4. **Treasury and Investment**
5. **Finance**
6. **Risk Management**
7. **Compliance**
8. **Internal Audit**
9. **Human Resources**
10. **Information Technology**
11. **Operations**
12. **Legal**
13. **Marketing and Corporate Communications**
14. **Strategy and Business Development**
15. **Credit**
16. **Branch Network**

## Valid Values

### Status Options
- **Open** - Newly identified, not yet addressed
- **Mitigating** - Actively working on mitigation
- **Monitoring** - Under observation
- **Closed** - Resolved or accepted

### Risk Categories
- Operational
- Financial
- Strategic
- Compliance
- Technology
- Reputational
- Market
- Credit
- Liquidity
- Legal

### Risk Types
- Operational
- Financial
- Regulatory
- Strategic
- Reputational

## Validation Rules

### Required Field Validation
- ✅ Risk Title must not be empty
- ✅ Department must match one of 16 departments
- ✅ Likelihood must be 0-100
- ✅ Impact must be 0-100
- ✅ Date must be valid format (YYYY-MM-DD)

### Data Type Validation
- Numbers must be numeric (not text like "high")
- Dates must be valid format
- Status must match valid options
- Department names are case-insensitive

## Auto-Calculations

The system automatically calculates:

### 1. Risk ID Generation
- Format: **DEPT-NN** (e.g., IT-01, WS-05, CR-12)
- Based on department
- Sequential numbering per department

### 2. Inherent Risk (5×5 Matrix)
- Uses likelihood and impact
- Matrix-based calculation (0-24 scale)
- Converted to 0-100 scale
- Rating: Very Low, Low, Medium, High, Very High

### 3. Residual Risk
- Only if Control Effectiveness provided
- Formula: `Inherent Risk × (1 - Control Effectiveness / 100)`
- Example: Inherent 80, Control 60% → Residual 32

## Example Template Rows

The downloaded template includes 3 complete examples:

### Example 1: IT Risk
```
Risk Title: Cybersecurity breach risk
Risk Type: Operational
Risk Category: Technology
Department: Information Technology
Likelihood: 80
Impact: 90
Control Effectiveness: 60
→ Result: IT-01, Inherent: 91.67, Residual: 36.67
```

### Example 2: Credit Risk
```
Risk Title: Credit default risk
Risk Type: Financial
Risk Category: Credit
Department: Credit
Likelihood: 50
Impact: 70
Control Effectiveness: 40
→ Result: CR-01, Inherent: 58.33, Residual: 35.00
```

### Example 3: Compliance Risk
```
Risk Title: Regulatory compliance violation
Risk Type: Regulatory
Risk Category: Compliance
Department: Compliance
Likelihood: 30
Impact: 80
Control Effectiveness: 70
→ Result: CO-01, Inherent: 50.00, Residual: 15.00
```

## Common Errors & Solutions

| Error | Solution |
|-------|----------|
| "Department is required" | Add a valid department name |
| "Invalid department: 'IT Dept'" | Use exact name: "Information Technology" |
| "Likelihood must be between 0 and 100" | Use numeric value 0-100 |
| "Impact must be a number, got: 'high'" | Replace text with number (e.g., 80) |
| "Invalid status: 'In Progress'" | Use: Open, Mitigating, Monitoring, or Closed |
| "Invalid date format" | Use YYYY-MM-DD format (e.g., 2024-01-15) |

## Step-by-Step Import Process

### Step 1: Download Template
1. Login to the system
2. Navigate to **Excel Import** page
3. Click **"Download Excel Template"** button
4. File `Risk_Import_Template.xlsx` downloads
5. Template includes 3 example rows

### Step 2: Fill Your Data
1. Open template in Excel
2. Keep example rows for reference or delete them
3. Add your risk data row by row
4. Fill all required fields (marked ✅)
5. Fill RCSA fields for comprehensive risk assessment
6. Use numeric values for Likelihood, Impact, Control Effectiveness
7. Copy department names exactly from valid list
8. Save file

### Step 3: Upload & Validate
1. Return to Excel Import page
2. Click **"Choose File"** button
3. Select your filled Excel file
4. System automatically reads and validates
5. Wait for validation results

### Step 4: Review Results
**If Successful:**
- ✅ Green message: "X risks ready to import"
- Shows number of validated risks
- Import button appears

**If Errors:**
- ❌ Red message: "Found X errors"
- Detailed error list with:
  - Row number
  - Field name
  - Error message
  - Current value
- Fix errors in Excel and re-upload

### Step 5: Import
1. Click **"Import X Risks"** button
2. System creates all risks
3. Auto-generates Risk IDs
4. Auto-calculates scores
5. Success message appears
6. Risks visible in risk list

## Tips for Success

1. **Use the Template** - Always start from downloaded template
2. **Test First** - Import 2-3 risks first to test
3. **Copy Department Names** - Don't type, copy from valid list
4. **Use Numbers** - Likelihood/Impact must be numbers (0-100)
5. **Complete RCSA Fields** - More detail = better risk management
6. **Check Dates** - Use YYYY-MM-DD format
7. **Review Before Import** - Fix all validation errors
8. **Keep Backup** - Save your Excel file

## Permissions

| Role | Validate | Import |
|------|----------|--------|
| Superadmin | ✅ | ✅ |
| Risk Admin | ✅ | ✅ |
| Risk Team Full | ✅ | ✅ |
| Business User | ✅ | ❌ |
| Chief Office | ✅ | ❌ |
| Reviewer | ❌ | ❌ |
| Auditor | ❌ | ❌ |

## API Endpoints

For developers:

```
GET  /api/risks/template          - Download template (returns JSON)
POST /api/risks/import/validate   - Validate Excel data
POST /api/risks/import/execute    - Execute import
```

## Troubleshooting

### Template Won't Download
- Check if logged in
- Check server is running
- Check browser console for errors
- Try different browser

### File Won't Upload
- Check file format (.xlsx or .xls only)
- File size should be < 5MB
- Close file in Excel before uploading
- Check file isn't corrupted

### Validation Fails
- Read error messages carefully
- Note row numbers in errors
- Fix in Excel and re-upload
- Don't skip required fields

### Import Fails After Validation
- Check server logs
- Verify database connection
- Check user permissions
- Contact administrator

## Success Indicators

After successful import:
- ✅ Success message displayed
- ✅ All risks created in database
- ✅ Risk IDs auto-generated (DEPT-NN format)
- ✅ Inherent and residual risks calculated
- ✅ Risks visible in risk list
- ✅ Audit log entry created
- ✅ Statistics updated on dashboard

---

**Need Help?** Contact your system administrator or risk management team.
