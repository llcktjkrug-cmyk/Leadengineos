import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, index } from "drizzle-orm/mysql-core";

/**
 * Multi-tenant SaaS schema for Lead Engine OS
 * Supports workspace isolation, subscription billing, content generation, and workflow orchestration
 */

// ============================================================================
// CORE USER & TENANT TABLES
// ============================================================================

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "staff", "admin"]).default("user").notNull(),
  tenantId: int("tenantId"), // null for platform admins
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("tenant_idx").on(table.tenantId),
}));

export const tenants = mysqlTable("tenants", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  vertical: mysqlEnum("vertical", ["med_spa", "dental_implants", "multi_location"]),
  status: mysqlEnum("status", ["active", "paused", "canceled"]).default("active").notNull(),
  apiKey: varchar("apiKey", { length: 64 }).notNull().unique(), // for n8n integration
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================================================
// SUBSCRIPTION & BILLING TABLES
// ============================================================================

export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  revenuecatCustomerId: varchar("revenuecatCustomerId", { length: 255 }),
  revenuecatSubscriptionId: varchar("revenuecatSubscriptionId", { length: 255 }),
  plan: mysqlEnum("plan", ["starter", "pro", "scale"]).notNull(),
  status: mysqlEnum("status", ["active", "past_due", "canceled", "expired", "trialing"]).default("trialing").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  tenantIdx: index("tenant_idx").on(table.tenantId),
  statusIdx: index("status_idx").on(table.status),
}));

export const plans = mysqlTable("plans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  monthlyPrice: int("monthlyPrice").notNull(), // in cents
  maxLocations: int("maxLocations").notNull(),
  maxSiteConnections: int("maxSiteConnections").notNull(),
  maxTeamSeats: int("maxTeamSeats").notNull(),
  monthlyLandingPages: int("monthlyLandingPages").notNull(),
  monthlyBlogPosts: int("monthlyBlogPosts").notNull(),
  monthlySeoImprovements: int("monthlySeoImprovements").notNull(),
  monthlyInternalLinking: int("monthlyInternalLinking").notNull(),
  monthlyLocalPresence: int("monthlyLocalPresence").notNull(),
  weeklyReports: boolean("weeklyReports").default(true),
  priorityQueue: boolean("priorityQueue").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const quotaUsage = mysqlTable("quotaUsage", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  landingPagesUsed: int("landingPagesUsed").default(0).notNull(),
  blogPostsUsed: int("blogPostsUsed").default(0).notNull(),
  seoImprovementsUsed: int("seoImprovementsUsed").default(0).notNull(),
  internalLinkingUsed: int("internalLinkingUsed").default(0).notNull(),
  localPresenceUsed: int("localPresenceUsed").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  tenantPeriodIdx: index("tenant_period_idx").on(table.tenantId, table.periodStart),
}));

// ============================================================================
// WORDPRESS INTEGRATION
// ============================================================================

export const websiteConnections = mysqlTable("websiteConnections", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  platform: mysqlEnum("platform", ["wordpress", "hosted"]).notNull(),
  siteUrl: varchar("siteUrl", { length: 500 }),
  encryptedCredentials: text("encryptedCredentials"), // JSON encrypted with JWT_SECRET
  autoPublish: boolean("autoPublish").default(false),
  lastTestAt: timestamp("lastTestAt"),
  lastTestStatus: mysqlEnum("lastTestStatus", ["success", "failed"]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  tenantIdx: index("tenant_idx").on(table.tenantId),
}));

// ============================================================================
// DELIVERABLES & CONTENT
// ============================================================================

