# Awash Bank Risk Management Dashboard - User Guide

**Version:** 1.0  
**Date:** December 8, 2025  
**For:** End Users, Risk Managers, Department Chiefs  

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Login & Authentication](#login--authentication)
3. [Dashboard Overview](#dashboard-overview)
4. [Managing Risks](#managing-risks)
5. [Excel Import/Export](#excel-importexport)
6. [Reports & Analytics](#reports--analytics)
7. [User Roles & Permissions](#user-roles--permissions)
8. [Troubleshooting](#troubleshooting)
9. [FAQs](#faqs)

---

## 1. Getting Started

### System Requirements

**Supported Browsers:**
- Google Chrome 90+
- Mozilla Firefox 88+
- Microsoft Edge 90+
- Safari 14+

**Screen Resolution:**
- Minimum: 1024×768
- Recommended: 1920×1080 or higher

### Accessing the System

1. Open your web browser
2. Navigate to: `https://your-domain.com` (or your organization's URL)
3. You will be redirected to the login page

---

## 2. Login & Authentication

### Standard Login

1. **Enter Your Email**
   - Use your Awash Bank email address
   - Example: `john.doe@awashbank.com`

2. **Enter Your Password**
   - Use the password provided by your administrator
   - Passwords are case-sensitive

3. **Click "Sign In"**
   - You will be redirected to the dashboard

![Login Screen](images/login-screen.png)

### Active Directory Login (If Enabled)

1. Click **"Sign in with Active Directory"** button
2. You will be redirected to Microsoft login
3. Enter your corporate credentials
4. After authentication, you'll return to the dashboard

### First-Time Login

If this is your first time logging in:
1. Use the temporary password provided by IT
2. You will be prompted to change your password
3. Choose a strong password (minimum 8 characters)

### Forgot Password?

Contact your system administrator or IT support to reset your password.

---

## 3. Dashboard Overview

The dashboard is your central hub for risk management insights.

### Navigation

**Sidebar Menu:**
- 🏠 **Dashboard** - Overview and analytics
- 📋 **Risk Register** - View and manage all risks
- ➕ **Add Risk** - Create new risk entry
- 📤 **Import** - Bulk import from Excel
- 📊 **Reports** - Generate reports
- ⚙️ **Admin** - System administration (admin only)

### Dashboard Widgets

#### 1. Risk Level Summary Cards

Six cards showing risk distribution:
- **Total Risks** - All risks in the system
- **Very High** - Critical risks (score ≥ 83.33)
- **High Risk** - High priority (score 62.5-83.33)
- **Medium** - Moderate priority (score 37.5-62.5)
- **Low Risk** - Low priority (score 16.67-37.5)
- **Very Low** - Minimal concern (score < 16.67)

![Risk Cards](images/risk-cards.png)

#### 2. Residual vs Inherent Risk Chart

**What it shows:** Effectiveness of your risk controls

**How to read it:**
- **X-axis:** Inherent Risk (risk before controls)
- **Y-axis:** Residual Risk (risk after controls)
- **Diagonal line:** No control effect
- **Points below line:** Controls are working ✓
- **Points above line:** Controls need improvement ✗

**Color coding:**
- 🟢 Green: Strong controls (80-100%)
- 🔵 Blue: Good controls (60-79%)
- 🟡 Yellow: Adequate controls (40-59%)
- 🟠 Orange: Weak controls (20-39%)
- 🔴 Red: Poor controls (<20%)

![Scatter Plot](images/scatter-plot.png)



#### 3. Control Effectiveness by Department

**What it shows:** How well each department manages risks

**How to read it:**
- Each bar represents one department
- Height shows average control effectiveness (0-100%)
- Colors indicate maturity level:
  - 🟢 Green: Risk Enabled (80-100%)
  - 🔵 Blue: Risk Managed (60-79%)
  - 🟡 Yellow: Risk Defined (40-59%)
  - 🟠 Orange: Risk Aware (20-39%)
  - 🔴 Red: Risk Naive (0-19%)

**Hover over bars** to see:
- Department name
- Exact control percentage
- Maturity level
- Number of risks

![Department Chart](images/department-chart.png)

#### 4. Control vs Likelihood Priority Matrix

**What it shows:** Which risks need immediate attention

**Four Quadrants:**
- **Top-Left:** Low likelihood, weak controls → Monitor
- **Top-Right:** High likelihood, weak controls → **URGENT!**
- **Bottom-Left:** Low likelihood, strong controls → Maintain
- **Bottom-Right:** High likelihood, strong controls → Review

**Point size:** Represents impact magnitude (bigger = higher impact)

![Priority Matrix](images/priority-matrix.png)

#### 5. Control Maturity Level

**What it shows:** Organization's overall risk management maturity

**Five Levels:**
1. **Risk Naive (0-20%)** - Minimal controls, reactive approach
2. **Risk Aware (20-40%)** - Basic awareness, some controls
3. **Risk Defined (40-60%)** - Documented processes
4. **Risk Managed (60-80%)** - Systematic management
5. **Risk Enabled (80-100%)** - Proactive, embedded in culture

![Maturity Level](images/maturity-level.png)

#### 6. Risk Trend (Last 12 Months)

**What it shows:** Monthly pattern of risk identification

**How to use it:**
- Identify seasonal patterns
- Track risk identification effectiveness
- Monitor emerging risk trends

![Trend Chart](images/trend-chart.png)

#### 7. Risk by Status

**What it shows:** Current status distribution

**Status Types:**
- **Open** - Newly identified, not yet addressed
- **In Progress** - Mitigation actions underway
- **Mitigated** - Controls implemented
- **Closed** - Risk no longer applicable
- **Accepted** - Risk accepted by management

![Status Chart](images/status-chart.png)

---

## 4. Managing Risks

### Viewing the Risk Register

1. Click **"Risk Register"** in the sidebar
2. You'll see a table with all risks you have access to
3. Use filters to narrow down:
   - Department
   - Status
   - Risk Level
   - Date Range

### Creating a New Risk

#### Step 1: Navigate to Risk Form
- Click **"Add Risk"** in sidebar, OR
- Click **"+ New Risk"** button in Risk Register

#### Step 2: Fill Basic Information Tab

**Required Fields:**
- **Risk Title** - Clear, concise description
  - Example: "Cybersecurity breach through phishing attacks"
- **Risk Type** - Select from dropdown:
  - Operational
  - Financial
  - Strategic
  - Regulatory
  - Reputational
- **Risk Category** - Specific category:
  - Technology
  - Credit
  - Market
  - Compliance
  - etc.
- **Business Unit** - Your business line
- **Department** - Your department (auto-filled for most users)
- **Status** - Current status (default: Open)
- **Date Reported** - When risk was identified

**Optional Fields:**
- **Objectives** - What you're trying to protect
- **Process/Key Activity** - Affected business process

![Basic Info Tab](images/basic-info-tab.png)

#### Step 3: Complete Risk Assessment Tab

**Risk Description:**
- Detailed explanation of the risk
- What could go wrong?
- Example: "Employees may click on malicious links in phishing emails, leading to credential theft and unauthorized system access"

**Root Causes:**
- Why does this risk exist?
- Example: "Lack of security awareness training, sophisticated phishing techniques, human error"

**Risk Impact:**
- What are the consequences?
- Example: "Data breach, financial loss, regulatory penalties, reputational damage"

**Scoring (Required):**
- **Likelihood (0-100):** How likely is this to occur?
  - 0-20: Very Low
  - 21-40: Low
  - 41-60: Medium
  - 61-80: High
  - 81-100: Very High

- **Impact (0-100):** How severe would the consequences be?
  - Same scale as likelihood

**Auto-Calculated:**
- **Inherent Risk Score** - Automatically calculated using 5×5 matrix
- **Risk Rating** - Automatically assigned (Very Low to Very High)

![Assessment Tab](images/assessment-tab.png)



#### Step 4: Document Controls Tab

**Existing Risk Control:**
- What controls are currently in place?
- Example: "Email filtering, antivirus software, basic security training"

**Control Effectiveness (0-100):**
- How well do current controls work?
- 0-20: Poor
- 21-40: Weak
- 41-60: Adequate
- 61-80: Good
- 81-100: Strong

**Auto-Calculated:**
- **Residual Risk Score** - Risk after applying controls
- **Residual Risk Rating** - Updated rating

**Potential Risk Response:**
- Additional controls you could implement
- Example: "Implement multi-factor authentication, conduct monthly phishing simulations, deploy advanced email security"

![Controls Tab](images/controls-tab.png)

#### Step 5: Plan Response Tab

**Justification:**
- Why did you assign these scores?
- Supporting evidence or reasoning

**Mitigation Plan:**
- Detailed action plan to reduce risk
- Include:
  - Specific actions
  - Responsible parties
  - Timeline
  - Resources needed

Example:
```
Phase 1 (Month 1-2): Conduct security awareness training for all staff
Phase 2 (Month 3): Implement MFA for all systems
Phase 3 (Month 4-6): Deploy advanced email filtering
Phase 4 (Ongoing): Monthly phishing simulations and reporting
```

![Response Tab](images/response-tab.png)

#### Step 6: Save the Risk

1. Review all information
2. Click **"Save Risk"** button
3. Risk ID will be auto-generated (e.g., IT-01)
4. You'll be redirected to the Risk Register

### Editing an Existing Risk

1. Go to **Risk Register**
2. Find the risk you want to edit
3. Click the **pencil icon** (✏️) in the Actions column
4. Make your changes
5. Click **"Save Risk"**

**Note:** You can only edit risks in your department (unless you're an admin or risk manager)

### Viewing Risk Details

1. Go to **Risk Register**
2. Click on any risk row
3. View all details in read-only mode
4. Click **"Edit"** to make changes (if you have permission)

### Deleting a Risk

1. Go to **Risk Register**
2. Find the risk to delete
3. Click the **trash icon** (🗑️) in the Actions column
4. Confirm deletion in the popup

**Note:** Deletion is soft delete - the risk is marked as deleted but not removed from the database.

---

## 5. Excel Import/Export

### Downloading the Template

1. Click **"Import"** in the sidebar
2. Click **"Download Excel Template"** button
3. Template file will download with 3 example rows
4. Template includes all 19 fields with proper formatting

### Filling the Template

**Required Columns:**
- Risk Title
- Risk Type
- Risk Category
- Business Unit
- Department (must match exactly)
- Status
- Date Reported
- Likelihood (0-100)
- Impact (0-100)

**Optional Columns:**
- Objectives
- Process/Key Activity
- Risk Description
- Root Causes
- Risk Impact
- Existing Risk Control
- Potential Risk Response
- Control Effectiveness (0-100)
- Justification
- Mitigation Plan

**Important Notes:**
- Do not change column headers
- Department names must match exactly (see list in template)
- Dates should be in YYYY-MM-DD format
- Numeric fields must be numbers between 0-100
- Delete the example rows before adding your data

### Importing Risks

#### Step 1: Upload File
1. Click **"Import"** in sidebar
2. Click **"Choose File"** button
3. Select your filled Excel file
4. File will automatically validate

#### Step 2: Review Validation Results

**If Successful:**
- Green checkmark appears
- Shows number of risks ready to import
- Click **"Import X Risks"** button

**If Errors Found:**
- Red alert appears
- List of errors with:
  - Row number
  - Field name
  - Error message
  - Invalid value
- Fix errors in Excel and re-upload

![Import Validation](images/import-validation.png)

#### Step 3: Complete Import
1. Click **"Import X Risks"** button
2. Wait for confirmation message
3. Risks are created with auto-generated IDs
4. Navigate to Risk Register to view

### Exporting Risks

1. Go to **Risk Register**
2. Apply any filters you want
3. Click **"Export"** button
4. Excel file downloads with filtered risks
5. Open in Excel or other spreadsheet software

---

## 6. Reports & Analytics

### Generating Reports

1. Click **"Reports"** in sidebar
2. Select report type:
   - Risk Summary Report
   - Department Report
   - Control Effectiveness Report
   - Trend Analysis Report

3. Choose filters:
   - Date range
   - Department
   - Risk level
   - Status

4. Click **"Generate Report"**
5. Report displays on screen
6. Click **"Export PDF"** or **"Export Excel"** to download

### Understanding Report Metrics

**Risk Summary Report:**
- Total risks by severity
- Status distribution
- Top risk categories
- Department breakdown

**Control Effectiveness Report:**
- Average control effectiveness by department
- Maturity level assessment
- Risks with weak controls
- Improvement recommendations

**Trend Analysis Report:**
- Monthly risk identification patterns
- Emerging risk areas
- Year-over-year comparison
- Seasonal trends



---

## 7. User Roles & Permissions

### Role Types

#### Administrator
**Access Level:** Full system access

**Permissions:**
- ✓ View all risks across all departments
- ✓ Create, edit, delete any risk
- ✓ Manage users and roles
- ✓ Configure system settings
- ✓ Access all reports
- ✓ Import/export data

**Typical Users:** IT administrators, system managers

#### Risk Manager
**Access Level:** Full risk management access

**Permissions:**
- ✓ View all risks across all departments
- ✓ Create, edit, delete any risk
- ✓ Access all reports
- ✓ Import/export data
- ✗ Cannot manage users or system settings

**Typical Users:** Risk management team, compliance officers

#### Chief Office
**Access Level:** Department-level access

**Permissions:**
- ✓ View risks in their department only
- ✓ Create risks in their department
- ✓ Edit risks in their department
- ✓ Delete risks in their department
- ✓ Generate department reports
- ✓ Import/export department data
- ✗ Cannot access other departments

**Typical Users:** Department heads, chief officers

#### User (Read-Only)
**Access Level:** View-only access

**Permissions:**
- ✓ View risks in their department
- ✓ View dashboard and reports
- ✗ Cannot create, edit, or delete risks
- ✗ Cannot import/export data

**Typical Users:** Staff members, auditors

### Department Access

**16 Chief Office Departments:**
1. Wholesale Banking
2. Retail Banking
3. International Banking
4. Treasury and Investment
5. Finance
6. Risk Management
7. Compliance
8. Internal Audit
9. Human Resources
10. Information Technology
11. Operations
12. Legal
13. Marketing & Corporate Communications
14. Strategy & Business Development
15. Credit
16. Branch Network

**Access Rules:**
- Users can only access risks in their assigned department
- Admin and Risk Manager roles can access all departments
- Department assignment is set by administrators

---

## 8. Troubleshooting

### Common Issues

#### Issue: Cannot Login

**Possible Causes:**
- Incorrect email or password
- Account is inactive
- Browser cookies disabled

**Solutions:**
1. Verify email address is correct
2. Check password (case-sensitive)
3. Clear browser cache and cookies
4. Try different browser
5. Contact IT support for password reset

#### Issue: Dashboard Not Loading

**Possible Causes:**
- Slow internet connection
- Browser compatibility
- Server maintenance

**Solutions:**
1. Refresh the page (F5 or Ctrl+R)
2. Check internet connection
3. Try different browser
4. Clear browser cache
5. Contact IT support if issue persists

#### Issue: Cannot See Risks

**Possible Causes:**
- No risks in your department
- Incorrect department assignment
- Filters applied

**Solutions:**
1. Check if filters are applied (clear all filters)
2. Verify your department assignment with admin
3. Confirm risks exist in your department
4. Check your user role and permissions

#### Issue: Excel Import Fails

**Possible Causes:**
- Invalid data format
- Missing required fields
- Department name mismatch
- Numeric values out of range

**Solutions:**
1. Download fresh template
2. Verify all required fields are filled
3. Check department names match exactly
4. Ensure numeric fields are 0-100
5. Review validation error messages
6. Fix errors and re-upload

#### Issue: Risk ID Not Generated

**Possible Causes:**
- Department not configured
- Database error

**Solutions:**
1. Verify department is selected
2. Contact administrator to check department codes
3. Try again or contact IT support

#### Issue: Charts Not Displaying

**Possible Causes:**
- No data available
- Browser compatibility
- JavaScript disabled

**Solutions:**
1. Verify risks exist in the system
2. Enable JavaScript in browser
3. Update browser to latest version
4. Try different browser
5. Clear cache and reload

### Getting Help

**IT Support:**
- Email: itsupport@awashbank.com
- Phone: +251-XXX-XXXX
- Hours: Monday-Friday, 8:00 AM - 5:00 PM

**Risk Management Team:**
- Email: riskmanagement@awashbank.com
- Phone: +251-XXX-XXXX

**System Administrator:**
- Email: admin@awashbank.com

---

## 9. FAQs

### General Questions

**Q: How often should I update risk information?**
A: Review and update risks at least quarterly, or whenever there are significant changes to the risk or controls.

**Q: Can I delete a risk permanently?**
A: No, deletions are "soft deletes" - risks are hidden but retained in the database for audit purposes. Contact an administrator if permanent deletion is required.

**Q: How is the risk score calculated?**
A: The system uses a 5×5 risk matrix methodology. Likelihood and Impact (0-100) are converted to a 1-5 scale, multiplied, and converted back to a percentage.

**Q: What's the difference between Inherent and Residual Risk?**
A: 
- **Inherent Risk** = Risk before any controls (Likelihood × Impact)
- **Residual Risk** = Risk after applying controls (Inherent Risk - Control Effectiveness)

**Q: Can I export data to Excel?**
A: Yes, use the Export button in the Risk Register to download all visible risks to Excel format.

### Risk Management Questions

**Q: What should I do if I identify a Very High risk?**
A: 
1. Document it immediately in the system
2. Notify your department head
3. Alert the Risk Management team
4. Develop urgent mitigation plan
5. Monitor closely until mitigated

**Q: How do I know if my controls are effective?**
A: Check the "Residual vs Inherent Risk" chart. If your risk points are below the diagonal line, your controls are working.

**Q: What's a good Control Effectiveness score?**
A:
- 80-100%: Strong (excellent)
- 60-79%: Good (acceptable)
- 40-59%: Adequate (needs improvement)
- 20-39%: Weak (requires action)
- 0-19%: Poor (urgent action needed)

**Q: How many risks should my department have?**
A: There's no fixed number. Focus on identifying all significant risks, not meeting a quota. Quality over quantity.

**Q: Can I collaborate with others on a risk?**
A: Yes, use the Collaborators feature to add team members who can view and contribute to specific risks.

### Technical Questions

**Q: Which browsers are supported?**
A: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+. We recommend using the latest version of Chrome for best performance.

**Q: Is my data secure?**
A: Yes, the system uses:
- HTTPS encryption for all data transmission
- Password hashing (bcrypt)
- Role-based access control
- Regular security audits
- Secure database storage

**Q: Can I access the system from mobile?**
A: Yes, the system is responsive and works on tablets and smartphones, though desktop is recommended for data entry.

**Q: How long is data retained?**
A: Risk data is retained indefinitely for compliance and audit purposes. Deleted risks are archived but not removed.

**Q: Can I integrate with other systems?**
A: Contact your administrator about API integration options for connecting with other enterprise systems.

---

## Appendix A: Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open Dashboard | Alt + D |
| Open Risk Register | Alt + R |
| Create New Risk | Alt + N |
| Search Risks | Ctrl + K |
| Save Form | Ctrl + S |
| Cancel/Close | Esc |
| Refresh Page | F5 |

---

## Appendix B: Risk Scoring Reference

### Likelihood Scale (0-100)

| Range | Level | Description | Examples |
|-------|-------|-------------|----------|
| 81-100 | Very High | Almost certain to occur | Daily occurrences, systemic issues |
| 61-80 | High | Likely to occur | Monthly occurrences, known vulnerabilities |
| 41-60 | Medium | Possible to occur | Quarterly occurrences, some controls |
| 21-40 | Low | Unlikely to occur | Annual occurrences, strong controls |
| 0-20 | Very Low | Rare occurrence | Never or once in 5+ years |

### Impact Scale (0-100)

| Range | Level | Description | Financial Impact |
|-------|-------|-------------|------------------|
| 81-100 | Very High | Catastrophic | >100M Birr |
| 61-80 | High | Major | 50-100M Birr |
| 41-60 | Medium | Moderate | 10-50M Birr |
| 21-40 | Low | Minor | 1-10M Birr |
| 0-20 | Very Low | Negligible | <1M Birr |

### Risk Rating Matrix

| Inherent Score | Rating | Action Required |
|----------------|--------|-----------------|
| 83.33-100 | Very High | Immediate action, escalate to senior management |
| 62.5-83.33 | High | Urgent action, develop mitigation plan |
| 37.5-62.5 | Medium | Action required, monitor closely |
| 16.67-37.5 | Low | Monitor, maintain controls |
| 0-16.67 | Very Low | Accept, periodic review |

---

## Appendix C: Contact Information

**System Support:**
- Email: support@awashbank.com
- Phone: +251-XXX-XXXX

**Risk Management Department:**
- Email: riskmanagement@awashbank.com
- Phone: +251-XXX-XXXX

**IT Department:**
- Email: it@awashbank.com
- Phone: +251-XXX-XXXX

**Training Requests:**
- Email: training@awashbank.com

---

**Document Version:** 1.0  
**Last Updated:** December 8, 2025  
**Next Review:** March 2026

For the latest version of this guide, visit the internal documentation portal or contact the Risk Management team.
