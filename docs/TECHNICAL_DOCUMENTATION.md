# Awash Bank Risk Management Dashboard - Technical Documentation

**Version:** 1.0  
**Date:** December 8, 2025  
**Author:** Development Team  

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Core Components](#core-components)
6. [Backend Services](#backend-services)
7. [Frontend Components](#frontend-components)
8. [Database Schema](#database-schema)
9. [API Endpoints](#api-endpoints)
10. [Security & Access Control](#security--access-control)
11. [Deployment](#deployment)
12. [Maintenance](#maintenance)

---

## 1. System Overview

The Awash Bank Risk Management Dashboard is a full-stack web application designed to manage operational risks across the organization. It provides comprehensive risk assessment, tracking, and reporting capabilities aligned with Basel II/III operational risk management standards.

### Key Features
- **Risk Register Management** - Create, update, and track risks
- **ORM Dashboard** - 6 professional visualizations for risk analysis
- **Role-Based Access Control** - Department-level access restrictions
- **Excel Import/Export** - Bulk risk data management
- **RCSA Framework** - Complete Risk Control Self-Assessment
- **Auto-Calculation** - Inherent and residual risk scoring
- **Active Directory Integration** - Enterprise authentication support

### System Capabilities
- Supports 16 chief office departments
- Auto-generates department-specific risk IDs (e.g., IT-01, CR-02)
- Real-time risk scoring using 5×5 matrix methodology
- Control effectiveness tracking and maturity assessment
- Comprehensive audit trail and data validation

---

## 2. Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  (React + TypeScript + Tailwind CSS + shadcn/ui)           │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│         (Express.js + TypeScript + JWT Auth)                │
└─────────────────────────────────────────────────────────────┘
                            ↕ SQL
┌─────────────────────────────────────────────────────────────┐
│                       Database Layer                         │
│              (PostgreSQL + Drizzle ORM)                     │
└─────────────────────────────────────────────────────────────┘
```

### Design Patterns
- **MVC Pattern** - Separation of concerns
- **Repository Pattern** - Data access abstraction
- **Middleware Pattern** - Authentication and authorization
- **Factory Pattern** - Risk ID generation
- **Observer Pattern** - Real-time data updates via React Query

---

## 3. Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **TanStack Query (React Query)** - Server state management
- **Wouter** - Lightweight routing
- **Recharts** - Data visualization
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **XLSX** - Excel file processing
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Database toolkit
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Multer** - File upload handling

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Drizzle Kit** - Database migrations
- **tsx** - TypeScript execution

---


## 4. Project Structure

```
awash-risk-dashboard/
├── client/                      # Frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   ├── app-sidebar.tsx
│   │   │   ├── department-select.tsx
│   │   │   ├── risk-collaborators.tsx
│   │   │   ├── risk-rating-badge.tsx
│   │   │   ├── stat-card.tsx
│   │   │   └── theme-toggle.tsx
│   │   ├── pages/             # Page components
│   │   │   ├── dashboard.tsx  # ORM Dashboard
│   │   │   ├── risks.tsx      # Risk Register
│   │   │   ├── risk-form.tsx  # Risk CRUD
│   │   │   ├── excel-upload.tsx
│   │   │   ├── login.tsx
│   │   │   ├── admin.tsx
│   │   │   └── reports.tsx
│   │   ├── lib/               # Utilities
│   │   │   ├── auth.tsx       # Auth context
│   │   │   ├── queryClient.ts # API client
│   │   │   └── theme-provider.tsx
│   │   ├── hooks/             # Custom hooks
│   │   └── App.tsx            # Root component
│   ├── public/                # Static assets
│   └── index.html
├── server/                     # Backend application
│   ├── routes.ts              # API endpoints
│   ├── storage.ts             # Database operations
│   ├── db.ts                  # Database connection
│   ├── auth-ad.ts             # AD authentication
│   ├── access-control.ts      # Authorization
│   ├── excel-import.ts        # Excel validation
│   ├── risk-id-generator.ts   # ID generation
│   ├── seed.ts                # Database seeding
│   ├── seed-departments.ts    # Department setup
│   ├── migrate.ts             # Migration runner
│   ├── env.ts                 # Environment config
│   ├── vite.ts                # Vite integration
│   └── index.ts               # Server entry
├── shared/                     # Shared code
│   ├── schema.ts              # Database schema
│   ├── schema-additions.ts    # Extended types
│   ├── constants.ts           # App constants
│   └── risk-scoring.ts        # Risk calculations
├── migrations/                 # Database migrations
│   └── 001_add_new_features.sql
├── scripts/                    # Build scripts
│   └── build-server.mjs
├── docs/                       # Documentation
├── dist/                       # Production build
├── .env                        # Environment variables
├── drizzle.config.ts          # Drizzle configuration
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript config
├── tailwind.config.ts         # Tailwind config
└── package.json               # Dependencies
```

---

## 5. Core Components

### 5.1 Database Schema (`shared/schema.ts`)

The database schema defines all tables and relationships using Drizzle ORM.

#### Users Table
```typescript
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("user"),
  department: text("department"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

**Fields:**
- `id` - Auto-incrementing primary key
- `email` - Unique user email (login credential)
- `passwordHash` - bcrypt hashed password
- `fullName` - User's display name
- `role` - Access level: 'admin', 'risk_manager', 'chief_office', 'user'
- `department` - Department assignment for access control
- `isActive` - Account status flag
- `createdAt/updatedAt` - Audit timestamps



#### Risk Records Table
```typescript
export const riskRecords = pgTable("risk_records", {
  id: serial("id").primaryKey(),
  riskId: text("risk_id").unique(),
  riskTitle: text("risk_title").notNull(),
  riskType: text("risk_type").notNull(),
  riskCategory: text("risk_category").notNull(),
  businessUnit: text("business_unit").notNull(),
  department: text("department").notNull(),
  
  // RCSA Fields
  objectives: text("objectives"),
  processKeyActivity: text("process_key_activity"),
  description: text("description"),
  rootCauses: text("root_causes"),
  riskImpact: text("risk_impact"),
  existingRiskControl: text("existing_risk_control"),
  potentialRiskResponse: text("potential_risk_response"),
  
  // Scoring
  likelihood: text("likelihood").notNull(),
  levelOfImpact: text("level_of_impact"),
  impact: text("impact").notNull(),
  inherentRisk: text("inherent_risk").notNull(),
  residualRisk: text("residual_risk"),
  riskScore: text("risk_score").notNull(),
  controlEffectivenessScore: text("control_effectiveness_score"),
  
  // Additional
  justification: text("justification"),
  mitigationPlan: text("mitigation_plan"),
  status: text("status").notNull().default("Open"),
  dateReported: text("date_reported").notNull(),
  
  // Metadata
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  isDeleted: boolean("is_deleted").notNull().default(false),
});
```

**Key Features:**
- Auto-generated `riskId` (e.g., IT-01, CR-02)
- Complete RCSA framework fields
- Numeric scores stored as text for precision
- Soft delete with `isDeleted` flag
- Audit trail with creator and timestamps

#### Department Codes Table
```typescript
export const departmentCodes = pgTable("department_codes", {
  id: serial("id").primaryKey(),
  departmentName: text("department_name").notNull().unique(),
  code: text("code").notNull().unique(),
  sequence: integer("sequence").notNull().default(0),
});
```

**Purpose:** Maps department names to 2-letter codes for risk ID generation.

**Example Data:**
- Information Technology → IT
- Credit Management Office → CR
- Risk & Compliance → RC

---

## 6. Backend Services

### 6.1 Storage Service (`server/storage.ts`)

The storage service handles all database operations using Drizzle ORM.

#### Key Methods

**getRiskRecords()**
```typescript
async getRiskRecords(filters?: {
  department?: string | null;
  includeDeleted?: boolean;
}): Promise<RiskRecord[]> {
  let query = db
    .select()
    .from(riskRecords)
    .where(eq(riskRecords.isDeleted, filters?.includeDeleted || false));
  
  if (filters?.department) {
    query = query.where(eq(riskRecords.department, filters.department));
  }
  
  return await query.orderBy(desc(riskRecords.createdAt));
}
```

**Purpose:** Fetches risk records with optional filtering by department and deleted status.

**createRiskRecord()**
```typescript
async createRiskRecord(data: InsertRiskRecord): Promise<RiskRecord> {
  // Generate risk ID if not provided
  if (!data.riskId && data.department) {
    data.riskId = await generateRiskId(data.department);
  }
  
  // Calculate scores
  const likelihood = Number(data.likelihood || 0);
  const impact = Number(data.impact || 0);
  data.inherentRisk = String(calculateInherentRisk(likelihood, impact));
  
  if (data.controlEffectivenessScore) {
    const control = Number(data.controlEffectivenessScore);
    data.residualRisk = String(
      calculateResidualRisk(likelihood, impact, control)
    );
  }
  
  const [record] = await db.insert(riskRecords).values(data).returning();
  return record;
}
```

**Features:**
- Auto-generates risk IDs
- Calculates inherent and residual risk scores
- Returns created record



**getRiskStatistics()**
```typescript
async getRiskStatistics(filters?: {
  department?: string | null;
}): Promise<RiskStatistics> {
  const records = await this.getRiskRecords(filters);
  
  // Count by severity
  const stats = {
    total: records.length,
    veryHigh: records.filter(r => Number(r.riskScore) >= 83.33).length,
    high: records.filter(r => {
      const score = Number(r.riskScore);
      return score >= 62.5 && score < 83.33;
    }).length,
    medium: records.filter(r => {
      const score = Number(r.riskScore);
      return score >= 37.5 && score < 62.5;
    }).length,
    low: records.filter(r => {
      const score = Number(r.riskScore);
      return score >= 16.67 && score < 37.5;
    }).length,
    veryLow: records.filter(r => Number(r.riskScore) < 16.67).length,
  };
  
  // Calculate control effectiveness
  const withControls = records.filter(r => r.controlEffectivenessScore);
  const avgControl = withControls.length > 0
    ? withControls.reduce((sum, r) => 
        sum + Number(r.controlEffectivenessScore), 0) / withControls.length
    : 0;
  
  // Group by status
  const byStatus = records.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Calculate trend (last 12 months)
  const trend = calculateMonthlyTrend(records);
  
  return {
    ...stats,
    controlEffectiveness: { average: avgControl },
    byStatus,
    trend,
  };
}
```

**Returns:** Comprehensive statistics including:
- Risk counts by severity level
- Average control effectiveness
- Status distribution
- 12-month trend data

**getDashboardData()**
```typescript
async getDashboardData(filters?: {
  department?: string | null;
}): Promise<DashboardData> {
  const records = await this.getRiskRecords(filters);
  
  // Map for visualizations
  const risks = records.map(r => ({
    id: r.id,
    riskId: r.riskId || `#${r.id}`,
    riskTitle: r.riskTitle,
    department: r.department,
    likelihood: Number(r.likelihood || 0),
    impact: Number(r.impact || 0),
    inherentRisk: Number(r.inherentRisk || 0),
    residualRisk: r.residualRisk ? Number(r.residualRisk) : null,
    controlEffectiveness: r.controlEffectivenessScore 
      ? Number(r.controlEffectivenessScore) 
      : null,
  }));
  
  // Calculate department-level metrics
  const deptMap: Record<string, {
    total: number;
    count: number;
    risks: number;
  }> = {};
  
  records.forEach(r => {
    if (!deptMap[r.department]) {
      deptMap[r.department] = { total: 0, count: 0, risks: 0 };
    }
    deptMap[r.department].risks++;
    if (r.controlEffectivenessScore) {
      deptMap[r.department].total += Number(r.controlEffectivenessScore);
      deptMap[r.department].count++;
    }
  });
  
  const departmentControls = Object.entries(deptMap).map(
    ([department, data]) => ({
      department,
      avgControlEffectiveness: data.count > 0 
        ? data.total / data.count 
        : 0,
      riskCount: data.risks,
    })
  );
  
  return { risks, departmentControls };
}
```

**Purpose:** Provides data for ORM dashboard visualizations including scatter plots and bar charts.

---

### 6.2 Risk Scoring (`shared/risk-scoring.ts`)

Implements Basel II/III compliant risk scoring methodology.

#### 5×5 Risk Matrix

```typescript
export function calculateInherentRisk(
  likelihood: number,
  impact: number
): number {
  // Convert 0-100 scale to 1-5 scale
  const l = Math.ceil(likelihood / 20) || 1;
  const i = Math.ceil(impact / 20) || 1;
  
  // 5×5 matrix multiplication
  const matrixScore = l * i; // Range: 1-25
  
  // Convert to percentage (0-100)
  return (matrixScore / 25) * 100;
}
```

**Matrix Values:**
```
Impact →    1    2    3    4    5
Likelihood
    1       1    2    3    4    5
    2       2    4    6    8   10
    3       3    6    9   12   15
    4       4    8   12   16   20
    5       5   10   15   20   25
```



**Residual Risk Calculation**
```typescript
export function calculateResidualRisk(
  likelihood: number,
  impact: number,
  controlEffectiveness: number
): number {
  const inherent = calculateInherentRisk(likelihood, impact);
  
  // Apply control effectiveness (0-100%)
  const reduction = (controlEffectiveness / 100) * inherent;
  const residual = inherent - reduction;
  
  return Math.max(0, residual);
}
```

**Example:**
- Likelihood: 80 (High)
- Impact: 90 (Very High)
- Inherent Risk: 72 (High)
- Control Effectiveness: 60%
- Residual Risk: 28.8 (Medium)

**Risk Rating Classification**
```typescript
export function getRiskRating(score: number): RiskRating {
  if (score >= 83.33) return "Very High";  // Matrix 20-25
  if (score >= 62.5) return "High";        // Matrix 15-19
  if (score >= 37.5) return "Medium";      // Matrix 9-14
  if (score >= 16.67) return "Low";        // Matrix 4-8
  return "Very Low";                       // Matrix 0-3
}
```

---

### 6.3 Access Control (`server/access-control.ts`)

Implements role-based access control (RBAC).

```typescript
export class AccessControl {
  static canAccessRisk(user: User, risk: RiskRecord): boolean {
    // Admin and risk managers have full access
    if (user.role === "admin" || user.role === "risk_manager") {
      return true;
    }
    
    // Chief office can access their department
    if (user.role === "chief_office") {
      return user.department === risk.department;
    }
    
    // Regular users can only view
    return user.role === "user";
  }
  
  static canModifyRisk(user: User, risk: RiskRecord): boolean {
    // Admin and risk managers can modify all
    if (user.role === "admin" || user.role === "risk_manager") {
      return true;
    }
    
    // Chief office can modify their department
    if (user.role === "chief_office") {
      return user.department === risk.department;
    }
    
    return false;
  }
  
  static getDepartmentFilter(user: User): string | null {
    // Admin and risk managers see all departments
    if (user.role === "admin" || user.role === "risk_manager") {
      return null;
    }
    
    // Others see only their department
    return user.department || null;
  }
}
```

**Access Matrix:**

| Role | View All | View Own Dept | Create | Edit | Delete |
|------|----------|---------------|--------|------|--------|
| Admin | ✓ | ✓ | ✓ | ✓ | ✓ |
| Risk Manager | ✓ | ✓ | ✓ | ✓ | ✓ |
| Chief Office | ✗ | ✓ | ✓ | ✓ (own) | ✓ (own) |
| User | ✗ | ✓ | ✗ | ✗ | ✗ |

---

### 6.4 Risk ID Generator (`server/risk-id-generator.ts`)

Generates unique department-specific risk IDs.

```typescript
export async function generateRiskId(
  departmentName: string
): Promise<string> {
  // Get department code
  const [dept] = await db
    .select()
    .from(departmentCodes)
    .where(eq(departmentCodes.departmentName, departmentName))
    .limit(1);
  
  if (!dept) {
    throw new Error(`Department code not found: ${departmentName}`);
  }
  
  // Increment sequence
  const [updated] = await db
    .update(departmentCodes)
    .set({ sequence: dept.sequence + 1 })
    .where(eq(departmentCodes.id, dept.id))
    .returning();
  
  // Format: CODE-NUMBER (e.g., IT-01, CR-15)
  return `${dept.code}-${String(updated.sequence).padStart(2, '0')}`;
}
```

**Examples:**
- Information Technology: IT-01, IT-02, IT-03...
- Credit Management: CR-01, CR-02, CR-03...
- Risk & Compliance: RC-01, RC-02, RC-03...

---

### 6.5 Excel Import (`server/excel-import.ts`)

Validates and imports risks from Excel files.

```typescript
export async function validateExcelData(
  data: any[]
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const validRecords: any[] = [];
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNum = i + 2; // Excel row (header is row 1)
    
    // Validate required fields
    if (!row['Risk Title']) {
      errors.push({
        row: rowNum,
        field: 'Risk Title',
        message: 'Risk Title is required',
        value: row['Risk Title'],
      });
    }
    
    if (!row['Department']) {
      errors.push({
        row: rowNum,
        field: 'Department',
        message: 'Department is required',
        value: row['Department'],
      });
    } else if (!VALID_DEPARTMENTS.includes(row['Department'])) {
      errors.push({
        row: rowNum,
        field: 'Department',
        message: `Invalid department. Must be one of: ${VALID_DEPARTMENTS.join(', ')}`,
        value: row['Department'],
      });
    }
    
    // Validate numeric fields
    const likelihood = Number(row['Likelihood']);
    if (isNaN(likelihood) || likelihood < 0 || likelihood > 100) {
      errors.push({
        row: rowNum,
        field: 'Likelihood',
        message: 'Likelihood must be a number between 0 and 100',
        value: row['Likelihood'],
      });
    }
    
    // If no errors for this row, add to valid records
    if (errors.filter(e => e.row === rowNum).length === 0) {
      validRecords.push(normalizeExcelRow(row));
    }
  }
  
  return {
    success: errors.length === 0,
    imported: validRecords.length,
    errors,
    data: validRecords,
  };
}
```

**Validation Rules:**
- Required: Risk Title, Department, Likelihood, Impact
- Department must be in predefined list
- Numeric fields must be 0-100
- Dates must be valid format



---

## 7. Frontend Components

### 7.1 Dashboard Component (`client/src/pages/dashboard.tsx`)

The main dashboard displays 6 ORM visualizations using Recharts library.

#### Component Structure

```typescript
export default function Dashboard() {
  // Fetch statistics and dashboard data
  const { data: stats, isLoading: statsLoading } = useQuery<RiskStatistics>({
    queryKey: ["/api/risks/statistics"],
  });

  const { data: dashboardData, isLoading: dataLoading } = useQuery<any>({
    queryKey: ["/api/risks/dashboard-data"],
  });

  const isLoading = statsLoading || dataLoading;
  const risks = dashboardData?.risks || [];
  const departmentControls = dashboardData?.departmentControls || [];

  // Render loading state, then dashboard
}
```

#### Visualization 1: Residual vs Inherent Risk Scatter Plot

```typescript
<ResponsiveContainer width="100%" height={300}>
  <ScatterChart margin={{ top: 20, right: 30, left: 60, bottom: 20 }}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis 
      type="number" 
      dataKey="inherentRisk" 
      domain={[0, 100]} 
      label={{ value: 'Inherent Risk', position: 'insideBottom' }} 
    />
    <YAxis 
      type="number" 
      dataKey="residualRisk" 
      domain={[0, 100]} 
      label={{ value: 'Residual Risk', angle: -90 }} 
    />
    <Tooltip content={CustomTooltip} />
    <ReferenceLine 
      segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]} 
      stroke="#666" 
      strokeWidth={2} 
    />
    <Scatter data={risks.filter(r => r.residualRisk !== null)}>
      {risks.map((entry, index) => (
        <Cell fill={getControlColor(entry.controlEffectiveness || 0)} />
      ))}
    </Scatter>
  </ScatterChart>
</ResponsiveContainer>
```

**Purpose:** Shows control effectiveness by comparing inherent vs residual risk.

**Key Features:**
- Diagonal reference line (y=x) shows no control effect
- Points below line indicate effective controls
- Color-coded by control effectiveness percentage
- Interactive tooltips with risk details

#### Visualization 2: Control Effectiveness by Department

```typescript
<ResponsiveContainer width="100%" height={300}>
  <BarChart 
    data={departmentControls} 
    margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
  >
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis 
      dataKey="department" 
      angle={-45} 
      textAnchor="end" 
      height={60} 
      style={{ fontSize: '8px' }} 
    />
    <YAxis 
      domain={[0, 100]} 
      label={{ value: 'Control (%)', angle: -90 }} 
    />
    <Tooltip content={DepartmentTooltip} />
    <Bar dataKey="avgControlEffectiveness" radius={[8, 8, 0, 0]}>
      {departmentControls.map((entry, index) => (
        <Cell fill={getControlColor(entry.avgControlEffectiveness)} />
      ))}
    </Bar>
  </BarChart>
</ResponsiveContainer>
```

**Purpose:** Compares control maturity across all 16 departments.

**Key Features:**
- Bars color-coded by maturity level
- Angled labels for readability
- Shows average control effectiveness percentage
- Tooltip displays maturity level and risk count

#### Color Coding Function

```typescript
const getControlColor = (score: number) => {
  if (score >= 80) return "#22c55e"; // green - Risk Enabled
  if (score >= 60) return "#3b82f6"; // blue - Risk Managed
  if (score >= 40) return "#eab308"; // yellow - Risk Defined
  if (score >= 20) return "#f97316"; // orange - Risk Aware
  return "#ef4444"; // red - Risk Naive
};
```

#### Maturity Level Function

```typescript
const getMaturityLevel = (score: number) => {
  if (score >= 80) return { 
    level: "Risk Enabled", 
    color: "bg-green-500", 
    description: "Proactive risk management" 
  };
  if (score >= 60) return { 
    level: "Risk Managed", 
    color: "bg-blue-500", 
    description: "Systematic risk management" 
  };
  if (score >= 40) return { 
    level: "Risk Defined", 
    color: "bg-yellow-500", 
    description: "Documented processes" 
  };
  if (score >= 20) return { 
    level: "Risk Aware", 
    color: "bg-orange-500", 
    description: "Basic awareness" 
  };
  return { 
    level: "Risk Naive", 
    color: "bg-red-500", 
    description: "Minimal controls" 
  };
};
```

---

### 7.2 Risk Form Component (`client/src/pages/risk-form.tsx`)

Multi-tab form for creating and editing risks with real-time calculations.

#### Tab Structure

```typescript
<Tabs defaultValue="basic" className="w-full">
  <TabsList className="grid w-full grid-cols-4">
    <TabsTrigger value="basic">Basic Info</TabsTrigger>
    <TabsTrigger value="assessment">Assessment</TabsTrigger>
    <TabsTrigger value="controls">Controls</TabsTrigger>
    <TabsTrigger value="response">Response</TabsTrigger>
  </TabsList>

  <TabsContent value="basic">
    {/* Basic information fields */}
  </TabsContent>

  <TabsContent value="assessment">
    {/* Risk assessment and scoring */}
  </TabsContent>

  <TabsContent value="controls">
    {/* Control effectiveness */}
  </TabsContent>

  <TabsContent value="response">
    {/* Mitigation planning */}
  </TabsContent>
</Tabs>
```

#### Real-Time Risk Calculation

```typescript
// Watch likelihood and impact changes
useEffect(() => {
  const likelihood = Number(formData.likelihood || 0);
  const impact = Number(formData.impact || 0);
  
  if (likelihood > 0 && impact > 0) {
    const inherent = calculateInherentRisk(likelihood, impact);
    setFormData(prev => ({
      ...prev,
      inherentRisk: String(inherent),
      riskScore: String(inherent),
    }));
  }
}, [formData.likelihood, formData.impact]);

// Watch control effectiveness changes
useEffect(() => {
  const likelihood = Number(formData.likelihood || 0);
  const impact = Number(formData.impact || 0);
  const control = Number(formData.controlEffectivenessScore || 0);
  
  if (likelihood > 0 && impact > 0 && control > 0) {
    const residual = calculateResidualRisk(likelihood, impact, control);
    setFormData(prev => ({
      ...prev,
      residualRisk: String(residual),
    }));
  }
}, [formData.controlEffectivenessScore]);
```

#### Form Submission

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    if (isEditMode) {
      await updateMutation.mutateAsync({
        id: riskId,
        data: formData,
      });
      toast({ title: "Risk updated successfully" });
    } else {
      await createMutation.mutateAsync(formData);
      toast({ title: "Risk created successfully" });
    }
    navigate("/risks");
  } catch (error) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  }
};
```

---

### 7.3 Risk Register Component (`client/src/pages/risks.tsx`)

Displays all risks in a filterable, sortable table.

#### Data Fetching with Filters

```typescript
const [filters, setFilters] = useState({
  department: "",
  status: "",
  riskLevel: "",
});

const { data: risks, isLoading } = useQuery<RiskRecord[]>({
  queryKey: ["/api/risks", filters],
  queryFn: async () => {
    const params = new URLSearchParams();
    if (filters.department) params.append("department", filters.department);
    if (filters.status) params.append("status", filters.status);
    if (filters.riskLevel) params.append("riskLevel", filters.riskLevel);
    
    const response = await fetch(`/api/risks?${params}`);
    return response.json();
  },
});
```

#### Table with Actions

```typescript
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Risk ID</TableHead>
      <TableHead>Title</TableHead>
      <TableHead>Department</TableHead>
      <TableHead>Risk Score</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {risks?.map((risk) => (
      <TableRow key={risk.id}>
        <TableCell>{risk.riskId}</TableCell>
        <TableCell>{risk.riskTitle}</TableCell>
        <TableCell>{risk.department}</TableCell>
        <TableCell>
          <RiskRatingBadge score={Number(risk.riskScore)} />
        </TableCell>
        <TableCell>
          <Badge variant={getStatusVariant(risk.status)}>
            {risk.status}
          </Badge>
        </TableCell>
        <TableCell>
          <Button onClick={() => navigate(`/risks/${risk.id}/edit`)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button onClick={() => handleDelete(risk.id)}>
            <Trash className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

### 7.4 Authentication Context (`client/src/lib/auth.tsx`)

Manages user authentication state across the application.

```typescript
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("auth_token")
  );
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("auth_token");
      if (storedToken) {
        try {
          const response = await fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setToken(storedToken);
          } else {
            localStorage.removeItem("auth_token");
            setToken(null);
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem("auth_token");
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    const data = await response.json();
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("auth_token", data.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**Features:**
- Persistent authentication via localStorage
- Automatic token validation on app load
- Centralized login/logout logic
- Loading state management

---


## 8. API Endpoints

### 8.1 Authentication Endpoints

#### POST `/api/auth/login`

**Purpose:** Authenticate user and return JWT token

**Request Body:**
```json
{
  "email": "user@awashbank.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "email": "user@awashbank.com",
    "fullName": "John Doe",
    "role": "chief_office",
    "department": "Information Technology"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (401 Unauthorized):**
```json
{
  "message": "Invalid credentials"
}
```

**Implementation:**
```typescript
app.post("/api/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  const user = await storage.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  
  const token = jwt.sign(
    { userId: user.id, role: user.role, department: user.department },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
  
  const { passwordHash, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword, token });
});
```

#### GET `/api/auth/me`

**Purpose:** Get current user information

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@awashbank.com",
  "fullName": "John Doe",
  "role": "chief_office",
  "department": "Information Technology"
}
```

---

### 8.2 Risk Management Endpoints

#### GET `/api/risks`

**Purpose:** Fetch all risks (filtered by user permissions)

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `department` (optional) - Filter by department
- `status` (optional) - Filter by status
- `includeDeleted` (optional) - Include soft-deleted risks

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "riskId": "IT-01",
    "riskTitle": "Cybersecurity breach risk",
    "department": "Information Technology",
    "riskScore": "72.0",
    "status": "Open",
    "createdAt": "2024-12-01T10:00:00Z"
  }
]
```

**Implementation:**
```typescript
app.get("/api/risks", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = {
      userId: req.userId!,
      role: req.userRole!,
      department: req.userDepartment!,
    };
    
    const departmentFilter = AccessControl.getDepartmentFilter(user);
    const risks = await storage.getRiskRecords({
      department: departmentFilter,
      includeDeleted: req.query.includeDeleted === "true",
    });
    
    res.json(risks);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
```

#### POST `/api/risks`

**Purpose:** Create new risk

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "riskTitle": "Cybersecurity breach risk",
  "riskType": "Operational",
  "riskCategory": "Technology",
  "businessUnit": "IT Services",
  "department": "Information Technology",
  "likelihood": "80",
  "impact": "90",
  "status": "Open",
  "dateReported": "2024-12-01",
  "description": "Risk of unauthorized access...",
  "controlEffectivenessScore": "60"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "riskId": "IT-01",
  "riskTitle": "Cybersecurity breach risk",
  "inherentRisk": "72.0",
  "residualRisk": "28.8",
  "createdAt": "2024-12-01T10:00:00Z"
}
```

#### PUT `/api/risks/:id`

**Purpose:** Update existing risk

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** Same as POST

**Response (200 OK):** Updated risk object

**Authorization Check:**
```typescript
app.put("/api/risks/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  const riskId = parseInt(req.params.id);
  const risk = await storage.getRiskRecord(riskId);
  
  if (!risk) {
    return res.status(404).json({ message: "Risk not found" });
  }
  
  const user = {
    userId: req.userId!,
    role: req.userRole!,
    department: req.userDepartment!,
  };
  
  if (!AccessControl.canModifyRisk(user, risk)) {
    return res.status(403).json({ message: "Access denied" });
  }
  
  const updated = await storage.updateRiskRecord(riskId, req.body);
  res.json(updated);
});
```

#### DELETE `/api/risks/:id`

**Purpose:** Soft delete risk

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Risk deleted successfully"
}
```

---

### 8.3 Statistics & Dashboard Endpoints

#### GET `/api/risks/statistics`

**Purpose:** Get risk statistics for dashboard

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "total": 150,
  "veryHigh": 10,
  "high": 25,
  "medium": 60,
  "low": 40,
  "veryLow": 15,
  "controlEffectiveness": {
    "average": 65.5
  },
  "byStatus": {
    "Open": 50,
    "In Progress": 40,
    "Mitigated": 30,
    "Closed": 20,
    "Accepted": 10
  },
  "trend": [
    { "month": "Jan 2024", "count": 12 },
    { "month": "Feb 2024", "count": 15 },
    { "month": "Mar 2024", "count": 18 }
  ]
}
```

#### GET `/api/risks/dashboard-data`

**Purpose:** Get detailed data for ORM visualizations

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "risks": [
    {
      "id": 1,
      "riskId": "IT-01",
      "riskTitle": "Cybersecurity breach",
      "department": "Information Technology",
      "likelihood": 80,
      "impact": 90,
      "inherentRisk": 72,
      "residualRisk": 28.8,
      "controlEffectiveness": 60
    }
  ],
  "departmentControls": [
    {
      "department": "Information Technology",
      "avgControlEffectiveness": 65.5,
      "riskCount": 15
    }
  ]
}
```

---

### 8.4 Excel Import Endpoints

#### POST `/api/risks/import/validate`

**Purpose:** Validate Excel data before import

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "data": [
    {
      "Risk Title": "Example risk",
      "Department": "Information Technology",
      "Likelihood": 80,
      "Impact": 90
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "imported": 1,
  "errors": [],
  "data": [
    {
      "riskTitle": "Example risk",
      "department": "Information Technology",
      "likelihood": "80",
      "impact": "90"
    }
  ]
}
```

