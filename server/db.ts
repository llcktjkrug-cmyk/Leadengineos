import { eq, and, desc, asc, sql, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  tenants,
  subscriptions,
  plans,
  quotaUsage,
  websiteConnections,
  deliverableRequests,
  deliverables,
  blogPosts,
  landingPages,
  leads,
  leadEvents,
  workflowRuns,
  auditLog,
  contentTemplates,
  type Tenant,
  type Subscription,
  type Plan,
  type QuotaUsage,
  type WebsiteConnection,
  type DeliverableRequest,
  type Deliverable,
  type BlogPost,
  type LandingPage,
  type Lead,
  type WorkflowRun,
  type ContentTemplate,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (user.tenantId !== undefined) {
      values.tenantId = user.tenantId;
      updateSet.tenantId = user.tenantId;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUsersByTenant(tenantId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(users).where(eq(users.tenantId, tenantId));
}

// ============================================================================
// TENANT MANAGEMENT
// ============================================================================

export async function getTenantById(id: number): Promise<Tenant | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTenantBySlug(slug: string): Promise<Tenant | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTenantByApiKey(apiKey: string): Promise<Tenant | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(tenants).where(eq(tenants.apiKey, apiKey)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllActiveTenants(): Promise<Tenant[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(tenants).where(eq(tenants.status, "active"));
}

export async function getAllTenants(): Promise<Tenant[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(tenants).orderBy(desc(tenants.createdAt));
}

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

export async function getSubscriptionByTenant(tenantId: number): Promise<Subscription | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.tenantId, tenantId))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getActiveSubscriptions(): Promise<Subscription[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(subscriptions).where(eq(subscriptions.status, "active"));
}

export async function getPastDueSubscriptions(): Promise<Subscription[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(subscriptions).where(eq(subscriptions.status, "past_due"));
}

// ============================================================================
// PLAN MANAGEMENT
// ============================================================================

export async function getAllPlans(): Promise<Plan[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(plans).orderBy(asc(plans.monthlyPrice));
}

export async function getPlanBySlug(slug: string): Promise<Plan | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(plans).where(eq(plans.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// QUOTA MANAGEMENT
// ============================================================================

export async function getCurrentQuotaUsage(tenantId: number): Promise<QuotaUsage | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const now = new Date();
  const result = await db
    .select()
    .from(quotaUsage)
    .where(and(eq(quotaUsage.tenantId, tenantId), lte(quotaUsage.periodStart, now), gte(quotaUsage.periodEnd, now)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// WEBSITE CONNECTIONS
// ============================================================================

export async function getWebsiteConnectionsByTenant(tenantId: number): Promise<WebsiteConnection[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(websiteConnections).where(eq(websiteConnections.tenantId, tenantId));
}

// ============================================================================
// DELIVERABLE REQUESTS
// ============================================================================

export async function getDeliverableRequestsByTenant(
  tenantId: number,
  status?: string
): Promise<DeliverableRequest[]> {
  const db = await getDb();
  if (!db) return [];

  if (status) {
    return db
      .select()
      .from(deliverableRequests)
      .where(and(eq(deliverableRequests.tenantId, tenantId), eq(deliverableRequests.status, status as any)))
      .orderBy(asc(deliverableRequests.priority), desc(deliverableRequests.createdAt));
  }

  return db
    .select()
    .from(deliverableRequests)
    .where(eq(deliverableRequests.tenantId, tenantId))
    .orderBy(asc(deliverableRequests.priority), desc(deliverableRequests.createdAt));
}

export async function getQueuedDeliverableRequests(): Promise<DeliverableRequest[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(deliverableRequests)
    .where(eq(deliverableRequests.status, "queued"))
    .orderBy(asc(deliverableRequests.priority), desc(deliverableRequests.createdAt));
}

/**
 * Get a single deliverable request by ID
 * Used for tenant verification before returning associated deliverables
 */
export async function getDeliverableRequestById(requestId: number): Promise<DeliverableRequest | null> {
  const db = await getDb();
  if (!db) return null;

  const results = await db
    .select()
    .from(deliverableRequests)
    .where(eq(deliverableRequests.id, requestId))
    .limit(1);

  return results[0] || null;
}

// ============================================================================
// DELIVERABLES
// ============================================================================

export async function getDeliverablesByTenant(tenantId: number, type?: string): Promise<Deliverable[]> {
  const db = await getDb();
  if (!db) return [];

  if (type) {
    return db
      .select()
      .from(deliverables)
      .where(and(eq(deliverables.tenantId, tenantId), eq(deliverables.type, type as any)))
      .orderBy(desc(deliverables.createdAt));
  }

  return db.select().from(deliverables).where(eq(deliverables.tenantId, tenantId)).orderBy(desc(deliverables.createdAt));
}

export async function getDeliverablesByRequest(requestId: number): Promise<Deliverable[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(deliverables).where(eq(deliverables.requestId, requestId)).orderBy(desc(deliverables.version));
}

// ============================================================================
// BLOG POSTS
// ============================================================================

export async function getBlogPostsByTenant(tenantId: number | null, status?: string): Promise<BlogPost[]> {
  const db = await getDb();
  if (!db) return [];

  if (status) {
    return db
      .select()
      .from(blogPosts)
      .where(and(tenantId !== null ? eq(blogPosts.tenantId, tenantId) : sql`${blogPosts.tenantId} IS NULL`, eq(blogPosts.status, status as any)))
      .orderBy(desc(blogPosts.createdAt));
  }

  return db
    .select()
    .from(blogPosts)
    .where(tenantId !== null ? eq(blogPosts.tenantId, tenantId) : sql`${blogPosts.tenantId} IS NULL`)
    .orderBy(desc(blogPosts.createdAt));
}

export async function getBlogPostBySlug(slug: string, tenantId: number | null): Promise<BlogPost | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.slug, slug), tenantId !== null ? eq(blogPosts.tenantId, tenantId) : sql`${blogPosts.tenantId} IS NULL`))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getPublishedBlogPosts(category?: string): Promise<BlogPost[]> {
  const db = await getDb();
  if (!db) return [];

  if (category) {
    return db
      .select()
      .from(blogPosts)
      .where(and(eq(blogPosts.status, "published"), eq(blogPosts.category, category as any), sql`${blogPosts.tenantId} IS NULL`))
      .orderBy(desc(blogPosts.publishedAt));
  }

  return db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.status, "published"), sql`${blogPosts.tenantId} IS NULL`))
    .orderBy(desc(blogPosts.publishedAt));
}

