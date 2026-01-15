import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { n8nApiRouter } from "./n8nApi";
import { billingRouter } from "./billingRouter";
import * as db from "./db";
import { getDb } from "./db";
import {
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
  users,
} from "../drizzle/schema";
import { nanoid } from "nanoid";
import { eq, desc } from "drizzle-orm";

// ============================================================================
// CUSTOM PROCEDURES WITH RBAC
// ============================================================================

// Authenticated user procedure
const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication required" });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// Tenant-scoped procedure (user must belong to a tenant)
const tenantProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!ctx.user.tenantId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Tenant access required" });
  }
  return next({
    ctx: {
      ...ctx,
      tenantId: ctx.user.tenantId,
    },
  });
});

// API key authentication for n8n workflows
const apiKeyProcedure = publicProcedure
  .input(z.object({ apiKey: z.string() }))
  .use(async ({ ctx, next, input }) => {
    const apiKey = input.apiKey || ctx.req.headers["x-api-key"];

    if (!apiKey) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "API key required" });
    }

    const tenant = await db.getTenantByApiKey(apiKey as string);
    if (!tenant) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid API key" });
    }

    return next({
      ctx: {
        ...ctx,
        tenant,
        tenantId: tenant.id,
      },
    });
  });

// ============================================================================
// ROUTERS
// ============================================================================