export const deliverableRequests = mysqlTable("deliverableRequests", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  requestedBy: int("requestedBy").notNull(), // user id
  type: mysqlEnum("type", ["landing_page", "blog_post", "seo_improvement", "internal_linking", "local_presence", "weekly_report"]).notNull(),
  status: mysqlEnum("status", ["requested", "needs_info", "queued", "running", "done", "failed"]).default("requested").notNull(),
  priority: int("priority").default(100).notNull(), // lower = higher priority
  requestData: text("requestData"), // JSON with request details
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
}, (table) => ({
  tenantStatusIdx: index("tenant_status_idx").on(table.tenantId, table.status),
  priorityIdx: index("priority_idx").on(table.priority),
}));

export const deliverables = mysqlTable("deliverables", {
  id: int("id").autoincrement().primaryKey(),
  requestId: int("requestId").notNull(),
  tenantId: int("tenantId").notNull(),
  type: mysqlEnum("type", ["landing_page", "blog_post", "seo_improvement", "internal_linking", "local_presence", "weekly_report"]).notNull(),
  title: varchar("title", { length: 500 }),
  contentUrl: varchar("contentUrl", { length: 1000 }), // S3 URL for generated content
  metadataJson: text("metadataJson"), // JSON with additional metadata
  version: int("version").default(1).notNull(),
  publishedToWordpress: boolean("publishedToWordpress").default(false),
  wordpressPostId: varchar("wordpressPostId", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  requestIdx: index("request_idx").on(table.requestId),
  tenantIdx: index("tenant_idx").on(table.tenantId),
}));

// ============================================================================
// BLOG CMS
// ============================================================================

export const blogPosts = mysqlTable("blogPosts", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId"), // null for platform blog
  authorId: int("authorId"),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  featuredImageUrl: varchar("featuredImageUrl", { length: 1000 }),
  category: mysqlEnum("category", ["med_spa_growth", "dental_implant_growth", "multi_location_presence", "conversion_playbooks", "experiments"]),
  status: mysqlEnum("status", ["draft", "published"]).default("draft").notNull(),
  seoTitle: varchar("seoTitle", { length: 500 }),
  seoMetaDescription: text("seoMetaDescription"),
  canonicalUrl: varchar("canonicalUrl", { length: 1000 }),
  schemaJson: text("schemaJson"), // JSON-LD for Schema.org
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  slugIdx: index("slug_idx").on(table.slug),
  tenantStatusIdx: index("tenant_status_idx").on(table.tenantId, table.status),
  categoryIdx: index("category_idx").on(table.category),
}));

export const landingPages = mysqlTable("landingPages", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull(),
  content: text("content").notNull(),
  pageType: varchar("pageType", { length: 100 }), // e.g., "service", "location"
  targetKeywords: text("targetKeywords"),
  seoTitle: varchar("seoTitle", { length: 500 }),
  seoMetaDescription: text("seoMetaDescription"),
  status: mysqlEnum("status", ["draft", "published"]).default("draft").notNull(),
  publishedToWordpress: boolean("publishedToWordpress").default(false),
  wordpressPageId: varchar("wordpressPageId", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  tenantSlugIdx: index("tenant_slug_idx").on(table.tenantId, table.slug),
}));

// ============================================================================
// LEAD CAPTURE & CONSENT
// ============================================================================

export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId"), // null for platform leads
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  source: varchar("source", { length: 255 }), // e.g., "contact_form", "roi_calculator"
  sourcePage: varchar("sourcePage", { length: 1000 }),
  vertical: varchar("vertical", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
  tenantIdx: index("tenant_idx").on(table.tenantId),
}));

export const leadEvents = mysqlTable("leadEvents", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull(),
  eventType: varchar("eventType", { length: 100 }).notNull(), // e.g., "consent_email", "consent_sms"
  consentGiven: boolean("consentGiven").default(false),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  leadIdx: index("lead_idx").on(table.leadId),
}));

// ============================================================================
// WORKFLOW & AUDIT
// ============================================================================