**Response with Errors:**
```json
{
  "success": false,
  "imported": 0,
  "errors": [
    {
      "row": 2,
      "field": "Department",
      "message": "Invalid department",
      "value": "Invalid Dept"
    }
  ],
  "data": []
}
```

#### POST `/api/risks/import/execute`

**Purpose:** Import validated risks

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "data": [
    {
      "riskTitle": "Example risk",
      "department": "Information Technology",
      "likelihood": "80",
      "impact": "90"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "imported": 1,
  "failed": 0,
  "risks": [
    {
      "id": 1,
      "riskId": "IT-01",
      "riskTitle": "Example risk"
    }
  ]
}
```

---


## 9. Security & Access Control

### 9.1 Authentication Flow

```
┌─────────┐                ┌─────────┐                ┌──────────┐
│ Client  │                │ Server  │                │ Database │
└────┬────┘                └────┬────┘                └────┬─────┘
     │                          │                          │
     │ POST /api/auth/login     │                          │
     │ {email, password}        │                          │
     ├─────────────────────────>│                          │
     │                          │ Query user by email      │
     │                          ├─────────────────────────>│
     │                          │<─────────────────────────┤
     │                          │ User record              │
     │                          │                          │
     │                          │ Verify password (bcrypt) │
     │                          │                          │
     │                          │ Generate JWT token       │
     │                          │                          │
     │<─────────────────────────┤                          │
     │ {user, token}            │                          │
     │                          │                          │
     │ Store token in           │                          │
     │ localStorage             │                          │
     │                          │                          │
     │ GET /api/risks           │                          │
     │ Authorization: Bearer... │                          │
     ├─────────────────────────>│                          │
     │                          │ Verify JWT token         │
     │                          │                          │
     │                          │ Check permissions        │
     │                          │                          │
     │                          │ Query risks              │
     │                          ├─────────────────────────>│
     │                          │<─────────────────────────┤
     │<─────────────────────────┤                          │
     │ Risk data                │                          │
```

### 9.2 JWT Token Structure

```typescript
// Token Payload
{
  "userId": 1,
  "role": "chief_office",
  "department": "Information Technology",
  "iat": 1701432000,  // Issued at
  "exp": 1702036800   // Expires (7 days)
}
```

**Token Generation:**
```typescript
const token = jwt.sign(
  {
    userId: user.id,
    role: user.role,
    department: user.department,
  },
  process.env.JWT_SECRET!,
  { expiresIn: "7d" }
);
```

**Token Verification Middleware:**
```typescript
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.userDepartment = decoded.department;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
```

### 9.3 Password Security

**Hashing with bcrypt:**
```typescript
import bcrypt from "bcryptjs";

// Hash password during user creation
const saltRounds = 10;
const passwordHash = await bcrypt.hash(plainPassword, saltRounds);

// Verify password during login
const isValid = await bcrypt.compare(plainPassword, storedHash);
```

**Password Requirements:**
- Minimum 8 characters
- Stored as bcrypt hash (never plain text)
- Salt rounds: 10 (2^10 iterations)

### 9.4 Role-Based Access Control (RBAC)

**Permission Matrix:**

| Resource | Admin | Risk Manager | Chief Office | User |
|----------|-------|--------------|--------------|------|
| View All Risks | ✓ | ✓ | ✗ | ✗ |
| View Own Dept | ✓ | ✓ | ✓ | ✓ |
| Create Risk | ✓ | ✓ | ✓ | ✗ |
| Edit Own Dept | ✓ | ✓ | ✓ | ✗ |
| Edit All | ✓ | ✓ | ✗ | ✗ |
| Delete Own Dept | ✓ | ✓ | ✓ | ✗ |
| Delete All | ✓ | ✓ | ✗ | ✗ |
| Manage Users | ✓ | ✗ | ✗ | ✗ |
| System Config | ✓ | ✗ | ✗ | ✗ |

**Implementation:**
```typescript
export class AccessControl {
  static canAccessRisk(user: User, risk: RiskRecord): boolean {
    if (user.role === "admin" || user.role === "risk_manager") {
      return true;
    }
    if (user.role === "chief_office") {
      return user.department === risk.department;
    }
    return user.role === "user";
  }
  
  static canModifyRisk(user: User, risk: RiskRecord): boolean {
    if (user.role === "admin" || user.role === "risk_manager") {
      return true;
    }
    if (user.role === "chief_office") {
      return user.department === risk.department;
    }
    return false;
  }
  
  static getDepartmentFilter(user: User): string | null {
    if (user.role === "admin" || user.role === "risk_manager") {
      return null; // See all departments
    }
    return user.department || null; // See only own department
  }
}
```

### 9.5 SQL Injection Prevention

**Using Drizzle ORM with Parameterized Queries:**
```typescript
// SAFE - Parameterized query
const risks = await db
  .select()
  .from(riskRecords)
  .where(eq(riskRecords.department, userDepartment));

// UNSAFE - String concatenation (NEVER DO THIS)
// const risks = await db.execute(
//   `SELECT * FROM risk_records WHERE department = '${userDepartment}'`
// );
```

**All database queries use Drizzle ORM's query builder, which automatically:**
- Escapes special characters
- Uses parameterized queries
- Prevents SQL injection attacks

### 9.6 XSS Prevention

**React's Built-in Protection:**
- React automatically escapes all values rendered in JSX
- Prevents script injection through user input

**Example:**
```typescript
// SAFE - React escapes the content
<div>{risk.riskTitle}</div>

// UNSAFE - dangerouslySetInnerHTML (avoid unless necessary)
// <div dangerouslySetInnerHTML={{ __html: risk.riskTitle }} />
```

**Input Validation:**
```typescript
// Validate and sanitize user input
const validateRiskTitle = (title: string): boolean => {
  if (!title || title.trim().length === 0) {
    return false;
  }
  if (title.length > 500) {
    return false;
  }
  return true;
};
```

### 9.7 CORS Configuration

```typescript
import cors from "cors";

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
```

### 9.8 Environment Variables Security

**Required Environment Variables:**
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/awash_risk

# Authentication
JWT_SECRET=your-secret-key-min-32-chars

# Active Directory (Optional)
AD_TENANT_ID=your-tenant-id
AD_CLIENT_ID=your-client-id
AD_CLIENT_SECRET=your-client-secret
AD_REDIRECT_URI=http://localhost:5000/api/auth/ad/callback

# Server
PORT=5000
NODE_ENV=production
```

**Security Best Practices:**
- Never commit `.env` file to version control
- Use strong, random JWT_SECRET (minimum 32 characters)
- Rotate secrets regularly
- Use different secrets for dev/staging/production
- Store production secrets in secure vault (e.g., AWS Secrets Manager)

---

## 10. Database Schema Details

### 10.1 Complete Schema Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                          users                               │
├─────────────────────────────────────────────────────────────┤
│ id (PK)                    SERIAL                           │
│ email                      TEXT UNIQUE NOT NULL             │
│ password_hash              TEXT NOT NULL                     │
│ full_name                  TEXT NOT NULL                     │
│ role                       TEXT NOT NULL DEFAULT 'user'     │
│ department                 TEXT                             │
│ is_active                  BOOLEAN NOT NULL DEFAULT true    │
│ created_at                 TIMESTAMP NOT NULL               │
│ updated_at                 TIMESTAMP NOT NULL               │
└─────────────────────────────────────────────────────────────┘
                                  │
                                  │ created_by (FK)
                                  ▼
┌─────────────────────────────────────────────────────────────┐
│                      risk_records                            │
├─────────────────────────────────────────────────────────────┤
│ id (PK)                    SERIAL                           │
│ risk_id                    TEXT UNIQUE                      │
│ risk_title                 TEXT NOT NULL                     │
│ risk_type                  TEXT NOT NULL                     │
│ risk_category              TEXT NOT NULL                     │
│ business_unit              TEXT NOT NULL                     │
│ department                 TEXT NOT NULL                     │
│ objectives                 TEXT                             │
│ process_key_activity       TEXT                             │
│ description                TEXT                             │
│ root_causes                TEXT                             │
│ risk_impact                TEXT                             │
│ existing_risk_control      TEXT                             │
│ potential_risk_response    TEXT                             │
│ likelihood                 TEXT NOT NULL                     │
│ level_of_impact            TEXT                             │
│ impact                     TEXT NOT NULL                     │
│ inherent_risk              TEXT NOT NULL                     │
│ residual_risk              TEXT                             │
│ risk_score                 TEXT NOT NULL                     │
│ control_effectiveness_score TEXT                            │
│ justification              TEXT                             │
│ mitigation_plan            TEXT                             │
│ status                     TEXT NOT NULL DEFAULT 'Open'     │
│ date_reported              TEXT NOT NULL                     │
│ created_by (FK)            INTEGER → users.id               │
│ created_at                 TIMESTAMP NOT NULL               │
│ updated_at                 TIMESTAMP NOT NULL               │
│ is_deleted                 BOOLEAN NOT NULL DEFAULT false   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   department_codes                           │
├─────────────────────────────────────────────────────────────┤
│ id (PK)                    SERIAL                           │
│ department_name            TEXT UNIQUE NOT NULL             │
│ code                       TEXT UNIQUE NOT NULL             │
│ sequence                   INTEGER NOT NULL DEFAULT 0       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   risk_collaborators                         │
├─────────────────────────────────────────────────────────────┤
│ id (PK)                    SERIAL                           │
│ risk_id (FK)               INTEGER → risk_records.id        │
│ user_id (FK)               INTEGER → users.id               │
│ role                       TEXT NOT NULL                     │
│ added_at                   TIMESTAMP NOT NULL               │
└─────────────────────────────────────────────────────────────┘
```

### 10.2 Indexes

**Performance Optimization:**
```sql
-- Primary keys (automatic indexes)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_risk_records_risk_id ON risk_records(risk_id);

-- Foreign keys
CREATE INDEX idx_risk_records_created_by ON risk_records(created_by);
CREATE INDEX idx_risk_collaborators_risk_id ON risk_collaborators(risk_id);
CREATE INDEX idx_risk_collaborators_user_id ON risk_collaborators(user_id);

-- Query optimization
CREATE INDEX idx_risk_records_department ON risk_records(department);
CREATE INDEX idx_risk_records_status ON risk_records(status);
CREATE INDEX idx_risk_records_is_deleted ON risk_records(is_deleted);
CREATE INDEX idx_risk_records_created_at ON risk_records(created_at DESC);
```

### 10.3 Database Migrations

**Migration File Structure:**
```sql
-- migrations/001_add_new_features.sql

-- Add new columns
ALTER TABLE risk_records 
ADD COLUMN IF NOT EXISTS risk_title TEXT;

ALTER TABLE risk_records 
ADD COLUMN IF NOT EXISTS objectives TEXT;

-- Create new tables
CREATE TABLE IF NOT EXISTS department_codes (
  id SERIAL PRIMARY KEY,
  department_name TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  sequence INTEGER NOT NULL DEFAULT 0
);

-- Insert department codes
INSERT INTO department_codes (department_name, code) VALUES
('Information Technology', 'IT'),
('Credit Management Office', 'CR'),
('Risk & Compliance', 'RC')
ON CONFLICT (department_name) DO NOTHING;
```

**Running Migrations:**
```bash
# Development
npm run migrate

# Production
NODE_ENV=production npm run migrate
```

**Migration Script (`server/migrate.ts`):**
```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const runMigrations = async () => {
  const connection = postgres(process.env.DATABASE_URL!, { max: 1 });
  const db = drizzle(connection);
  
  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./migrations" });
  console.log("Migrations completed!");
  
  await connection.end();
};

runMigrations().catch(console.error);
```

---


## 11. Deployment

### 11.1 Production Build

**Build Process:**
```bash
# Install dependencies
npm install

# Run database migrations
npm run migrate

# Build frontend and backend
npm run build
```

**Build Output:**
```
dist/
├── public/                    # Frontend static files
│   ├── index.html
│   ├── assets/
│   │   ├── index-[hash].js   # Bundled JavaScript
│   │   └── index-[hash].css  # Bundled CSS
│   └── favicon.png
└── index.js                   # Backend server bundle
```

### 11.2 Environment Configuration

**Production `.env` File:**
```bash
# Database
DATABASE_URL=postgresql://user:password@prod-db.example.com:5432/awash_risk

# Authentication
JWT_SECRET=your-production-secret-min-32-chars-random

# Active Directory
AD_TENANT_ID=your-tenant-id
AD_CLIENT_ID=your-client-id
AD_CLIENT_SECRET=your-client-secret
AD_REDIRECT_URI=https://yourdomain.com/api/auth/ad/callback

# Server
PORT=5000
NODE_ENV=production

# Optional
LOG_LEVEL=info
MAX_FILE_SIZE=10485760  # 10MB
```

### 11.3 Server Deployment

**Using PM2 (Process Manager):**
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start dist/index.js --name awash-risk-dashboard

# Configure auto-restart
pm2 startup
pm2 save

# Monitor
pm2 status
pm2 logs awash-risk-dashboard
pm2 monit
```

**PM2 Ecosystem File (`ecosystem.config.js`):**
```javascript
module.exports = {
  apps: [{
    name: 'awash-risk-dashboard',
    script: './dist/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
```

**Start with Ecosystem:**
```bash
pm2 start ecosystem.config.js
```

### 11.4 Nginx Configuration

**Reverse Proxy Setup:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000" always;
    
    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:5000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # File upload size limit
    client_max_body_size 10M;
}
```

### 11.5 Docker Deployment

**Dockerfile:**
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --production

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/migrations ./migrations

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/index.js"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: awash_risk
      POSTGRES_USER: awash_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U awash_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://awash_user:${DB_PASSWORD}@postgres:5432/awash_risk
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

volumes:
  postgres_data:
```

