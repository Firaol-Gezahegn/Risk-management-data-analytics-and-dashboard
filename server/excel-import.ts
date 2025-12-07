// Excel import functionality with validation
import { DEPARTMENTS, RISK_CATEGORIES, RISK_STATUS } from "@shared/constants";
import { computeRiskScores } from "@shared/risk-scoring";
import { generateRiskId } from "./risk-id-generator";

export interface ExcelRow {
  [key: string]: any;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  value: any;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  errors: ValidationError[];
  data: any[];
}

// Column mapping for Excel import - comprehensive mapping for all fields
const COLUMN_MAPPINGS: Record<string, string[]> = {
  // Core fields
  riskTitle: ['risk title', 'title', 'risk name', 'name'],
  riskType: ['risk type', 'type'],
  riskCategory: ['risk category', 'category'],
  businessUnit: ['business unit', 'unit', 'bu'],
  department: ['department', 'dept', 'division'],
  status: ['status', 'state'],
  dateReported: ['date reported', 'reported date', 'date'],
  
  // RCSA fields
  objectives: ['objectives', 'objective', 'goals'],
  processKeyActivity: ['process/key activity', 'process key activity', 'key activity', 'process'],
  riskDescription: ['risk description', 'description', 'desc'],
  rootCauses: ['root causes', 'causes', 'root cause'],
  riskImpact: ['risk impact', 'impact description'],
  existingRiskControl: ['existing risk control', 'existing control', 'current controls'],
  potentialRiskResponse: ['potential risk response', 'risk response', 'response plan'],
  
  // Risk scoring
  likelihood: ['likelihood', 'probability'],
  impact: ['impact', 'severity', 'level of impact'],
  levelOfImpact: ['level of impact', 'impact level', 'impact'],
  controlEffectiveness: ['control effectiveness', 'control eff', 'effectiveness'],
  
  // Additional
  justification: ['justification', 'rationale', 'reasoning'],
  mitigationPlan: ['mitigation plan', 'mitigation', 'action plan'],
  riskOwner: ['risk owner', 'owner', 'responsible'],
};

export class ExcelImporter {
  /**
   * Normalize column name for matching
   */
  private static normalizeColumnName(name: string): string {
    return name.toLowerCase().trim().replace(/[_\s]+/g, ' ');
  }

  /**
   * Find matching column in row data
   */
  private static findColumn(row: ExcelRow, aliases: string[]): any {
    for (const key of Object.keys(row)) {
      const normalized = this.normalizeColumnName(key);
      if (aliases.includes(normalized)) {
        return row[key];
      }
    }
    return null;
  }

  /**
   * Validate department name
   */
  private static validateDepartment(value: any): { valid: boolean; normalized?: string; error?: string } {
    if (!value) {
      return { valid: false, error: 'Department is required' };
    }

    const deptName = String(value).trim();
    const dept = DEPARTMENTS.find(d => 
      d.name.toLowerCase() === deptName.toLowerCase() ||
      d.code.toLowerCase() === deptName.toLowerCase()
    );

    if (!dept) {
      return { 
        valid: false, 
        error: `Invalid department: "${deptName}". Must be one of: ${DEPARTMENTS.map(d => d.name).join(', ')}` 
      };
    }

    return { valid: true, normalized: dept.name };
  }

  /**
   * Validate numeric value
   */
  private static validateNumeric(value: any, min: number, max: number, fieldName: string): { valid: boolean; normalized?: number; error?: string } {
    if (value === null || value === undefined || value === '') {
      return { valid: false, error: `${fieldName} is required` };
    }

    const num = Number(value);
    if (isNaN(num)) {
      return { valid: false, error: `${fieldName} must be a number, got: "${value}"` };
    }

    if (num < min || num > max) {
      return { valid: false, error: `${fieldName} must be between ${min} and ${max}, got: ${num}` };
    }

    return { valid: true, normalized: num };
  }

  /**
   * Validate status
   */
  private static validateStatus(value: any): { valid: boolean; normalized?: string; error?: string } {
    if (!value) {
      return { valid: true, normalized: RISK_STATUS.OPEN }; // Default to Open
    }

    const status = String(value).trim();
    const validStatuses = Object.values(RISK_STATUS);
    const found = validStatuses.find(s => s.toLowerCase() === status.toLowerCase());

    if (!found) {
      return { 
        valid: false, 
        error: `Invalid status: "${status}". Must be one of: ${validStatuses.join(', ')}` 
      };
    }

    return { valid: true, normalized: found };
  }

