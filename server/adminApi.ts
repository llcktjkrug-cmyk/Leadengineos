import { Router, Request, Response } from "express";
import * as db from "./db";

/**
 * Admin API Router
 * 
 * Provides REST endpoints for remote site management.
 * All routes require X-Admin-API-Key header authentication.
 * Authentication is handled by validateAdminApiKey middleware in index.ts.
 */

export const adminApiRouter = Router();

// ============================================================================
// HEALTH CHECK
// ============================================================================

adminApiRouter.get("/health", async (req: Request, res: Response) => {
  try {
    const database = await db.getDb();
    const dbStatus = database ? "connected" : "disconnected";
    
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: dbStatus,
      version: process.env.npm_package_version || "1.0.0",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      timestamp: new Date().toISOString(),
      error: "Health check failed",
    });
  }
});

// ============================================================================
// TENANT MANAGEMENT
// ============================================================================

adminApiRouter.get("/tenants", async (req: Request, res: Response) => {
  try {
    const tenants = await db.getAllTenants();
    res.json({ tenants });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tenants" });
  }
});

adminApiRouter.get("/tenants/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid tenant ID" });
    }
    
    const tenant = await db.getTenantById(id);
    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }
    
    res.json({ tenant });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tenant" });
  }
});

// ============================================================================
// USER MANAGEMENT
// ============================================================================

adminApiRouter.get("/users", async (req: Request, res: Response) => {
  try {
    const database = await db.getDb();
    if (!database) {
      return res.status(503).json({ error: "Database unavailable" });
    }
    
    // Import users table for direct query
    const { users } = await import("../drizzle/schema");
    const { desc } = await import("drizzle-orm");
    
    const allUsers = await database.select().from(users).orderBy(desc(users.createdAt));
    res.json({ users: allUsers });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

adminApiRouter.get("/subscriptions", async (req: Request, res: Response) => {
  try {
    const subscriptions = await db.getActiveSubscriptions();
    res.json({ subscriptions });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch subscriptions" });
  }
});

// ============================================================================
// BLOG POST MANAGEMENT
// ============================================================================

adminApiRouter.get("/blog-posts", async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const posts = await db.getBlogPostsByTenant(null, status);
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blog posts" });
  }
});

adminApiRouter.post("/blog-posts", async (req: Request, res: Response) => {
  try {
    const { title, slug, content, excerpt, category, featuredImage, metaTitle, metaDescription, status } = req.body;
    
    if (!title || !slug || !content) {
      return res.status(400).json({ error: "Missing required fields: title, slug, content" });
    }
    
    const database = await db.getDb();
    if (!database) {
      return res.status(503).json({ error: "Database unavailable" });
    }
    
    const { blogPosts } = await import("../drizzle/schema");
    
    const [result] = await database.insert(blogPosts).values({
      title,
      slug,
      content,
      excerpt: excerpt || null,
      category: category || "med_spa_growth",
      featuredImageUrl: featuredImage || null,
      seoTitle: metaTitle || title,
      seoMetaDescription: metaDescription || excerpt || null,
      status: status || "draft",
      tenantId: null, // Admin-created posts are global
      publishedAt: status === "published" ? new Date() : null,
    });
    
    res.status(201).json({ id: Number(result.insertId), message: "Blog post created" });
  } catch (error) {
    console.error("[AdminAPI] Failed to create blog post:", error);
    res.status(500).json({ error: "Failed to create blog post" });
  }
});

// ============================================================================
// WORKFLOW TRIGGERS
// ============================================================================

adminApiRouter.post("/workflows/trigger", async (req: Request, res: Response) => {
  try {
    const { workflowName, tenantId, payload } = req.body;
    
    if (!workflowName) {
      return res.status(400).json({ error: "Missing required field: workflowName" });
    }
    
    // Log workflow trigger for audit
    console.log(`[AdminAPI] Workflow trigger: ${workflowName} for tenant ${tenantId || "global"}`);
    
    // In production, this would call n8n API to trigger workflow
    // For now, return success with placeholder
    res.json({
      message: "Workflow trigger queued",
      workflowName,
      tenantId: tenantId || null,
      triggeredAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to trigger workflow" });
  }
});

// ============================================================================
// ANALYTICS
// ============================================================================

adminApiRouter.get("/analytics/summary", async (req: Request, res: Response) => {
  try {
    const tenants = await db.getAllTenants();
    const subscriptions = await db.getActiveSubscriptions();
    
    res.json({
      totalTenants: tenants.length,
      activeSubscriptions: subscriptions.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// ============================================================================
// AUDIT LOG
// ============================================================================

adminApiRouter.get("/audit-log", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const database = await db.getDb();
    if (!database) {
      return res.status(503).json({ error: "Database unavailable" });
    }
    
    const { auditLog } = await import("../drizzle/schema");
    const { desc } = await import("drizzle-orm");
    
    const logs = await database.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(limit);
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});