**Deploy with Docker Compose:**
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop
docker-compose down
```

### 11.6 Database Backup

**Automated Backup Script:**
```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="awash_risk"
DB_USER="awash_user"
DB_HOST="localhost"

# Create backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -F c -f "$BACKUP_DIR/backup_$DATE.dump"

# Compress
gzip "$BACKUP_DIR/backup_$DATE.dump"

# Delete backups older than 30 days
find $BACKUP_DIR -name "backup_*.dump.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.dump.gz"
```

**Cron Job (Daily at 2 AM):**
```bash
0 2 * * * /path/to/backup-db.sh >> /var/log/db-backup.log 2>&1
```

**Restore from Backup:**
```bash
# Decompress
gunzip backup_20241208_020000.dump.gz

# Restore
pg_restore -h localhost -U awash_user -d awash_risk -c backup_20241208_020000.dump
```

### 11.7 Monitoring & Logging

**Application Logging:**
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Usage
logger.info('User logged in', { userId: 1, email: 'user@example.com' });
logger.error('Database connection failed', { error: err.message });
```

**Health Check Endpoint:**
```typescript
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await db.select().from(users).limit(1);
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});
```

**Monitoring with PM2:**
```bash
# Real-time monitoring
pm2 monit

# Web dashboard
pm2 web

# Metrics
pm2 describe awash-risk-dashboard
```