  /**
   * Validate category
   */
  private static validateCategory(value: any): { valid: boolean; normalized?: string; error?: string } {
    if (!value) {
      return { valid: true, normalized: 'Operational' }; // Default
    }

    const category = String(value).trim();
    const found = RISK_CATEGORIES.find(c => c.toLowerCase() === category.toLowerCase());

    if (!found) {
      return { 
        valid: false, 
        error: `Invalid category: "${category}". Must be one of: ${RISK_CATEGORIES.join(', ')}` 
      };
    }

    return { valid: true, normalized: found };
  }

  /**
   * Parse and validate Excel data
   */
  static async parseExcelData(rows: ExcelRow[]): Promise<ImportResult> {
    const errors: ValidationError[] = [];
    const validData: any[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // Excel row number (1-indexed + header)

      // Extract values
      const riskTitle = this.findColumn(row, COLUMN_MAPPINGS.riskTitle);
      const riskDescription = this.findColumn(row, COLUMN_MAPPINGS.riskDescription);
      const department = this.findColumn(row, COLUMN_MAPPINGS.department);
      const likelihood = this.findColumn(row, COLUMN_MAPPINGS.likelihood);
      const impact = this.findColumn(row, COLUMN_MAPPINGS.impact);
      const controlEffectiveness = this.findColumn(row, COLUMN_MAPPINGS.controlEffectiveness);
      const status = this.findColumn(row, COLUMN_MAPPINGS.status);
      const category = this.findColumn(row, COLUMN_MAPPINGS.category);
      const riskType = this.findColumn(row, COLUMN_MAPPINGS.riskType);

      // Validate required fields
      if (!riskTitle) {
        errors.push({ row: rowNum, field: 'riskTitle', message: 'Risk title is required', value: riskTitle });
        continue;
      }

      // Validate department
      const deptValidation = this.validateDepartment(department);
      if (!deptValidation.valid) {
        errors.push({ row: rowNum, field: 'department', message: deptValidation.error!, value: department });
        continue;
      }

      // Validate likelihood
      const likelihoodValidation = this.validateNumeric(likelihood, 0, 100, 'Likelihood');
      if (!likelihoodValidation.valid) {
        errors.push({ row: rowNum, field: 'likelihood', message: likelihoodValidation.error!, value: likelihood });
        continue;
      }

      // Validate impact
      const impactValidation = this.validateNumeric(impact, 0, 100, 'Impact');
      if (!impactValidation.valid) {
        errors.push({ row: rowNum, field: 'impact', message: impactValidation.error!, value: impact });
        continue;
      }

      // Validate control effectiveness (optional)
      let controlEffValue = 0;
      if (controlEffectiveness !== null && controlEffectiveness !== undefined && controlEffectiveness !== '') {
        const controlValidation = this.validateNumeric(controlEffectiveness, 0, 100, 'Control Effectiveness');
        if (!controlValidation.valid) {
          errors.push({ row: rowNum, field: 'controlEffectiveness', message: controlValidation.error!, value: controlEffectiveness });
          continue;
        }
        controlEffValue = controlValidation.normalized!;
      }

      // Validate status
      const statusValidation = this.validateStatus(status);
      if (!statusValidation.valid) {
        errors.push({ row: rowNum, field: 'status', message: statusValidation.error!, value: status });
        continue;
      }

      // Validate category
      const categoryValidation = this.validateCategory(category);
      if (!categoryValidation.valid) {
        errors.push({ row: rowNum, field: 'category', message: categoryValidation.error!, value: category });
        continue;
      }

      // Calculate risk scores
      const scores = computeRiskScores(
        likelihoodValidation.normalized!,
        impactValidation.normalized!,
        controlEffValue > 0 ? controlEffValue : undefined
      );

      // Generate risk ID
      const riskId = await generateRiskId(deptValidation.normalized!);

      // Build valid record
      validData.push({
        riskId,
        riskTitle: String(riskTitle).trim(),
        riskDescription: riskDescription ? String(riskDescription).trim() : null,
        riskType: riskType ? String(riskType).trim() : String(riskTitle).trim(),
        riskCategory: categoryValidation.normalized!,
        department: deptValidation.normalized!,
        businessUnit: deptValidation.normalized!, // Use department as business unit
        likelihood: likelihoodValidation.normalized!,
        impact: impactValidation.normalized!,
        levelOfImpact: impactValidation.normalized!,
        inherentRisk: scores.inherentRisk.score,
        controlEffectivenessScore: controlEffValue,
        residualRisk: scores.residualRisk?.score || null,
        riskScore: scores.riskScore,
        status: statusValidation.normalized!,
        dateReported: new Date().toISOString().split('T')[0],
      });
    }

    return {
      success: errors.length === 0,
      imported: validData.length,
      errors,
      data: validData,
    };
  }