// ============================================================================
// LANDING PAGES
// ============================================================================

export async function getLandingPagesByTenant(tenantId: number): Promise<LandingPage[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(landingPages).where(eq(landingPages.tenantId, tenantId)).orderBy(desc(landingPages.createdAt));
}

export async function getLandingPageBySlug(slug: string, tenantId: number): Promise<LandingPage | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(landingPages)
    .where(and(eq(landingPages.slug, slug), eq(landingPages.tenantId, tenantId)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// LEADS
// ============================================================================

export async function getLeadsByTenant(tenantId: number | null): Promise<Lead[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(leads)
    .where(tenantId !== null ? eq(leads.tenantId, tenantId) : sql`${leads.tenantId} IS NULL`)
    .orderBy(desc(leads.createdAt));
}

// ============================================================================
// WORKFLOW RUNS
// ============================================================================

export async function getWorkflowRunsByTenant(tenantId: number, workflowName?: string): Promise<WorkflowRun[]> {
  const db = await getDb();
  if (!db) return [];

  if (workflowName) {
    return db
      .select()
      .from(workflowRuns)
      .where(and(eq(workflowRuns.tenantId, tenantId), eq(workflowRuns.workflowName, workflowName)))
      .orderBy(desc(workflowRuns.startedAt));
  }

  return db.select().from(workflowRuns).where(eq(workflowRuns.tenantId, tenantId)).orderBy(desc(workflowRuns.startedAt));
}

export async function getRecentWorkflowRuns(limit: number = 50): Promise<WorkflowRun[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(workflowRuns).orderBy(desc(workflowRuns.startedAt)).limit(limit);
}

// ============================================================================
// CONTENT TEMPLATES
// ============================================================================

export async function getContentTemplatesByVertical(vertical: string, contentType?: string): Promise<ContentTemplate[]> {
  const db = await getDb();
  if (!db) return [];

  if (contentType) {
    return db
      .select()
      .from(contentTemplates)
      .where(and(eq(contentTemplates.vertical, vertical as any), eq(contentTemplates.contentType, contentType as any)));
  }

  return db.select().from(contentTemplates).where(eq(contentTemplates.vertical, vertical as any));
}

export async function getAllContentTemplates(): Promise<ContentTemplate[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(contentTemplates).orderBy(asc(contentTemplates.vertical), asc(contentTemplates.contentType));
}

// ============================================================================
// DELIVERABLE REQUESTS
// ============================================================================

export async function getDeliverableRequestsByStatus(
  tenantId: number,
  status: string,
  limit: number = 10
): Promise<DeliverableRequest[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(deliverableRequests)
    .where(and(eq(deliverableRequests.tenantId, tenantId), eq(deliverableRequests.status, status as any)))
    .orderBy(asc(deliverableRequests.createdAt))
    .limit(limit);
}

export async function updateDeliverableRequest(
  requestId: number,
  updates: {
    status?: string;
    errorMessage?: string | null;
    completedAt?: Date | null;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const updateData: any = {};
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.errorMessage !== undefined) updateData.errorMessage = updates.errorMessage;
  if (updates.completedAt !== undefined) updateData.completedAt = updates.completedAt;

  await db.update(deliverableRequests).set(updateData).where(eq(deliverableRequests.id, requestId));
}

// ============================================================================
// DELIVERABLES
// ============================================================================

export async function createDeliverable(data: {
  tenantId: number;
  requestId: number;
  type: string;
  title: string;
  contentUrl: string;
  metadata?: string | null;
}): Promise<Deliverable> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(deliverables).values({
    requestId: data.requestId,
    tenantId: data.tenantId,
    type: data.type as any,
    title: data.title,
    contentUrl: data.contentUrl,
    metadataJson: data.metadata || null,
    version: 1,
  });

  const insertedId = Number(result[0].insertId);

  const inserted = await db.select().from(deliverables).where(eq(deliverables.id, insertedId)).limit(1);

  return inserted[0]!;
}

// ============================================================================
// WORKFLOW RUNS
// ============================================================================

export async function createWorkflowRun(data: {
  tenantId: number;
  workflowName: string;
  status: string;
  n8nExecutionId?: string | null;
  inputData?: string | null;
  outputData?: string | null;
  errorMessage?: string | null;
  startedAt: Date;
  completedAt?: Date | null;
}): Promise<WorkflowRun> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(workflowRuns).values({
    tenantId: data.tenantId,
    workflowName: data.workflowName,
    status: data.status as any,
    n8nExecutionId: data.n8nExecutionId || null,
    inputData: data.inputData || null,
    outputData: data.outputData || null,
    errorMessage: data.errorMessage || null,
    startedAt: data.startedAt,
    completedAt: data.completedAt || null,
  });

  const insertedId = Number(result[0].insertId);

  const inserted = await db.select().from(workflowRuns).where(eq(workflowRuns.id, insertedId)).limit(1);

  return inserted[0]!;
}