---

## 12. Maintenance & Troubleshooting

### 12.1 Common Issues

#### Issue: Database Connection Fails

**Symptoms:**
- Application crashes on startup
- Error: "Connection refused" or "ECONNREFUSED"

**Solutions:**
1. Verify DATABASE_URL is correct
2. Check PostgreSQL is running: `systemctl status postgresql`
3. Verify network connectivity: `telnet db-host 5432`
4. Check PostgreSQL logs: `/var/log/postgresql/`
5. Verify user permissions in PostgreSQL

#### Issue: JWT Token Expired

**Symptoms:**
- Users logged out unexpectedly
- 401 Unauthorized errors

**Solutions:**
1. Token expires after 7 days (default)
2. Users need to log in again
3. Adjust expiry in code if needed:
```typescript
jwt.sign(payload, secret, { expiresIn: "30d" }); // 30 days
```

#### Issue: Excel Import Fails

**Symptoms:**
- Validation errors
- Import hangs or times out

**Solutions:**
1. Check file size (max 10MB)
2. Verify column headers match template exactly
3. Check for special characters in data
4. Validate department names
5. Ensure numeric fields are valid numbers

#### Issue: Dashboard Charts Not Loading

**Symptoms:**
- Blank charts
- Loading spinner indefinitely

**Solutions:**
1. Check browser console for errors
2. Verify API endpoints are responding
3. Check if data exists in database
4. Clear browser cache
5. Verify user has access to data

