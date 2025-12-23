import axios from "axios";
import { createHmac } from "crypto";

/**
 * RevenueCat Web Billing Integration
 * 
 * Handles subscription checkout, webhook processing, and entitlement management.
 * Credentials are injected via environment variables.
 */

const REVENUECAT_API_BASE = "https://api.revenuecat.com/v1";

// Environment variables (set via webdev_request_secrets or Settings UI)
const REVENUECAT_PROJECT_ID = process.env.REVENUECAT_PROJECT_ID || "PLACEHOLDER_PROJECT_ID";
const REVENUECAT_PUBLIC_KEY = process.env.REVENUECAT_PUBLIC_KEY || "PLACEHOLDER_PUBLIC_KEY";
const REVENUECAT_SECRET_KEY = process.env.REVENUECAT_SECRET_KEY || "PLACEHOLDER_SECRET_KEY";
const REVENUECAT_WEBHOOK_SECRET = process.env.REVENUECAT_WEBHOOK_SECRET || "PLACEHOLDER_WEBHOOK_SECRET";

export interface CheckoutSessionParams {
  customerId: string;
  email: string;
  planId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface WebhookEvent {
  type: string;
  app_user_id: string;
  product_id: string;
  period_type: string;
  purchased_at_ms: number;
  expiration_at_ms: number;
  store: string;
  environment: string;
  entitlements: Record<string, any>;
}

/**
 * Create a checkout session for subscription purchase
 */
export async function createCheckoutSession(params: CheckoutSessionParams): Promise<{ checkoutUrl: string }> {
  // In production, this would call RevenueCat's checkout API
  // For now, return a placeholder URL structure
  
  if (REVENUECAT_SECRET_KEY === "PLACEHOLDER_SECRET_KEY") {
    console.warn("[RevenueCat] Using placeholder credentials - checkout will not work in production");
    return {
      checkoutUrl: `/checkout-placeholder?plan=${params.planId}&customer=${params.customerId}`,
    };
  }

  try {
    const response = await axios.post(
      `${REVENUECAT_API_BASE}/checkout_sessions`,
      {
        app_user_id: params.customerId,
        email: params.email,
        product_id: params.planId,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${REVENUECAT_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      checkoutUrl: response.data.checkout_url,
    };
  } catch (error: any) {
    console.error("[RevenueCat] Checkout session creation failed:", error.response?.data || error.message);
    throw new Error("Failed to create checkout session");
  }
}

/**
 * Get customer subscription info
 */
export async function getCustomerInfo(customerId: string): Promise<any> {
  if (REVENUECAT_SECRET_KEY === "PLACEHOLDER_SECRET_KEY") {
    console.warn("[RevenueCat] Using placeholder credentials - returning mock data");
    return {
      subscriber: {
        subscriptions: {},
        entitlements: {},
      },
    };
  }

  try {
    const response = await axios.get(`${REVENUECAT_API_BASE}/subscribers/${customerId}`, {
      headers: {
        Authorization: `Bearer ${REVENUECAT_SECRET_KEY}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("[RevenueCat] Failed to get customer info:", error.response?.data || error.message);
    throw new Error("Failed to get customer info");
  }
}

/**
 * Verify webhook signature
 * 
 * SECURITY: If webhook secret is not configured, this function throws an error.
 * Webhooks MUST NOT be processed without proper signature verification.
 */
export function verifyWebhookSignature(payload: string, signature: string): { valid: boolean; error?: string } {
  // P1-001 FIX: Never bypass signature verification
  if (!REVENUECAT_WEBHOOK_SECRET || REVENUECAT_WEBHOOK_SECRET === "PLACEHOLDER_WEBHOOK_SECRET") {
    console.error("[RevenueCat] CRITICAL: Webhook secret not configured - rejecting webhook");
    return { valid: false, error: "WEBHOOK_SECRET_NOT_CONFIGURED" };
  }

  if (!signature) {
    console.warn("[RevenueCat] Webhook received without signature header");
    return { valid: false, error: "MISSING_SIGNATURE" };
  }

  const expectedSignature = createHmac("sha256", REVENUECAT_WEBHOOK_SECRET).update(payload).digest("hex");

  if (signature !== expectedSignature) {
    console.warn("[RevenueCat] Webhook signature mismatch");
    return { valid: false, error: "INVALID_SIGNATURE" };
  }

  return { valid: true };
}

/**
 * Check if RevenueCat is properly configured
 */
export function isRevenueCatConfigured(): boolean {
  return (
    REVENUECAT_SECRET_KEY !== "PLACEHOLDER_SECRET_KEY" &&
    REVENUECAT_WEBHOOK_SECRET !== "PLACEHOLDER_WEBHOOK_SECRET" &&
    !!REVENUECAT_SECRET_KEY &&
    !!REVENUECAT_WEBHOOK_SECRET
  );
}

/**
 * Parse and validate webhook event
 */
export function parseWebhookEvent(payload: any): WebhookEvent {
  return {
    type: payload.type,
    app_user_id: payload.app_user_id,
    product_id: payload.product_id,
    period_type: payload.period_type,
    purchased_at_ms: payload.purchased_at_ms,
    expiration_at_ms: payload.expiration_at_ms,
    store: payload.store,
    environment: payload.environment,
    entitlements: payload.entitlements || {},
  };
}

/**
 * Map RevenueCat event type to subscription status
 */
export function mapEventToStatus(eventType: string): "active" | "past_due" | "canceled" | "expired" | "trialing" {
  const mapping: Record<string, "active" | "past_due" | "canceled" | "expired" | "trialing"> = {
    INITIAL_PURCHASE: "active",
    RENEWAL: "active",
    CANCELLATION: "canceled",
    BILLING_ISSUE: "past_due",
    EXPIRATION: "expired",
    TRIAL_STARTED: "trialing",
    TRIAL_CONVERTED: "active",
    TRIAL_CANCELLED: "canceled",
  };

  return mapping[eventType] || "active";
}

/**
 * Get plan details from product ID
 */
export function getPlanFromProductId(productId: string): "starter" | "pro" | "scale" {
  // Map RevenueCat product IDs to internal plan names
  const mapping: Record<string, "starter" | "pro" | "scale"> = {
    starter_monthly: "starter",
    pro_monthly: "pro",
    scale_monthly: "scale",
    starter_annual: "starter",
    pro_annual: "pro",
    scale_annual: "scale",
  };

  return mapping[productId] || "starter";
}

/**
 * Create customer portal session for subscription management
 */
export async function createCustomerPortalSession(customerId: string): Promise<{ portalUrl: string }> {
  if (REVENUECAT_SECRET_KEY === "PLACEHOLDER_SECRET_KEY") {
    console.warn("[RevenueCat] Using placeholder credentials - portal will not work in production");
    return {
      portalUrl: `/portal-placeholder?customer=${customerId}`,
    };
  }

  try {
    const response = await axios.post(
      `${REVENUECAT_API_BASE}/customer_portal_sessions`,
      {
        app_user_id: customerId,
      },
      {
        headers: {
          Authorization: `Bearer ${REVENUECAT_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      portalUrl: response.data.portal_url,
    };
  } catch (error: any) {
    console.error("[RevenueCat] Portal session creation failed:", error.response?.data || error.message);
    throw new Error("Failed to create portal session");
  }
}

/**
 * Get public configuration for frontend
 */
export function getPublicConfig() {
  return {
    projectId: REVENUECAT_PROJECT_ID,
    publicKey: REVENUECAT_PUBLIC_KEY,
    isPlaceholder: REVENUECAT_PUBLIC_KEY === "PLACEHOLDER_PUBLIC_KEY",
  };
}
