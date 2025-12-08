// Enhanced access control for role-based permissions
import { canUserSeeAllRisks, canUserEditRisk, canUserDeleteRisk, FULL_ACCESS_ROLES } from "@shared/constants";

export interface UserContext {
  userId: string;
  role: string;
  department: string;
}

export class AccessControl {
  /**
   * Check if user can see all risks regardless of department
   */
  static canSeeAllRisks(user: UserContext): boolean {
    return canUserSeeAllRisks(user.role);
  }

  /**
   * Check if user can edit a specific risk
   */
  static canEditRisk(user: UserContext, riskDepartment: string): boolean {
    // Must have edit permission
    if (!canUserEditRisk(user.role)) {
      return false;
    }

    // Full access roles can edit any risk
    if (this.canSeeAllRisks(user)) {
      return true;
    }

    // Department users can only edit their own department risks
    return user.department === riskDepartment;
  }

  /**
   * Check if user can delete a specific risk
   */
  static canDeleteRisk(user: UserContext, riskDepartment: string): boolean {
    // Must have delete permission
    if (!canUserDeleteRisk(user.role)) {
      return false;
    }

    // Full access roles can delete any risk
    if (this.canSeeAllRisks(user)) {
      return true;
    }

    // Department users can only delete their own department risks
    return user.department === riskDepartment;
  }

  /**
   * Check if user can see a specific risk
   */
  static canSeeRisk(user: UserContext, riskDepartment: string): boolean {
    // Full access roles can see any risk
    if (this.canSeeAllRisks(user)) {
      return true;
    }

    // Department users can only see their own department risks
    return user.department === riskDepartment;
  }

  /**
   * Get department filter for user
   * Returns null if user can see all departments
   */
  static getDepartmentFilter(user: UserContext): string | null {
    if (this.canSeeAllRisks(user)) {
      return null; // No filter, see all
    }
    return user.department; // Filter by user's department
  }

  /**
   * Filter risks based on user access
   */
  static filterRisks<T extends { department: string }>(
    user: UserContext,
    risks: T[]
  ): T[] {
    if (this.canSeeAllRisks(user)) {
      return risks; // Return all risks
    }

    // Filter to only user's department
    return risks.filter(risk => risk.department === user.department);
  }

  /**
   * Check if user can create risks
   */
  static canCreateRisk(user: UserContext): boolean {
    return canUserEditRisk(user.role);
  }

  /**
   * Check if user can manage RCSA
   */
  static canManageRCSA(user: UserContext): boolean {
    // Risk team and admins can manage RCSA
    return ['admin', 'risk_manager', 'chief_office'].includes(user.role);
  }

  /**
   * Check if user can see dashboard statistics
   */
  static canSeeDashboard(user: UserContext): boolean {
    return true; // All authenticated users can see dashboard
  }

  /**
   * Check if user can see all statistics (not filtered by department)
   */
  static canSeeAllStatistics(user: UserContext): boolean {
    return this.canSeeAllRisks(user);
  }

  /**
   * Check if user can upload files
   */
  static canUploadFiles(user: UserContext): boolean {
    return ['admin', 'risk_manager', 'chief_office'].includes(user.role);
  }

  /**
   * Check if user can manage users
   */
  static canManageUsers(user: UserContext): boolean {
    return user.role === 'admin';
  }

  /**
   * Check if user can export data
   */
  static canExportData(user: UserContext): boolean {
    return true; // All users can export their visible data
  }
}