### 12.2 Database Maintenance

**Vacuum Database (Reclaim Space):**
```sql
VACUUM ANALYZE risk_records;
VACUUM ANALYZE users;
```

**Reindex Tables:**
```sql
REINDEX TABLE risk_records;
REINDEX TABLE users;
```

**Check Database Size:**
```sql
SELECT 
  pg_size_pretty(pg_database_size('awash_risk')) as database_size;
```

**Check Table Sizes:**
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 12.3 Performance Optimization

**Query Optimization:**
```typescript
// BAD - N+1 query problem
const risks = await db.select().from(riskRecords);
for (const risk of risks) {
  const creator = await db.select().from(users).where(eq(users.id, risk.createdBy));
}

// GOOD - Join query
const risks = await db
  .select()
  .from(riskRecords)
  .leftJoin(users, eq(riskRecords.createdBy, users.id));
```

**Caching Strategy:**
```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

app.get('/api/risks/statistics', authMiddleware, async (req, res) => {
  const cacheKey = `stats_${req.userDepartment}`;
  
  // Check cache
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }
  
  // Fetch from database
  const stats = await storage.getRiskStatistics({
    department: req.userDepartment,
  });
  
  // Store in cache
  cache.set(cacheKey, stats);
  
  res.json(stats);
});
```

