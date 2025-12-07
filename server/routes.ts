import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { loginSchema, insertUserSchema, insertRiskRecordSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { 
  getAzureADAuthUrl, 
  exchangeAzureADCode, 
  syncADUser, 
  generateADToken,
  isADConfigured 
} from "./auth-ad";
import { computeRiskScores } from "@shared/risk-scoring";
import { generateRiskId, regenerateRiskIdIfNeeded, getAllDepartmentCodes } from "./risk-id-generator";
import { AccessControl } from "./access-control";
import { ExcelImporter } from "./excel-import";

const JWT_SECRET = process.env.JWT_SECRET || "awash-bank-risk-management-secret-key-change-in-production";
const upload = multer({ storage: multer.memoryStorage() });
const createUserInputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
  role: z.enum(["superadmin", "risk_admin", "business_user", "reviewer", "auditor"]),
  department: z.string().min(2),
});

// Middleware to verify JWT token
interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  userDepartment?: string;
}

async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      role: string;
      department: string;
    };

    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.userDepartment = decoded.department;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// RBAC middleware
function requireRole(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}

// Audit logging helper
async function logAudit(
  userId: string | undefined,
  action: string,
  resource: string,
  resourceId?: string,
  details?: any
) {
  try {
    await storage.createAuditLog({
      userId: userId || null,
      action,
      resource,
      resourceId: resourceId || null,
      details,
      ipAddress: null,
    });
  } catch (error) {
    console.error("Audit logging failed:", error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Authentication routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);

      if (!user || !user.isActive) {
        await logAudit(undefined, "LOGIN_FAILED", "auth", undefined, { email });
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        await logAudit(user.id, "LOGIN_FAILED", "auth", undefined, { email });
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role, department: user.department },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      await logAudit(user.id, "LOGIN", "auth", user.id);

      const { passwordHash, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Active Directory authentication routes
  app.get("/api/auth/ad/config", (req: Request, res: Response) => {
    res.json({ enabled: isADConfigured() });
  });

  app.get("/api/auth/ad/login", (req: Request, res: Response) => {
    if (!isADConfigured()) {
      return res.status(400).json({ message: "Azure AD not configured" });
    }
    
    const authUrl = getAzureADAuthUrl();
    res.json({ authUrl });
  });

  app.get("/api/auth/ad/callback", async (req: Request, res: Response) => {
    try {
      const { code } = req.query;
      
      if (!code || typeof code !== "string") {
        return res.status(400).json({ message: "Authorization code missing" });
      }

      // Exchange code for user info
      const adUserInfo = await exchangeAzureADCode(code);
      
      // Sync user with database
      const user = await syncADUser(adUserInfo);
      
      // Generate JWT token
      const token = generateADToken(user);
      
      await logAudit(user.id, "LOGIN_AD", "auth", user.id);
      
      const { passwordHash, ...userWithoutPassword } = user;
      
      // Redirect to frontend with token
      res.redirect(`/?token=${token}&user=${encodeURIComponent(JSON.stringify(userWithoutPassword))}`);
    } catch (error) {
      console.error("AD callback error:", error);
      res.redirect("/?error=ad_auth_failed");
    }
  });

  app.get("/api/auth/me", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { passwordHash, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // User management routes
  app.get(
    "/api/users",
    authMiddleware,
    requireRole("superadmin"),
    async (req: AuthRequest, res: Response) => {
      try {
        const users = await storage.getAllUsers();
        res.json(users);
      } catch (error) {
        res.status(500).json({ message: "Server error" });
      }
    }
  );

  app.post(
    "/api/users",
    authMiddleware,
    requireRole("superadmin"),
    async (req: AuthRequest, res: Response) => {
      try {
        const payload = createUserInputSchema.parse(req.body);
        const hashedPassword = await bcrypt.hash(payload.password, 10);

        const user = await storage.createUser({
          email: payload.email,
          name: payload.name,
          passwordHash: hashedPassword,
          role: payload.role,
          department: payload.department,
        });

        await logAudit(req.userId, "CREATE", "user", user.id, { email: user.email });

        const { passwordHash, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      } catch (error) {
        console.error("Create user error:", error);
        res.status(400).json({ message: "Invalid request" });
      }
    }
  );

  app.patch(
    "/api/users/:id",
    authMiddleware,
    requireRole("superadmin"),
    async (req: AuthRequest, res: Response) => {
      try {
        const { id } = req.params;
        const updates = req.body;

        const user = await storage.updateUser(id, updates);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        await logAudit(req.userId, "UPDATE", "user", id, updates);

        const { passwordHash, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      } catch (error) {
        res.status(400).json({ message: "Invalid request" });
      }
    }
  );

  // Risk records routes
  app.get("/api/risks", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const user = {
        userId: req.userId!,
        role: req.userRole!,
        department: req.userDepartment!,
      };

      // Pagination parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      // Get department filter based on user access
      const departmentFilter = AccessControl.getDepartmentFilter(user);
      
      const risks = await storage.getAllRiskRecords({
        department: departmentFilter,
        role: req.userRole,
        limit,
        offset,
      });

      // Get total count for pagination
      const total = await storage.getRiskCount({
        department: departmentFilter,
        role: req.userRole,
      });
      
      res.json({
        data: risks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching risks:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/risks/statistics", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const user = {
        userId: req.userId!,
        role: req.userRole!,
        department: req.userDepartment!,
      };

      const departmentFilter = AccessControl.getDepartmentFilter(user);
      const canSeeAll = AccessControl.canSeeAllStatistics(user);
      
      const stats = await storage.getRiskStatistics({
        department: departmentFilter,
        includeByDepartment: canSeeAll,
      });
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Excel template download - MUST be before /api/risks/:id
  app.get("/api/risks/template", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const template = [
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
          'Risk Description': 'Potential unauthorized access to sensitive customer data',
          'Root Causes': 'Outdated security protocols, insufficient access controls',
          'Risk Impact': 'Financial loss, regulatory penalties, reputational damage',
          'Existing Risk Control': 'Firewall, antivirus software, basic access controls',
          'Potential Risk Response': 'Implement MFA, conduct penetration testing',
          'Likelihood': 80,
          'Impact': 90,
          'Control Effectiveness': 60,
          'Justification': 'High likelihood due to increasing cyber threats',
          'Mitigation Plan': 'Phase 1: Security audit, Phase 2: Infrastructure upgrade',
        },
        {
          'Risk Title': 'Example: Credit default risk',
          'Risk Type': 'Financial',
          'Risk Category': 'Credit',
          'Business Unit': 'Credit',
          'Department': 'Credit',
          'Status': 'Mitigating',
          'Date Reported': '2024-02-01',
          'Objectives': 'Maintain healthy loan portfolio',
          'Process/Key Activity': 'Credit assessment and loan approval',
          'Risk Description': 'Risk of borrowers defaulting on loan obligations',
          'Root Causes': 'Economic downturn, inadequate credit assessment',
          'Risk Impact': 'Financial losses, increased provisions',
          'Existing Risk Control': 'Credit scoring system, collateral requirements',
          'Potential Risk Response': 'Enhanced due diligence, stricter criteria',
          'Likelihood': 50,
          'Impact': 70,
          'Control Effectiveness': 40,
          'Justification': 'Moderate likelihood based on economic indicators',
          'Mitigation Plan': 'Implement enhanced credit scoring model',
        },
        {
          'Risk Title': 'Example: Regulatory compliance violation',
          'Risk Type': 'Regulatory',
          'Risk Category': 'Compliance',
          'Business Unit': 'Compliance',
          'Department': 'Compliance',
          'Status': 'Monitoring',
          'Date Reported': '2024-03-10',
          'Objectives': 'Ensure full compliance with banking regulations',
          'Process/Key Activity': 'Regulatory reporting and compliance monitoring',
          'Risk Description': 'Risk of non-compliance with AML/CFT regulations',
          'Root Causes': 'Complex regulatory environment, manual processes',
          'Risk Impact': 'Regulatory fines, license suspension',
          'Existing Risk Control': 'Compliance team, regular training',
          'Potential Risk Response': 'Implement compliance management system',
          'Likelihood': 30,
          'Impact': 80,
          'Control Effectiveness': 70,
          'Justification': 'Low likelihood due to strong controls',
          'Mitigation Plan': 'Quarterly compliance reviews',
        },
      ];
      
      res.json(template);
    } catch (error) {
      console.error("Template generation error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/risks/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const risk = await storage.getRiskRecord(id);

      if (!risk) {
        return res.status(404).json({ message: "Risk not found" });
      }

      // Check department access
      if (
        req.userRole !== "superadmin" &&
        req.userRole !== "auditor" &&
        risk.department !== req.userDepartment
      ) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(risk);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Risk scoring computation endpoint
  app.post("/api/risks/compute-scores", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { likelihood, impact, controlEffectiveness } = req.body;
      
      if (typeof likelihood !== "number" || typeof impact !== "number") {
        return res.status(400).json({ message: "Likelihood and impact are required" });
      }
      
      const scores = computeRiskScores(
        likelihood,
        impact,
        controlEffectiveness !== undefined ? controlEffectiveness : undefined
      );
      
      res.json(scores);
    } catch (error) {
      console.error("Compute scores error:", error);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post(
    "/api/risks",
    authMiddleware,
    requireRole("superadmin", "risk_admin", "business_user"),
    async (req: AuthRequest, res: Response) => {
      try {
        const riskData = insertRiskRecordSchema.parse(req.body);
        
        // Generate risk ID
        const riskId = await generateRiskId(riskData.department);
        
        // Compute risk scores using 5x5 matrix
        const scores = computeRiskScores(
          Number(riskData.likelihood),
          Number(riskData.levelOfImpact || riskData.impact),
          riskData.controlEffectivenessScore ? Number(riskData.controlEffectivenessScore) : undefined
        );
        
        const risk = await storage.createRiskRecord({
          ...riskData,
          riskId,
          inherentRisk: Number(scores.inherentRisk.score.toFixed(2)),
          residualRisk: scores.residualRisk ? Number(scores.residualRisk.score.toFixed(2)) : null,
          riskScore: Number(scores.riskScore.toFixed(2)),
        });

        await logAudit(req.userId, "CREATE", "risk", risk.id.toString(), riskData);

        res.status(201).json(risk);
      } catch (error) {
        console.error("Create risk error:", error);
        res.status(400).json({ message: "Invalid request" });
      }
    }
  );

  app.patch(
    "/api/risks/:id",
    authMiddleware,
    requireRole("superadmin", "risk_admin", "business_user"),
    async (req: AuthRequest, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const updates = req.body;

        const existingRisk = await storage.getRiskRecord(id);
        if (!existingRisk) {
          return res.status(404).json({ message: "Risk not found" });
        }

        // Check department access
        if (
          req.userRole !== "superadmin" &&
          existingRisk.department !== req.userDepartment
        ) {
          return res.status(403).json({ message: "Access denied" });
        }

        // Regenerate risk ID if department changed
        if (updates.department && updates.department !== existingRisk.department) {
          const newRiskId = await regenerateRiskIdIfNeeded(
            id,
            existingRisk.department,
            updates.department
          );
          if (newRiskId) {
            updates.riskId = newRiskId;
          }
        }

        // Recompute scores if relevant fields changed
        if (updates.likelihood !== undefined || updates.levelOfImpact !== undefined || 
            updates.impact !== undefined || updates.controlEffectivenessScore !== undefined) {
          const likelihood = updates.likelihood !== undefined ? Number(updates.likelihood) : Number(existingRisk.likelihood);
          const impact = updates.levelOfImpact !== undefined ? Number(updates.levelOfImpact) : 
                        (updates.impact !== undefined ? Number(updates.impact) : Number(existingRisk.impact));
          const controlEffectiveness = updates.controlEffectivenessScore !== undefined ? 
                                      Number(updates.controlEffectivenessScore) : 
                                      (existingRisk.controlEffectivenessScore ? Number(existingRisk.controlEffectivenessScore) : undefined);
          
          const scores = computeRiskScores(likelihood, impact, controlEffectiveness);
          updates.inherentRisk = Number(scores.inherentRisk.score.toFixed(2));
          updates.residualRisk = scores.residualRisk ? Number(scores.residualRisk.score.toFixed(2)) : null;
          updates.riskScore = Number(scores.riskScore.toFixed(2));
        }

        const risk = await storage.updateRiskRecord(id, updates);

        await logAudit(req.userId, "UPDATE", "risk", id.toString(), updates);

        res.json(risk);
      } catch (error) {
        res.status(400).json({ message: "Invalid request" });
      }
    }
  );

  app.delete(
    "/api/risks/:id",
    authMiddleware,
    requireRole("superadmin", "risk_admin"),
    async (req: AuthRequest, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const existingRisk = await storage.getRiskRecord(id);

        if (!existingRisk) {
          return res.status(404).json({ message: "Risk not found" });
        }

        // Check department access
        if (
          req.userRole !== "superadmin" &&
          existingRisk.department !== req.userDepartment
        ) {
          return res.status(403).json({ message: "Access denied" });
        }

        await storage.deleteRiskRecord(id);

        await logAudit(req.userId, "DELETE", "risk", id.toString());

        res.status(204).send();
      } catch (error) {
        res.status(500).json({ message: "Server error" });
      }
    }
  );

  // File ingestion routes
  app.get("/api/ingest/staging", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const staging = await storage.getStagingData();
      res.json(staging);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post(
    "/api/ingest/upload",
    authMiddleware,
    requireRole("superadmin", "risk_admin", "business_user"),
    async (req: AuthRequest, res: Response) => {
      try {
        const { sourceFile, data } = req.body;

        for (const row of data) {
          await storage.createStagingData({
            sourceFile,
            rawRow: row,
            uploadedBy: req.userId,
          });
        }

        await logAudit(req.userId, "UPLOAD", "staging", undefined, {
          sourceFile,
          rowCount: data.length,
        });

        res.status(201).json({ message: "Data uploaded to staging", count: data.length });
      } catch (error) {
        console.error("Upload error:", error);
        res.status(400).json({ message: "Upload failed" });
      }
    }
  );

  app.post(
    "/api/ingest/approve",
    authMiddleware,
    requireRole("superadmin", "risk_admin"),
    async (req: AuthRequest, res: Response) => {
      try {
        await storage.approveStagingData();

        await logAudit(req.userId, "APPROVE", "staging");

        res.json({ message: "Staging data approved and imported" });
      } catch (error) {
        console.error("Approve error:", error);
        res.status(500).json({ message: "Approval failed" });
      }
    }
  );

  app.delete(
    "/api/ingest/staging",
    authMiddleware,
    requireRole("superadmin", "risk_admin"),
    async (req: AuthRequest, res: Response) => {
      try {
        await storage.clearStagingData();

        await logAudit(req.userId, "CLEAR", "staging");

        res.json({ message: "Staging data cleared" });
      } catch (error) {
        res.status(500).json({ message: "Server error" });
      }
    }
  );

  // Audit logs routes
  app.get(
    "/api/audit-logs",
    authMiddleware,
    requireRole("superadmin", "auditor"),
    async (req: AuthRequest, res: Response) => {
      try {
        const logs = await storage.getAuditLogs(100);
        res.json(logs);
      } catch (error) {
        res.status(500).json({ message: "Server error" });
      }
    }
  );

  // Department codes routes
  app.get("/api/department-codes", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const codes = getAllDepartmentCodes();
      res.json(codes);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Excel import/export routes
  app.post(
    "/api/risks/import/validate",
    authMiddleware,
    requireRole("superadmin", "risk_admin", "risk_team_full", "business_user"),
    async (req: AuthRequest, res: Response) => {
      try {
        const { data } = req.body;
        
        if (!Array.isArray(data) || data.length === 0) {
          return res.status(400).json({ message: "No data provided" });
        }

        const result = await ExcelImporter.parseExcelData(data);
        res.json(result);
      } catch (error) {
        console.error("Excel validation error:", error);
        res.status(400).json({ message: "Validation failed" });
      }
    }
  );

  app.post(
    "/api/risks/import/execute",
    authMiddleware,
    requireRole("superadmin", "risk_admin", "risk_team_full"),
    async (req: AuthRequest, res: Response) => {
      try {
        const { data } = req.body;
        
        if (!Array.isArray(data) || data.length === 0) {
          return res.status(400).json({ message: "No data provided" });
        }

        const result = await ExcelImporter.parseExcelData(data);

        if (!result.success) {
          return res.status(400).json(result);
        }

        // Import validated data
        const imported = [];
        for (const riskData of result.data) {
          const risk = await storage.createRiskRecord(riskData);
          imported.push(risk);
        }

        await logAudit(req.userId, "IMPORT_RISKS", "risk", undefined, {
          count: imported.length,
        });

        res.json({
          success: true,
          imported: imported.length,
          risks: imported,
        });
      } catch (error) {
        console.error("Excel import error:", error);
        res.status(500).json({ message: "Import failed" });
      }
    }
  );

  // Collaborators routes
  app.get("/api/risks/:id/collaborators", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const riskId = parseInt(req.params.id);
      const collaborators = await storage.getRiskCollaborators(riskId);
      res.json(collaborators);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post(
    "/api/risks/:id/collaborators",
    authMiddleware,
    requireRole("superadmin", "risk_admin", "business_user"),
    async (req: AuthRequest, res: Response) => {
      try {
        const riskId = parseInt(req.params.id);
        const { userIds } = req.body;

        if (!Array.isArray(userIds)) {
          return res.status(400).json({ message: "userIds must be an array" });
        }

        await storage.setRiskCollaborators(riskId, userIds);
        await logAudit(req.userId, "UPDATE_COLLABORATORS", "risk", riskId.toString(), { userIds });

        res.json({ message: "Collaborators updated" });
      } catch (error) {
        console.error("Update collaborators error:", error);
        res.status(400).json({ message: "Invalid request" });
      }
    }
  );

  // RCSA routes
  app.get("/api/risks/:id/rcsa", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const riskId = parseInt(req.params.id);
      const assessments = await storage.getRcsaAssessments(riskId);
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post(
    "/api/risks/:id/rcsa",
    authMiddleware,
    requireRole("superadmin", "risk_admin", "business_user", "reviewer"),
    async (req: AuthRequest, res: Response) => {
      try {
        const riskId = parseInt(req.params.id);
        const assessmentData = req.body;

        const assessment = await storage.createRcsaAssessment({
          ...assessmentData,
          riskId,
          assessedBy: req.userId,
        });

        await logAudit(req.userId, "CREATE_RCSA", "risk", riskId.toString(), assessmentData);

        res.status(201).json(assessment);
      } catch (error) {
        console.error("Create RCSA error:", error);
        res.status(400).json({ message: "Invalid request" });
      }
    }
  );

  // Risk response progress routes
  app.get("/api/risks/:id/progress", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const riskId = parseInt(req.params.id);
      const progress = await storage.getRiskResponseProgress(riskId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post(
    "/api/risks/:id/progress",
    authMiddleware,
    requireRole("superadmin", "risk_admin", "business_user"),
    async (req: AuthRequest, res: Response) => {
      try {
        const riskId = parseInt(req.params.id);
        const progressData = req.body;

        const progress = await storage.createRiskResponseProgress({
          ...progressData,
          riskId,
          updatedBy: req.userId,
        });

        await logAudit(req.userId, "CREATE_PROGRESS", "risk", riskId.toString(), progressData);

        res.status(201).json(progress);
      } catch (error) {
        console.error("Create progress error:", error);
        res.status(400).json({ message: "Invalid request" });
      }
    }
  );

  const httpServer = createServer(app);
  return httpServer;
}
