// Central constants for departments, roles, and access control

// 16 Chief Offices / Departments
export const DEPARTMENTS = [
  { code: 'CR', name: 'Credit Management Office', chiefOffice: 'Credit Management Office' },
  { code: 'CS', name: 'Corporate Strategy', chiefOffice: 'Corporate Strategy' },
  { code: 'DB', name: 'Digital Banking', chiefOffice: 'Digital Banking' },
  { code: 'FM', name: 'Facility Management', chiefOffice: 'Facility Management' },
  { code: 'FO', name: 'Finance Office', chiefOffice: 'Finance Office' },
  { code: 'HC', name: 'Human Capital', chiefOffice: 'Human Capital' },
  { code: 'IF', name: 'IFB', chiefOffice: 'IFB' },
  { code: 'IT', name: 'Information & IT Service', chiefOffice: 'Information & IT Service' },
  { code: 'IA', name: 'Internal Audit', chiefOffice: 'Internal Audit' },
  { code: 'LS', name: 'Legal Service', chiefOffice: 'Legal Service' },
  { code: 'MO', name: 'Marketing Office', chiefOffice: 'Marketing Office' },
  { code: 'RS', name: 'Retail & SME', chiefOffice: 'Retail & SME' },
  { code: 'RC', name: 'Risk & Compliance', chiefOffice: 'Risk & Compliance' },
  { code: 'TO', name: 'Transformation Office', chiefOffice: 'Transformation Office' },
  { code: 'TS', name: 'Trade Service', chiefOffice: 'Trade Service' },
  { code: 'WS', name: 'Wholesale Banking', chiefOffice: 'Wholesale Banking' },
] as const;

export type DepartmentCode = typeof DEPARTMENTS[number]['code'];
export type DepartmentName = typeof DEPARTMENTS[number]['name'];

// Role definitions with access levels
export const ROLES = {
  // Full system access
  ADMIN: 'admin',
  
  // Risk department - full access to all risks
  RISK_MANAGER: 'risk_manager',
  
  // Chief Office roles - access to their department only
  CHIEF_OFFICE: 'chief_office',
  
  // Department users - read-only access
  USER: 'user',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

// Access level definitions
export const ACCESS_LEVELS = {
  FULL: 'full', // See and edit all risks
  DEPARTMENT: 'department', // See only own department risks
  READ_ONLY: 'read_only', // View only, no edit
} as const;

// Role to access level mapping
export const ROLE_ACCESS_MAP: Record<string, string> = {
  [ROLES.ADMIN]: ACCESS_LEVELS.FULL,
  [ROLES.RISK_MANAGER]: ACCESS_LEVELS.FULL,
  [ROLES.CHIEF_OFFICE]: ACCESS_LEVELS.DEPARTMENT,
  [ROLES.USER]: ACCESS_LEVELS.READ_ONLY,
};

// Roles that can see all risks regardless of department
export const FULL_ACCESS_ROLES = [
  ROLES.ADMIN,
  ROLES.RISK_MANAGER,
];

// Roles that can edit risks
export const CAN_EDIT_ROLES = [
  ROLES.ADMIN,
  ROLES.RISK_MANAGER,
  ROLES.CHIEF_OFFICE,
];

// Roles that can delete risks
export const CAN_DELETE_ROLES = [
  ROLES.ADMIN,
  ROLES.RISK_MANAGER,
  ROLES.CHIEF_OFFICE,
];

// Risk status options
export const RISK_STATUS = {
  OPEN: 'Open',
  MONITORING: 'Monitoring',
  CLOSED: 'Closed',
} as const;

export type RiskStatus = typeof RISK_STATUS[keyof typeof RISK_STATUS];

// Risk categories
export const RISK_CATEGORIES = [
  'Operational',
  'Financial',
  'Strategic',
  'Compliance',
  'Technology',
  'Reputational',
  'Market',
  'Credit',
] as const;

export type RiskCategory = typeof RISK_CATEGORIES[number];

// Risk rating levels with colors
export const RISK_RATINGS = {
  VERY_LOW: {
    label: 'Very Low',
    color: 'blue',
    bgClass: 'bg-blue-100 dark:bg-blue-900/20',
    textClass: 'text-blue-800 dark:text-blue-300',
    borderClass: 'border-blue-300 dark:border-blue-700',
    range: [0, 20],
  },
  LOW: {
    label: 'Low',
    color: 'green',
    bgClass: 'bg-green-100 dark:bg-green-900/20',
    textClass: 'text-green-800 dark:text-green-300',
    borderClass: 'border-green-300 dark:border-green-700',
    range: [21, 40],
  },
  MEDIUM: {
    label: 'Medium',
    color: 'yellow',
    bgClass: 'bg-yellow-100 dark:bg-yellow-900/20',
    textClass: 'text-yellow-800 dark:text-yellow-300',
    borderClass: 'border-yellow-300 dark:border-yellow-700',
    range: [41, 60],
  },
  HIGH: {
    label: 'High',
    color: 'orange',
    bgClass: 'bg-orange-100 dark:bg-orange-900/20',
    textClass: 'text-orange-800 dark:text-orange-300',
    borderClass: 'border-orange-300 dark:border-orange-700',
    range: [61, 80],
  },
  VERY_HIGH: {
    label: 'Very High',
    color: 'red',
    bgClass: 'bg-red-100 dark:bg-red-900/20',
    textClass: 'text-red-800 dark:text-red-300',
    borderClass: 'border-red-300 dark:border-red-700',
    range: [81, 100],
  },
} as const;

// Helper functions
export function getDepartmentByCode(code: string) {
  return DEPARTMENTS.find(d => d.code === code);
}

export function getDepartmentByName(name: string) {
  return DEPARTMENTS.find(d => d.name === name);
}

export function getDepartmentNames(): string[] {
  return DEPARTMENTS.map(d => d.name);
}

export function getDepartmentCodes(): string[] {
  return DEPARTMENTS.map(d => d.code);
}

export function getRiskRating(score: number) {
  if (score <= 20) return RISK_RATINGS.VERY_LOW;
  if (score <= 40) return RISK_RATINGS.LOW;
  if (score <= 60) return RISK_RATINGS.MEDIUM;
  if (score <= 80) return RISK_RATINGS.HIGH;
  return RISK_RATINGS.VERY_HIGH;
}

export function canUserSeeAllRisks(role: string): boolean {
  return FULL_ACCESS_ROLES.includes(role as any);
}

export function canUserEditRisk(role: string): boolean {
  return CAN_EDIT_ROLES.includes(role as any);
}

export function canUserDeleteRisk(role: string): boolean {
  return CAN_DELETE_ROLES.includes(role as any);
}

export function getUserAccessLevel(role: string): string {
  return ROLE_ACCESS_MAP[role] || ACCESS_LEVELS.READ_ONLY;
}
