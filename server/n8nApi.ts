import { z } from "zod";
import { router, publicProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import {
  generateBlogPost,
  generateLandingPage,
  generateFeaturedImage,
  generateSEOImprovements,
  generateInternalLinkSuggestions,
} from "./contentGeneration";

/**
 * n8n API Router
 * 
 * These endpoints are called by n8n workflows using API key authentication.
 * All procedures use apiKeyProcedure which validates the X-API-Key header.
 */

// API key middleware
const apiKeyProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const apiKey = ctx.req.headers["x-api-key"];
  if (!apiKey || typeof apiKey !== "string") {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "API key required" });
  }

  const tenant = await db.getTenantByApiKey(apiKey);
  if (!tenant) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid API key" });
  }

  return next({
    ctx: {
      ...ctx,
      tenant,
    },
  });
});

export const n8nApiRouter = router({
  // Log workflow execution
  logWorkflowRun: apiKeyProcedure
    .input(
      z.object({
        workflowName: z.string(),
        status: z.enum(["running", "success", "failed"]),
        n8nExecutionId: z.string().optional(),
        inputData: z.string().optional(),
        outputData: z.string().optional(),
        errorMessage: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const tenantId = ctx.tenant!.id;

      const run = await db.createWorkflowRun({
        tenantId,
        workflowName: input.workflowName,
        status: input.status,
        n8nExecutionId: input.n8nExecutionId || null,
        inputData: input.inputData || null,
        outputData: input.outputData || null,
        errorMessage: input.errorMessage || null,
        startedAt: new Date(),
        completedAt: input.status !== "running" ? new Date() : null,
      });

      return { success: true, runId: run.id };
    }),

  // Update workflow run status
  updateWorkflowRun: apiKeyProcedure
    .input(
      z.object({
        runId: z.number(),
        status: z.enum(["running", "success", "failed"]),
        outputData: z.string().optional(),
        errorMessage: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await db.updateWorkflowRun(input.runId, {
        status: input.status,
        outputData: input.outputData || null,
        errorMessage: input.errorMessage || null,
        completedAt: input.status !== "running" ? new Date() : null,
      });

      return { success: true };
    }),

  // Get tenant configuration
  getTenantConfig: apiKeyProcedure.query(async ({ ctx }) => {
    const tenant = ctx.tenant!;
    const subscription = await db.getSubscriptionByTenant(tenant.id);
    const connections = await db.getWebsiteConnectionsByTenant(tenant.id);
    const websiteConnection = connections.length > 0 ? connections[0] : null;

    return {
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        vertical: tenant.vertical,
        status: tenant.status,
      },
      subscription: subscription
        ? {
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd,
          }
        : null,
      websiteConnection: websiteConnection
        ? {
            platform: websiteConnection.platform,
            siteUrl: websiteConnection.siteUrl,
            autoPublish: websiteConnection.autoPublish,
          }
        : null,
    };
  }),

  // Get pending deliverable requests
  getPendingRequests: apiKeyProcedure
    .input(
      z.object({
        type: z
          .enum(["landing_page", "blog_post", "seo_improvement", "internal_linking", "local_presence", "weekly_report"])
          .optional(),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      const tenantId = ctx.tenant!.id;

      const requests = await db.getDeliverableRequestsByStatus(tenantId, "queued", input.limit);

      if (input.type) {
        return requests.filter((r) => r.type === input.type);
      }

      return requests;
    }),

  // Update deliverable request status
  updateRequestStatus: apiKeyProcedure
    .input(
      z.object({
        requestId: z.number(),
        status: z.enum(["requested", "needs_info", "queued", "running", "done", "failed"]),
        errorMessage: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await db.updateDeliverableRequest(input.requestId, {
        status: input.status,
        errorMessage: input.errorMessage || null,
        completedAt: input.status === "done" ? new Date() : null,
      });

      return { success: true };
    }),

  // Generate blog post content
  generateBlogPost: apiKeyProcedure
    .input(
      z.object({
        requestId: z.number(),
        topic: z.string(),
        keywords: z.array(z.string()),
        targetWordCount: z.number().default(1500),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const tenantId = ctx.tenant!.id;
      const vertical = ctx.tenant!.vertical as "med_spa" | "dental_implants" | "multi_location";

      // Generate blog post
      const generated = await generateBlogPost({
        vertical,
        topic: input.topic,
        keywords: input.keywords,
        targetWordCount: input.targetWordCount,
      });

      // Generate featured image
      const featuredImageUrl = await generateFeaturedImage(generated.featuredImagePrompt);

      // Create blog post in database
      const post = await db.createBlogPost({
        title: generated.title,
        slug: generated.slug,
        excerpt: generated.excerpt,
        content: generated.content,
        status: "draft",
        category: generated.category as any,
        featuredImageUrl,
        seoTitle: generated.seoTitle,
        seoMetaDescription: generated.seoMetaDescription,
        publishedAt: null,
      });

      // Create deliverable record
      await db.createDeliverable({
        tenantId,
        requestId: input.requestId,
        type: "blog_post",
        title: generated.title,
        contentUrl: `/blog/${generated.slug}`,
        metadata: JSON.stringify({
          postId: post.id,
          wordCount: generated.content.split(/\s+/).length,
        }),
      });

      // Update request status
      await db.updateDeliverableRequest(input.requestId, {
        status: "done",
        completedAt: new Date(),
      });

      return {
        success: true,
        postId: post.id,
        slug: generated.slug,
      };
    }),

  // Generate landing page content
  generateLandingPage: apiKeyProcedure
    .input(
      z.object({
        requestId: z.number(),
        service: z.string(),
        location: z.string().optional(),
        targetAudience: z.string(),
        uniqueSellingPoints: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const tenantId = ctx.tenant!.id;
      const vertical = ctx.tenant!.vertical as "med_spa" | "dental_implants" | "multi_location";

      // Generate landing page
      const generated = await generateLandingPage({
        vertical,
        service: input.service,
        location: input.location,
        targetAudience: input.targetAudience,
        uniqueSellingPoints: input.uniqueSellingPoints,
      });

      // Generate featured image
      const featuredImageUrl = await generateFeaturedImage(generated.featuredImagePrompt);

      // Create landing page in database
      const page = await db.createLandingPage({
        tenantId,
        title: generated.title,
        slug: generated.slug,
        content: `# ${generated.headline}\n\n${generated.subheadline}\n\n${generated.heroContent}\n\n${generated.benefitsSection}\n\n${generated.ctaSection}\n\n${generated.faqSection}`,
        status: "draft",
        seoTitle: generated.seoTitle,
        seoMetaDescription: generated.seoMetaDescription,
      });

      // Create deliverable record
      await db.createDeliverable({
        tenantId,
        requestId: input.requestId,
        type: "landing_page",
        title: generated.title,
        contentUrl: `/landing/${generated.slug}`,
        metadata: JSON.stringify({
          pageId: page.id,
        }),
      });

      // Update request status
      await db.updateDeliverableRequest(input.requestId, {
        status: "done",
        completedAt: new Date(),
      });

      return {
        success: true,
        pageId: page.id,
        slug: generated.slug,
      };
    }),

  // Generate SEO improvements
  generateSEOImprovements: apiKeyProcedure
    .input(
      z.object({
        requestId: z.number(),
        pageUrl: z.string(),
        pageContent: z.string(),
        targetKeywords: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const tenantId = ctx.tenant!.id;

      // Generate SEO improvements
      const improvements = await generateSEOImprovements(input.pageContent, input.targetKeywords);

      // Create deliverable record
      await db.createDeliverable({
        tenantId,
        requestId: input.requestId,
        type: "seo_improvement",
        title: `SEO Improvements for ${input.pageUrl}`,
        contentUrl: input.pageUrl,
        metadata: JSON.stringify({
          improvements,
          targetKeywords: input.targetKeywords,
        }),
      });

      // Update request status
      await db.updateDeliverableRequest(input.requestId, {
        status: "done",
        completedAt: new Date(),
      });

      return {
        success: true,
        improvements,
      };
    }),

  // Generate internal linking suggestions
  generateInternalLinks: apiKeyProcedure
    .input(
      z.object({
        requestId: z.number(),
        pageContent: z.string(),
        availablePages: z.array(
          z.object({
            title: z.string(),
            url: z.string(),
            excerpt: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const tenantId = ctx.tenant!.id;

      // Generate internal link suggestions
      const suggestions = await generateInternalLinkSuggestions(input.pageContent, input.availablePages);

      // Create deliverable record
      await db.createDeliverable({
        tenantId,
        requestId: input.requestId,
        type: "internal_linking",
        title: "Internal Linking Suggestions",
        contentUrl: "#",
        metadata: JSON.stringify({
          suggestions,
        }),
      });

      // Update request status
      await db.updateDeliverableRequest(input.requestId, {
        status: "done",
        completedAt: new Date(),
      });

      return {
        success: true,
        suggestions,
      };
    }),

  // Store deliverable (generic endpoint for custom workflows)
  storeDeliverable: apiKeyProcedure
    .input(
      z.object({
        requestId: z.number(),
        type: z.enum(["landing_page", "blog_post", "seo_improvement", "internal_linking", "local_presence", "weekly_report"]),
        title: z.string(),
        contentUrl: z.string(),
        metadata: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const tenantId = ctx.tenant!.id;

      const deliverable = await db.createDeliverable({
        tenantId,
        requestId: input.requestId,
        type: input.type,
        title: input.title,
        contentUrl: input.contentUrl,
        metadata: input.metadata || null,
      });

      // Update request status
      await db.updateDeliverableRequest(input.requestId, {
        status: "done",
        completedAt: new Date(),
      });

      return {
        success: true,
        deliverableId: deliverable.id,
      };
    }),
});
