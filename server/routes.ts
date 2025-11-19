import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { loginSchema, insertUserSchema, insertRiskRecordSchema } from "@shared/schema";
import multer from "multer";

const JWT_SECRET = process.env.JWT_SECRET || "awash-bank-risk-management-secret-key-change-in-production";
const upload = multer({ storage: multer.memoryStorage() });

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
        const userData = insertUserSchema.parse(req.body);
        const hashedPassword = await bcrypt.hash(userData.passwordHash, 10);

        const user = await storage.createUser({
          ...userData,
          passwordHash: hashedPassword,
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
      const risks = await storage.getAllRiskRecords({
        department: req.userDepartment,
        role: req.userRole,
      });
      res.json(risks);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/risks/statistics", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const filters =
        req.userRole === "superadmin" || req.userRole === "auditor"
          ? {}
          : { department: req.userDepartment };
      const stats = await storage.getRiskStatistics(filters);
      res.json(stats);
    } catch (error) {
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

  app.post(
    "/api/risks",
    authMiddleware,
    requireRole("superadmin", "risk_admin", "business_user"),
    async (req: AuthRequest, res: Response) => {
      try {
        const riskData = insertRiskRecordSchema.parse(req.body);
        const risk = await storage.createRiskRecord(riskData);

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

  const httpServer = createServer(app);
  return httpServer;
}