export const appRouter = router({
  system: systemRouter,
  n8n: n8nApiRouter,
  billing: billingRouter,

  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user),
    // logout: publicProcedure.mutation(({ ctx }) => {
    //   const cookieOptions = getSessionCookieOptions(ctx.req);
    //   ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    //   return { success: true } as const;
    // }),
    logout: publicProcedure.mutation(({ ctx }) => {
  try {
    console.log("[LOGOUT] Logout mutation called");

    console.log("[LOGOUT] Incoming cookies:", ctx.req.headers.cookie);

    const cookieOptions = getSessionCookieOptions(ctx.req);

    console.log("[LOGOUT] Cookie options used:", cookieOptions);
    console.log("[LOGOUT] Clearing cookie:", COOKIE_NAME);

    ctx.res.clearCookie(COOKIE_NAME, {
      ...cookieOptions,
      maxAge: -1,
    });

    console.log("[LOGOUT] Cookie cleared successfully");

    return { success: true } as const;
  } catch (error) {
    console.error("[LOGOUT] Logout failed:", error);
    throw error; 
  }
}),

  }),

  // ============================================================================
  // TENANT MANAGEMENT (Admin only)
  // ============================================================================

  tenants: router({
    list: adminProcedure.query(async () => {
      return db.getAllTenants();
    }),

    getById: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getTenantById(input.id);
    }),

    create: adminProcedure
      .input(
        z.object({
          name: z.string(),
          slug: z.string(),
          vertical: z.enum(["med_spa", "dental_implants", "multi_location"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const apiKey = nanoid(32);
        const [result] = await database.insert(tenants).values({
          name: input.name,
          slug: input.slug,
          vertical: input.vertical,
          apiKey,
          status: "active",
        });

        return { id: Number(result.insertId), apiKey };
      }),

    updateStatus: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["active", "paused", "canceled"]),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        await database.update(tenants).set({ status: input.status }).where(eq(tenants.id, input.id));

        return { success: true };
      }),
  }),

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  users: router({
    listByTenant: tenantProcedure.query(async ({ ctx }) => {
      return db.getUsersByTenant(ctx.tenantId);
    }),

    listAll: adminProcedure.query(async () => {
      const database = await getDb();
      if (!database) return [];
      return database.select().from(users).orderBy(desc(users.createdAt));
    }),
  }),

  // ============================================================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================================================

  subscriptions: router({
    getMySubscription: tenantProcedure.query(async ({ ctx }) => {
      return db.getSubscriptionByTenant(ctx.tenantId);
    }),

    // Get plan limits for the current tenant's subscription
    getMyPlanLimits: tenantProcedure.query(async ({ ctx }) => {
      const subscription = await db.getSubscriptionByTenant(ctx.tenantId);
      if (!subscription) {
        // Return starter limits as default
        return {
          landingPages: 2,
          blogPosts: 4,
          seoImprovements: 2,
          internalLinking: 2,
          localPresence: 1,
        };
      }

      // Map plan enum to slug for lookup
      const planSlug = `${subscription.plan}_monthly`;
      const plan = await db.getPlanBySlug(planSlug);

      if (!plan) {
        // Return starter limits as fallback
        return {
          landingPages: 2,
          blogPosts: 4,
          seoImprovements: 2,
          internalLinking: 2,
          localPresence: 1,
        };
      }

      return {
        landingPages: plan.monthlyLandingPages,
        blogPosts: plan.monthlyBlogPosts,
        seoImprovements: plan.monthlySeoImprovements,
        internalLinking: plan.monthlyInternalLinking,
        localPresence: plan.monthlyLocalPresence,
      };
    }),

    listAll: adminProcedure.query(async () => {
      const database = await getDb();
      if (!database) return [];
      return database.select().from(subscriptions).orderBy(desc(subscriptions.createdAt));
    }),

    getActiveSubs: adminProcedure.query(async () => {
      return db.getActiveSubscriptions();
    }),

    getPastDueSubs: adminProcedure.query(async () => {
      return db.getPastDueSubscriptions();
    }),
  }),

  // ============================================================================
  // PLAN MANAGEMENT
  // ============================================================================

  plans: router({
    list: publicProcedure.query(async () => {
      return db.getAllPlans();
    }),

    getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
      return db.getPlanBySlug(input.slug);
    }),

    create: adminProcedure
      .input(
        z.object({
          name: z.string(),
          slug: z.string(),
          monthlyPrice: z.number(),
          maxLocations: z.number(),
          maxSiteConnections: z.number(),
          maxTeamSeats: z.number(),
          monthlyLandingPages: z.number(),
          monthlyBlogPosts: z.number(),
          monthlySeoImprovements: z.number(),
          monthlyInternalLinking: z.number(),
          monthlyLocalPresence: z.number(),
          weeklyReports: z.boolean().default(true),
          priorityQueue: z.boolean().default(false),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const [result] = await database.insert(plans).values(input);
        return { id: Number(result.insertId) };
      }),
  }),

  // ============================================================================
  // QUOTA MANAGEMENT
  // ============================================================================

  quota: router({
    getCurrent: tenantProcedure.query(async ({ ctx }) => {
      return db.getCurrentQuotaUsage(ctx.tenantId);
    }),
  }),

  // ============================================================================
  // DELIVERABLE REQUESTS
  // ============================================================================

  deliverableRequests: router({
    list: tenantProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return db.getDeliverableRequestsByTenant(ctx.tenantId, input?.status);
      }),

    create: tenantProcedure
      .input(
        z.object({
          type: z.enum(["landing_page", "blog_post", "seo_improvement", "internal_linking", "local_presence", "weekly_report"]),
          requestData: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const [result] = await database.insert(deliverableRequests).values({
          tenantId: ctx.tenantId,
          requestedBy: ctx.user.id,
          type: input.type,
          requestData: input.requestData,
          status: "requested",
        });

        return { id: Number(result.insertId) };
      }),

    getQueued: adminProcedure.query(async () => {
      return db.getQueuedDeliverableRequests();
    }),
  }),

  // ============================================================================
  // DELIVERABLES
  // ============================================================================

  deliverables: router({
    list: tenantProcedure
      .input(z.object({ type: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return db.getDeliverablesByTenant(ctx.tenantId, input?.type);
      }),

    // P2-004 FIX: Verify tenant ownership of requestId before returning deliverables
    getByRequest: tenantProcedure.input(z.object({ requestId: z.number() })).query(async ({ ctx, input }) => {
      // First verify the request belongs to this tenant
      const request = await db.getDeliverableRequestById(input.requestId);
      if (!request || request.tenantId !== ctx.tenantId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Request not found",
        });
      }
      return db.getDeliverablesByRequest(input.requestId);
    }),
  }),

  // ============================================================================
  // BLOG POSTS (Platform & Tenant)
  // ============================================================================

  blog: router({
    listPublic: publicProcedure
      .input(z.object({ category: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return db.getPublishedBlogPosts(input?.category);
      }),

    getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
      return db.getBlogPostBySlug(input.slug, null);
    }),

    listMyPosts: tenantProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return db.getBlogPostsByTenant(ctx.tenantId, input?.status);
      }),

    listAllPosts: adminProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return db.getBlogPostsByTenant(null, input?.status);
      }),

    updateStatus: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["draft", "published"]),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        await database
          .update(blogPosts)
          .set({
            status: input.status,
            publishedAt: input.status === "published" ? new Date() : null,
          })
          .where(eq(blogPosts.id, input.id));

        return { success: true };
      }),

    updatePost: adminProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          slug: z.string().optional(),
          excerpt: z.string().optional(),
          content: z.string().optional(),
          featuredImageUrl: z.string().optional(),
          category: z.enum(["med_spa_growth", "dental_implant_growth", "multi_location_presence", "conversion_playbooks", "experiments"]).optional(),
          status: z.enum(["draft", "published"]).optional(),
          seoTitle: z.string().optional(),
          seoDescription: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const { id, ...updateData } = input;
        await database
          .update(blogPosts)
          .set({
            ...updateData,
            publishedAt: input.status === "published" ? new Date() : undefined,
          })
          .where(eq(blogPosts.id, id));

        return { success: true };
      }),

    createPost: adminProcedure
      .input(
        z.object({
          title: z.string(),
          slug: z.string(),
          excerpt: z.string().optional(),
          content: z.string(),
          featuredImageUrl: z.string().optional(),
          category: z.enum(["med_spa_growth", "dental_implant_growth", "multi_location_presence", "conversion_playbooks", "experiments"]),
          status: z.enum(["draft", "published"]).default("draft"),
          seoTitle: z.string().optional(),
          seoDescription: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const [result] = await database.insert(blogPosts).values({
          ...input,
          tenantId: null,
          authorId: ctx.user.id,
          publishedAt: input.status === "published" ? new Date() : null,
        });

        return { id: Number(result.insertId) };
      }),

    deletePost: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        await database.delete(blogPosts).where(eq(blogPosts.id, input.id));

        return { success: true };
      }),
  }),

  // ============================================================================
  // LANDING PAGES
  // ============================================================================

  landingPages: router({
    list: tenantProcedure.query(async ({ ctx }) => {
      return db.getLandingPagesByTenant(ctx.tenantId);
    }),

    getBySlug: tenantProcedure.input(z.object({ slug: z.string() })).query(async ({ ctx, input }) => {
      return db.getLandingPageBySlug(input.slug, ctx.tenantId);
    }),
  }),

  // ============================================================================
  // LEAD CAPTURE
  // ============================================================================

  leads: router({
    create: publicProcedure
      .input(
        z.object({
          name: z.string().optional(),
          email: z.string().email(),
          phone: z.string().optional(),
          source: z.string(),
          sourcePage: z.string(),
          vertical: z.string().optional(),
          notes: z.string().optional(),
          consentEmail: z.boolean().default(false),
          consentSms: z.boolean().default(false),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const [leadResult] = await database.insert(leads).values({
          tenantId: null,
          name: input.name,
          email: input.email,
          phone: input.phone,
          source: input.source,
          sourcePage: input.sourcePage,
          vertical: input.vertical,
          notes: input.notes,
        });

        const leadId = Number(leadResult.insertId);

        // Record consent events
        if (input.consentEmail) {
          await database.insert(leadEvents).values({
            leadId,
            eventType: "consent_email",
            consentGiven: true,
            ipAddress: ctx.req.ip || ctx.req.headers["x-forwarded-for"] as string,
            userAgent: ctx.req.headers["user-agent"],
          });
        }

        if (input.consentSms) {
          await database.insert(leadEvents).values({
            leadId,
            eventType: "consent_sms",
            consentGiven: true,
            ipAddress: ctx.req.ip || ctx.req.headers["x-forwarded-for"] as string,
            userAgent: ctx.req.headers["user-agent"],
          });
        }

        return { id: leadId };
      }),

    list: adminProcedure.query(async () => {
      return db.getLeadsByTenant(null);
    }),

    listMyLeads: tenantProcedure.query(async ({ ctx }) => {
      return db.getLeadsByTenant(ctx.tenantId);
    }),
  }),

  // ============================================================================
  // WORKFLOW RUNS
  // ============================================================================

  workflows: router({
    listRuns: tenantProcedure
      .input(z.object({ workflowName: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return db.getWorkflowRunsByTenant(ctx.tenantId, input?.workflowName);
      }),

    listAllRuns: adminProcedure.input(z.object({ limit: z.number().default(50) }).optional()).query(async ({ input }) => {
      return db.getRecentWorkflowRuns(input?.limit);
    }),
  }),

  // ============================================================================
  // CONTENT TEMPLATES (Admin)
  // ============================================================================

  templates: router({
    list: adminProcedure
      .input(
        z.object({
          vertical: z.string().optional(),
          contentType: z.string().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        if (input?.vertical) {
          return db.getContentTemplatesByVertical(input.vertical, input.contentType);
        }
        return db.getAllContentTemplates();
      }),

    create: adminProcedure
      .input(
        z.object({
          name: z.string(),
          vertical: z.enum(["med_spa", "dental_implants", "multi_location", "general"]),
          contentType: z.enum(["blog_post", "landing_page", "seo_improvement", "email"]),
          promptTemplate: z.string(),
          systemPrompt: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const [result] = await database.insert(contentTemplates).values(input);
        return { id: Number(result.insertId) };
      }),
  }),

  // ============================================================================
  // WORDPRESS CONNECTIONS
  // ============================================================================

  wordpress: router({
    // List all connections for the current tenant
    listConnections: tenantProcedure.query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const connections = await database
        .select({
          id: websiteConnections.id,
          platform: websiteConnections.platform,
          siteUrl: websiteConnections.siteUrl,
          autoPublish: websiteConnections.autoPublish,
          lastTestAt: websiteConnections.lastTestAt,
          lastTestStatus: websiteConnections.lastTestStatus,
          createdAt: websiteConnections.createdAt,
        })
        .from(websiteConnections)
        .where(eq(websiteConnections.tenantId, ctx.tenantId))
        .orderBy(desc(websiteConnections.createdAt));

      return connections;
    }),

    // Create a new WordPress connection
    createConnection: tenantProcedure
      .input(
        z.object({
          siteUrl: z.string().url().refine((url) => url.startsWith("https://"), {
            message: "Site URL must use HTTPS",
          }),
          username: z.string().min(1, "Username is required"),
          applicationPassword: z.string().min(1, "Application password is required"),
          autoPublish: z.boolean().default(false),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        // Import encryption functions
        const { encryptWordPressCredentials } = await import("./encryption");
        const { testWordPressConnection } = await import("./wordpress");

        // Test the connection first
        const testResult = await testWordPressConnection({
          siteUrl: input.siteUrl,
          username: input.username,
          applicationPassword: input.applicationPassword,
        });

        if (!testResult.success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Connection test failed: ${testResult.error}`,
          });
        }

        // Encrypt credentials
        const encryptedCredentials = encryptWordPressCredentials({
          username: input.username,
          applicationPassword: input.applicationPassword,
        });

        // Store the connection
        const [result] = await database.insert(websiteConnections).values({
          tenantId: ctx.tenantId,
          platform: "wordpress",
          siteUrl: input.siteUrl,
          encryptedCredentials,
          autoPublish: input.autoPublish,
          lastTestAt: new Date(),
          lastTestStatus: "success",
        });

        return { id: Number(result.insertId), success: true };
      }),

    // Test an existing connection
    testConnection: tenantProcedure
      .input(z.object({ connectionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        // Get the connection (tenant-scoped)
        const [connection] = await database
          .select()
          .from(websiteConnections)
          .where(eq(websiteConnections.id, input.connectionId))
          .limit(1);

        if (!connection || connection.tenantId !== ctx.tenantId) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Connection not found" });
        }

        if (!connection.encryptedCredentials || !connection.siteUrl) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Connection is incomplete" });
        }

        // Decrypt and test
        const { decryptWordPressCredentials } = await import("./encryption");
        const { testWordPressConnection } = await import("./wordpress");

        const credentials = decryptWordPressCredentials(connection.encryptedCredentials);
        const testResult = await testWordPressConnection({
          siteUrl: connection.siteUrl,
          username: credentials.username,
          applicationPassword: credentials.applicationPassword,
        });

        // Update test status
        await database
          .update(websiteConnections)
          .set({
            lastTestAt: new Date(),
            lastTestStatus: testResult.success ? "success" : "failed",
          })
          .where(eq(websiteConnections.id, input.connectionId));

        return {
          success: testResult.success,
          error: testResult.error,
        };
      }),

    // Delete a connection
    deleteConnection: tenantProcedure
      .input(z.object({ connectionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        // Verify ownership
        const [connection] = await database
          .select({ tenantId: websiteConnections.tenantId })
          .from(websiteConnections)
          .where(eq(websiteConnections.id, input.connectionId))
          .limit(1);

        if (!connection || connection.tenantId !== ctx.tenantId) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Connection not found" });
        }

        // Delete the connection
        await database
          .delete(websiteConnections)
          .where(eq(websiteConnections.id, input.connectionId));

        return { success: true };
      }),

    // Update connection settings
    updateConnection: tenantProcedure
      .input(
        z.object({
          connectionId: z.number(),
          autoPublish: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        // Verify ownership
        const [connection] = await database
          .select({ tenantId: websiteConnections.tenantId })
          .from(websiteConnections)
          .where(eq(websiteConnections.id, input.connectionId))
          .limit(1);

        if (!connection || connection.tenantId !== ctx.tenantId) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Connection not found" });
        }

        // Update settings
        const updateData: Record<string, any> = {};
        if (input.autoPublish !== undefined) {
          updateData.autoPublish = input.autoPublish;
        }

        if (Object.keys(updateData).length > 0) {
          await database
            .update(websiteConnections)
            .set(updateData)
            .where(eq(websiteConnections.id, input.connectionId));
        }

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
