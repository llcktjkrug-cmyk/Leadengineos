import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "./_core/trpc";
import * as db from "./db";
import {
  createCheckoutSession,
  createCustomerPortalSession,
  getPublicConfig,
  parseWebhookEvent,
  verifyWebhookSignature,
  mapEventToStatus,
  getPlanFromProductId,
} from "./revenuecat";

/**
 * Billing Router
 * 
 * Handles subscription checkout, webhook processing, and billing management.
 */

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

// Tenant member procedure
const tenantProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user.tenantId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Tenant membership required" });
  }

  const tenant = await db.getTenantById(ctx.user.tenantId);
  if (!tenant) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Tenant not found" });
  }

  return next({
    ctx: {
      ...ctx,
      tenantId: ctx.user.tenantId,
      tenant,
    },
  });
});

export const billingRouter = router({
  // Get RevenueCat public configuration for frontend
  getConfig: publicProcedure.query(() => {
    return getPublicConfig();
  }),

  // Create checkout session
  createCheckout: tenantProcedure
    .input(
      z.object({
        planId: z.enum(["starter_monthly", "pro_monthly", "scale_monthly"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const tenant = ctx.tenant;
      const user = ctx.user;

      // Check if tenant already has active subscription
      const existingSub = await db.getSubscriptionByTenant(tenant.id);
      if (existingSub && existingSub.status === "active") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tenant already has an active subscription",
        });
      }

      // Create checkout session
      const customerId = `tenant_${tenant.id}`;
      const session = await createCheckoutSession({
        customerId,
        email: user.email || `${tenant.slug}@leadengine.kiasufamilytrust.org`,
        planId: input.planId,
        successUrl: `${process.env.VITE_APP_URL || "http://localhost:3000"}/dashboard?checkout=success`,
        cancelUrl: `${process.env.VITE_APP_URL || "http://localhost:3000"}/pricing?checkout=canceled`,
      });

      return {
        checkoutUrl: session.checkoutUrl,
      };
    }),

  // Create customer portal session
  createPortal: tenantProcedure.mutation(async ({ ctx }) => {
    const tenant = ctx.tenant;

    const customerId = `tenant_${tenant.id}`;
    const portal = await createCustomerPortalSession(customerId);

    return {
      portalUrl: portal.portalUrl,
    };
  }),

  // Get current subscription
  getSubscription: tenantProcedure.query(async ({ ctx }) => {
    const subscription = await db.getSubscriptionByTenant(ctx.tenantId);
    return subscription;
  }),

  // Process webhook (called by RevenueCat)
  webhook: publicProcedure
    .input(
      z.object({
        signature: z.string(),
        payload: z.any(),
      })
    )
    .mutation(async ({ input }) => {
      // Verify webhook signature (P1-001 FIX: Proper error handling)
      const payloadString = JSON.stringify(input.payload);
      const signatureResult = verifyWebhookSignature(payloadString, input.signature);

      if (!signatureResult.valid) {
        // Return appropriate HTTP status based on error type
        if (signatureResult.error === "WEBHOOK_SECRET_NOT_CONFIGURED") {
          // 500 - Server configuration error
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Webhook processing unavailable - configuration error",
          });
        }
        // 401/403 - Invalid or missing signature
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: signatureResult.error === "MISSING_SIGNATURE" 
            ? "Missing webhook signature" 
            : "Invalid webhook signature",
        });
      }

      // Parse event
      const event = parseWebhookEvent(input.payload);

      // Extract tenant ID from app_user_id (format: tenant_123)
      const tenantIdMatch = event.app_user_id.match(/^tenant_(\d+)$/);
      if (!tenantIdMatch) {
        console.error("[Billing] Invalid app_user_id format:", event.app_user_id);
        return { success: false, error: "Invalid customer ID format" };
      }

      const tenantId = parseInt(tenantIdMatch[1], 10);

      // Get or create subscription record
      let subscription = await db.getSubscriptionByTenant(tenantId);

      const newStatus = mapEventToStatus(event.type);
      const plan = getPlanFromProductId(event.product_id);

      if (subscription) {
        // Update existing subscription
        await db.updateSubscription(subscription.id, {
          status: newStatus,
          plan,
          revenuecatSubscriptionId: event.product_id,
          currentPeriodStart: new Date(event.purchased_at_ms),
          currentPeriodEnd: new Date(event.expiration_at_ms),
        });
      } else {
        // Create new subscription
        await db.createSubscription({
          tenantId,
          revenuecatCustomerId: event.app_user_id,
          revenuecatSubscriptionId: event.product_id,
          plan,
          status: newStatus,
          currentPeriodStart: new Date(event.purchased_at_ms),
          currentPeriodEnd: new Date(event.expiration_at_ms),
        });
      }

      // Update tenant status based on subscription
      if (newStatus === "active" || newStatus === "trialing") {
        await db.updateTenantStatus(tenantId, "active");
      } else if (newStatus === "canceled" || newStatus === "expired") {
        await db.updateTenantStatus(tenantId, "paused");
      }

      console.log(`[Billing] Processed ${event.type} for tenant ${tenantId}: ${newStatus}`);

      return { success: true };
    }),
});