export async function updateWorkflowRun(
  runId: number,
  updates: {
    status?: string;
    outputData?: string | null;
    errorMessage?: string | null;
    completedAt?: Date | null;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const updateData: any = {};
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.outputData !== undefined) updateData.outputData = updates.outputData;
  if (updates.errorMessage !== undefined) updateData.errorMessage = updates.errorMessage;
  if (updates.completedAt !== undefined) updateData.completedAt = updates.completedAt;

  await db.update(workflowRuns).set(updateData).where(eq(workflowRuns.id, runId));
}

// ============================================================================
// BLOG POSTS
// ============================================================================

export async function createBlogPost(data: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: string;
  category?: string | null;
  featuredImageUrl?: string | null;
  seoTitle?: string | null;
  seoMetaDescription?: string | null;
  publishedAt?: Date | null;
}): Promise<BlogPost> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(blogPosts).values({
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    content: data.content,
    status: data.status as any,
    category: (data.category as any) || null,
    featuredImageUrl: data.featuredImageUrl || null,
    seoTitle: data.seoTitle || null,
    seoMetaDescription: data.seoMetaDescription || null,
    publishedAt: data.publishedAt || null,
  });

  const insertedId = Number(result[0].insertId);

  const inserted = await db.select().from(blogPosts).where(eq(blogPosts.id, insertedId)).limit(1);

  return inserted[0]!;
}

// ============================================================================
// LANDING PAGES
// ============================================================================

export async function createLandingPage(data: {
  tenantId: number;
  title: string;
  slug: string;
  content: string;
  status: string;
  seoTitle?: string | null;
  seoMetaDescription?: string | null;
}): Promise<LandingPage> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(landingPages).values({
    tenantId: data.tenantId,
    title: data.title,
    slug: data.slug,
    content: data.content,
    status: data.status as any,
    seoTitle: data.seoTitle || null,
    seoMetaDescription: data.seoMetaDescription || null,
  });

  const insertedId = Number(result[0].insertId);

  const inserted = await db.select().from(landingPages).where(eq(landingPages.id, insertedId)).limit(1);

  return inserted[0]!;
}

// ============================================================================
// SUBSCRIPTIONS
// ============================================================================

export async function createSubscription(data: {
  tenantId: number;
  revenuecatCustomerId: string;
  revenuecatSubscriptionId: string;
  plan: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
}): Promise<Subscription> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(subscriptions).values({
    tenantId: data.tenantId,
    revenuecatCustomerId: data.revenuecatCustomerId,
    revenuecatSubscriptionId: data.revenuecatSubscriptionId,
    plan: data.plan as any,
    status: data.status as any,
    currentPeriodStart: data.currentPeriodStart,
    currentPeriodEnd: data.currentPeriodEnd,
  });

  const insertedId = Number(result[0].insertId);

  const inserted = await db.select().from(subscriptions).where(eq(subscriptions.id, insertedId)).limit(1);

  return inserted[0]!;
}

export async function updateSubscription(
  subscriptionId: number,
  updates: {
    status?: string;
    plan?: string;
    revenuecatSubscriptionId?: string;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const updateData: any = {};
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.plan !== undefined) updateData.plan = updates.plan;
  if (updates.revenuecatSubscriptionId !== undefined) updateData.revenuecatSubscriptionId = updates.revenuecatSubscriptionId;
  if (updates.currentPeriodStart !== undefined) updateData.currentPeriodStart = updates.currentPeriodStart;
  if (updates.currentPeriodEnd !== undefined) updateData.currentPeriodEnd = updates.currentPeriodEnd;

  await db.update(subscriptions).set(updateData).where(eq(subscriptions.id, subscriptionId));
}

// ============================================================================
// TENANTS
// ============================================================================

export async function updateTenantStatus(tenantId: number, status: "active" | "paused" | "canceled"): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(tenants).set({ status }).where(eq(tenants.id, tenantId));
}