  /**
   * Generate comprehensive Excel template with all fields
   */
  static generateTemplate(): any[] {
    return [
      {
        'Risk Title': 'Example: Cybersecurity breach risk',
        'Risk Type': 'Operational',
        'Risk Category': 'Technology',
        'Business Unit': 'Information Technology',
        'Department': 'Information Technology',
        'Status': 'Open',
        'Date Reported': '2024-01-15',
        'Objectives': 'Protect customer data and maintain system integrity',
        'Process/Key Activity': 'Data storage and transmission processes',
        'Risk Description': 'Potential unauthorized access to sensitive customer data through system vulnerabilities',
        'Root Causes': 'Outdated security protocols, insufficient access controls, lack of regular security audits',
        'Risk Impact': 'Financial loss, regulatory penalties, reputational damage, customer trust erosion',
        'Existing Risk Control': 'Firewall, antivirus software, basic access controls',
        'Potential Risk Response': 'Implement multi-factor authentication, conduct regular penetration testing, upgrade security infrastructure',
        'Likelihood': 80,
        'Impact': 90,
        'Control Effectiveness': 60,
        'Justification': 'High likelihood due to increasing cyber threats; high impact due to sensitive data',
        'Mitigation Plan': 'Phase 1: Security audit, Phase 2: Infrastructure upgrade, Phase 3: Staff training',
      },
      {
        'Risk Title': 'Example: Credit default risk',
        'Risk Type': 'Financial',
        'Risk Category': 'Credit',
        'Business Unit': 'Credit',
        'Department': 'Credit',
        'Status': 'Mitigating',
        'Date Reported': '2024-02-01',
        'Objectives': 'Maintain healthy loan portfolio and minimize non-performing loans',
        'Process/Key Activity': 'Credit assessment and loan approval process',
        'Risk Description': 'Risk of borrowers defaulting on loan obligations',
        'Root Causes': 'Economic downturn, inadequate credit assessment, insufficient collateral',
        'Risk Impact': 'Financial losses, increased provisions, reduced profitability',
        'Existing Risk Control': 'Credit scoring system, collateral requirements, regular monitoring',
        'Potential Risk Response': 'Enhanced due diligence, stricter lending criteria, diversification',
        'Likelihood': 50,
        'Impact': 70,
        'Control Effectiveness': 40,
        'Justification': 'Moderate likelihood based on economic indicators; significant impact on portfolio',
        'Mitigation Plan': 'Implement enhanced credit scoring model and increase monitoring frequency',
      },
      {
        'Risk Title': 'Example: Regulatory compliance violation',
        'Risk Type': 'Regulatory',
        'Risk Category': 'Compliance',
        'Business Unit': 'Compliance',
        'Department': 'Compliance',
        'Status': 'Monitoring',
        'Date Reported': '2024-03-10',
        'Objectives': 'Ensure full compliance with banking regulations and avoid penalties',
        'Process/Key Activity': 'Regulatory reporting and compliance monitoring',
        'Risk Description': 'Risk of non-compliance with AML/CFT regulations',
        'Root Causes': 'Complex regulatory environment, manual processes, staff knowledge gaps',
        'Risk Impact': 'Regulatory fines, license suspension, reputational damage',
        'Existing Risk Control': 'Compliance team, regular training, automated reporting tools',
        'Potential Risk Response': 'Implement compliance management system, increase training frequency',
        'Likelihood': 30,
        'Impact': 80,
        'Control Effectiveness': 70,
        'Justification': 'Low likelihood due to strong controls; high impact if violations occur',
        'Mitigation Plan': 'Quarterly compliance reviews and continuous staff training program',
      },
    ];
  }
}