export const workflowRuns = mysqlTable("workflowRuns", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId"),
  workflowName: varchar("workflowName", { length: 255 }).notNull(),
  n8nExecutionId: varchar("n8nExecutionId", { length: 255 }),
  status: mysqlEnum("status", ["running", "success", "failed"]).notNull(),
  inputData: text("inputData"), // JSON
  outputData: text("outputData"), // JSON
  errorMessage: text("errorMessage"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
}, (table) => ({
  tenantWorkflowIdx: index("tenant_workflow_idx").on(table.tenantId, table.workflowName),
  statusIdx: index("status_idx").on(table.status),
}));

export const auditLog = mysqlTable("auditLog", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId"),
  userId: int("userId"),
  action: varchar("action", { length: 255 }).notNull(),
  resourceType: varchar("resourceType", { length: 100 }),
  resourceId: int("resourceId"),
  changes: text("changes"), // JSON with before/after
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("tenant_idx").on(table.tenantId),
  actionIdx: index("action_idx").on(table.action),
}));

// ============================================================================
// TEMPLATES & PROMPTS
// ============================================================================

export const contentTemplates = mysqlTable("contentTemplates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  vertical: mysqlEnum("vertical", ["med_spa", "dental_implants", "multi_location", "general"]).notNull(),
  contentType: mysqlEnum("contentType", ["blog_post", "landing_page", "seo_improvement", "email"]).notNull(),
  promptTemplate: text("promptTemplate").notNull(),
  systemPrompt: text("systemPrompt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  verticalTypeIdx: index("vertical_type_idx").on(table.vertical, table.contentType),
}));

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;
export type Plan = typeof plans.$inferSelect;
export type InsertPlan = typeof plans.$inferInsert;
export type QuotaUsage = typeof quotaUsage.$inferSelect;
export type InsertQuotaUsage = typeof quotaUsage.$inferInsert;
export type WebsiteConnection = typeof websiteConnections.$inferSelect;
export type InsertWebsiteConnection = typeof websiteConnections.$inferInsert;
export type DeliverableRequest = typeof deliverableRequests.$inferSelect;
export type InsertDeliverableRequest = typeof deliverableRequests.$inferInsert;
export type Deliverable = typeof deliverables.$inferSelect;
export type InsertDeliverable = typeof deliverables.$inferInsert;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;
export type LandingPage = typeof landingPages.$inferSelect;
export type InsertLandingPage = typeof landingPages.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;
export type LeadEvent = typeof leadEvents.$inferSelect;
export type InsertLeadEvent = typeof leadEvents.$inferInsert;
export type WorkflowRun = typeof workflowRuns.$inferSelect;
export type InsertWorkflowRun = typeof workflowRuns.$inferInsert;
export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;
export type ContentTemplate = typeof contentTemplates.$inferSelect;
export type InsertContentTemplate = typeof contentTemplates.$inferInsert;


// ============================================================================
// WORDPRESS ROLLBACK HISTORY
// ============================================================================

export const wordpressRollbackHistory = mysqlTable("wordpressRollbackHistory", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  batchId: varchar("batchId", { length: 64 }).notNull(), // Groups related updates
  wordpressPostId: int("wordpressPostId").notNull(),
  postType: mysqlEnum("postType", ["post", "page"]).notNull(),
  previousTitle: text("previousTitle"),
  previousContent: text("previousContent"),
  previousExcerpt: text("previousExcerpt"),
  previousStatus: varchar("previousStatus", { length: 50 }),
  previousMeta: text("previousMeta"), // JSON
  newTitle: text("newTitle"),
  newContent: text("newContent"),
  updatedBy: int("updatedBy"), // user id
  reverted: boolean("reverted").default(false),
  revertedAt: timestamp("revertedAt"),
  revertedBy: int("revertedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  tenantBatchIdx: index("tenant_batch_idx").on(table.tenantId, table.batchId),
  postIdx: index("post_idx").on(table.wordpressPostId),
}));

export type WordPressRollbackHistory = typeof wordpressRollbackHistory.$inferSelect;
export type InsertWordPressRollbackHistory = typeof wordpressRollbackHistory.$inferInsert;