**Database Connection Pooling:**
```typescript
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, {
  max: 20,              // Maximum connections
  idle_timeout: 20,     // Close idle connections after 20s
  connect_timeout: 10,  // Connection timeout
});
```

### 12.4 Security Audits

**Regular Security Checks:**
```bash
# Check for vulnerable dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

**SSL Certificate Renewal:**
```bash
# Using Let's Encrypt (certbot)
certbot renew --dry-run

# Auto-renewal cron job
0 0 1 * * certbot renew --quiet
```

### 12.5 Backup & Recovery

**Full System Backup:**
```bash
#!/bin/bash
# full-backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/full_$DATE"

mkdir -p $BACKUP_DIR

# Database backup
pg_dump -h localhost -U awash_user -d awash_risk -F c -f "$BACKUP_DIR/database.dump"

# Application files
tar -czf "$BACKUP_DIR/application.tar.gz" /path/to/app

# Environment variables (encrypted)
gpg --encrypt --recipient admin@awashbank.com -o "$BACKUP_DIR/.env.gpg" /path/to/app/.env

echo "Full backup completed: $BACKUP_DIR"
```

**Disaster Recovery Plan:**
1. Restore database from latest backup
2. Deploy application from version control
3. Restore environment variables
4. Run database migrations
5. Verify system health
6. Notify users of restoration

---

## 13. Appendix

### 13.1 Department Codes Reference

| Department | Code | Example Risk ID |
|------------|------|-----------------|
| Information Technology | IT | IT-01, IT-02 |
| Credit Management Office | CR | CR-01, CR-02 |
| Risk & Compliance | RC | RC-01, RC-02 |
| Finance Office | FN | FN-01, FN-02 |
| Human Capital | HC | HC-01, HC-02 |
| Internal Audit | IA | IA-01, IA-02 |
| Legal Service | LS | LS-01, LS-02 |
| Marketing Office | MK | MK-01, MK-02 |
| Retail & SME | RS | RS-01, RS-02 |
| Wholesale Banking | WB | WB-01, WB-02 |
| Trade Service | TS | TS-01, TS-02 |
| Digital Banking | DB | DB-01, DB-02 |
| Corporate Strategy | CS | CS-01, CS-02 |
| Facility Management | FM | FM-01, FM-02 |
| Transformation Office | TO | TO-01, TO-02 |
| IFB | IFB | IFB-01, IFB-02 |

### 13.2 Risk Rating Reference

| Score Range | Matrix Range | Rating | Color | Action |
|-------------|--------------|--------|-------|--------|
| 83.33-100 | 20-25 | Very High | Red | Immediate |
| 62.5-83.33 | 15-19 | High | Orange | Urgent |
| 37.5-62.5 | 9-14 | Medium | Yellow | Required |
| 16.67-37.5 | 4-8 | Low | Blue | Monitor |
| 0-16.67 | 0-3 | Very Low | Green | Accept |

### 13.3 Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run migrate      # Run database migrations

# Database
npm run db:push      # Push schema changes
npm run db:studio    # Open Drizzle Studio
npm run db:seed      # Seed database

# Production
npm start            # Start production server
pm2 start dist/index.js  # Start with PM2
pm2 logs             # View logs
pm2 restart all      # Restart application
```

### 13.4 Support & Resources

**Documentation:**
- Technical Documentation: `/docs/TECHNICAL_DOCUMENTATION.md`
- User Guide: `/docs/USER_GUIDE.md`
- Excel Import Guide: `/docs/EXCEL_IMPORT_GUIDE.md`
- README: `/README.md`

**External Resources:**
- React: https://react.dev
- TypeScript: https://www.typescriptlang.org
- Drizzle ORM: https://orm.drizzle.team
- Express.js: https://expressjs.com
- Recharts: https://recharts.org

**Contact:**
- Development Team: dev@awashbank.com
- System Administrator: admin@awashbank.com
- IT Support: itsupport@awashbank.com

---

**Document Version:** 1.0  
**Last Updated:** December 8, 2025  
**Next Review:** March 2026

---

*End of Technical Documentation*
