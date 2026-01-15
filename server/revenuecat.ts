// import axios from "axios";
// import { createHmac } from "crypto";

// /**
//  * RevenueCat Web Billing Integration
//  * 
//  * Handles subscription checkout, webhook processing, and entitlement management.
//  * Credentials are injected via environment variables.
//  */

// const REVENUECAT_API_BASE = "https://api.revenuecat.com/v1";
// const REVENUECAT_V1_API_BASE = "https://api.revenuecat.com/v1";

// // Environment variables (set via webdev_request_secrets or Settings UI)
// const REVENUECAT_PROJECT_ID = process.env.REVENUECAT_PROJECT_ID || "PLACEHOLDER_PROJECT_ID";
// const REVENUECAT_PUBLIC_KEY = process.env.REVENUECAT_PUBLIC_KEY || "PLACEHOLDER_PUBLIC_KEY";
// const REVENUECAT_SECRET_KEY = process.env.REVENUECAT_SECRET_KEY || "PLACEHOLDER_SECRET_KEY";
// const REVENUECAT_WEBHOOK_SECRET = process.env.REVENUECAT_WEBHOOK_SECRET || "PLACEHOLDER_WEBHOOK_SECRET";

// export interface CheckoutSessionParams {
//   customerId: string;
//   email: string;
//   planId: string;
//   successUrl: string;
//   cancelUrl: string;
// }

// export interface WebhookEvent {
//   type: string;
//   app_user_id: string;
//   product_id: string;
//   period_type: string;
//   purchased_at_ms: number;
//   expiration_at_ms: number;
//   store: string;
//   environment: string;
//   entitlements: Record<string, any>;
// }

// /**
//  * Create a checkout session for subscription purchase
//  */
// export async function createCheckoutSession(params: CheckoutSessionParams): Promise<{ checkoutUrl: string }> {
//   // In production, this would call RevenueCat's checkout API
//   // For now, return a placeholder URL structure
  
//   if (REVENUECAT_SECRET_KEY === "PLACEHOLDER_SECRET_KEY") {
//     console.warn("[RevenueCat] Using placeholder credentials - checkout will not work in production");
//     return {
//       checkoutUrl: `/checkout-placeholder?plan=${params.planId}&customer=${params.customerId}`,
//     };
//   }

//   try {
//     const response = await axios.post(
//       `${REVENUECAT_API_BASE}/checkout_sessions`,
//       {
//         app_user_id: params.customerId,
//         email: params.email,
//         product_id: params.planId,
//         success_url: params.successUrl,
//         cancel_url: params.cancelUrl,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${REVENUECAT_SECRET_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     return {
//       checkoutUrl: response.data.checkout_url,
//     };
//   } catch (error: any) {
//     console.error("[RevenueCat] Checkout session creation failed:", error.response?.data || error.message);
//     throw new Error("Failed to create checkout session");
//   }
// }

// /**
//  * Get customer subscription info
//  */
// export async function getCustomerInfo(customerId: string): Promise<any> {
//   if (REVENUECAT_SECRET_KEY === "PLACEHOLDER_SECRET_KEY") {
//     console.warn("[RevenueCat] Using placeholder credentials - returning mock data");
//     return {
//       subscriber: {
//         subscriptions: {},
//         entitlements: {},
//       },
//     };
//   }

//   try {
//     const response = await axios.get(`${REVENUECAT_API_BASE}/subscribers/${customerId}`, {
//       headers: {
//         Authorization: `Bearer ${REVENUECAT_SECRET_KEY}`,
//       },
//     });

//     return response.data;
//   } catch (error: any) {
//     console.error("[RevenueCat] Failed to get customer info:", error.response?.data || error.message);
//     throw new Error("Failed to get customer info");
//   }
// }

// /**
//  * Verify webhook signature
//  * 
//  * SECURITY: If webhook secret is not configured, this function throws an error.
//  * Webhooks MUST NOT be processed without proper signature verification.
//  */
// export function verifyWebhookSignature(payload: string, signature: string): { valid: boolean; error?: string } {
//   // P1-001 FIX: Never bypass signature verification
//   if (!REVENUECAT_WEBHOOK_SECRET || REVENUECAT_WEBHOOK_SECRET === "PLACEHOLDER_WEBHOOK_SECRET") {
//     console.error("[RevenueCat] CRITICAL: Webhook secret not configured - rejecting webhook");
//     return { valid: false, error: "WEBHOOK_SECRET_NOT_CONFIGURED" };
//   }

//   if (!signature) {
//     console.warn("[RevenueCat] Webhook received without signature header");
//     return { valid: false, error: "MISSING_SIGNATURE" };
//   }

//   const expectedSignature = createHmac("sha256", REVENUECAT_WEBHOOK_SECRET).update(payload).digest("hex");

//   if (signature !== expectedSignature) {
//     console.warn("[RevenueCat] Webhook signature mismatch");
//     return { valid: false, error: "INVALID_SIGNATURE" };
//   }

//   return { valid: true };
// }

// /**
//  * Check if RevenueCat is properly configured
//  */
// export function isRevenueCatConfigured(): boolean {
//   return (
//     REVENUECAT_SECRET_KEY !== "PLACEHOLDER_SECRET_KEY" &&
//     REVENUECAT_WEBHOOK_SECRET !== "PLACEHOLDER_WEBHOOK_SECRET" &&
//     !!REVENUECAT_SECRET_KEY &&
//     !!REVENUECAT_WEBHOOK_SECRET
//   );
// }

// /**
//  * Parse and validate webhook event
//  */
// export function parseWebhookEvent(payload: any): WebhookEvent {
//   return {
//     type: payload.type,
//     app_user_id: payload.app_user_id,
//     product_id: payload.product_id,
//     period_type: payload.period_type,
//     purchased_at_ms: payload.purchased_at_ms,
//     expiration_at_ms: payload.expiration_at_ms,
//     store: payload.store,
//     environment: payload.environment,
//     entitlements: payload.entitlements || {},
//   };
// }

// /**
//  * Map RevenueCat event type to subscription status
//  */
// export function mapEventToStatus(eventType: string): "active" | "past_due" | "canceled" | "expired" | "trialing" {
//   const mapping: Record<string, "active" | "past_due" | "canceled" | "expired" | "trialing"> = {
//     INITIAL_PURCHASE: "active",
//     RENEWAL: "active",
//     CANCELLATION: "canceled",
//     BILLING_ISSUE: "past_due",
//     EXPIRATION: "expired",
//     TRIAL_STARTED: "trialing",
//     TRIAL_CONVERTED: "active",
//     TRIAL_CANCELLED: "canceled",
//   };

//   return mapping[eventType] || "active";
// }

// /**
//  * Get plan details from product ID
//  */
// export function getPlanFromProductId(productId: string): "starter" | "pro" | "scale" {
//   // Map RevenueCat product IDs to internal plan names
//   const mapping: Record<string, "starter" | "pro" | "scale"> = {
//     starter_monthly: "starter",
//     pro_monthly: "pro",
//     scale_monthly: "scale",
//     starter_annual: "starter",
//     pro_annual: "pro",
//     scale_annual: "scale",
//   };

//   return mapping[productId] || "starter";
// }

// /**
//  * Create customer portal session for subscription management
//  */
// // export async function createCustomerPortalSession(customerId: string): Promise<{ portalUrl: string }> {
// //   if (REVENUECAT_SECRET_KEY === "PLACEHOLDER_SECRET_KEY") {
// //     console.warn("[RevenueCat] Using placeholder credentials - portal will not work in production");
// //     return {
// //       portalUrl: `/portal-placeholder?customer=${customerId}`,
// //     };
// //   }

// //   try {
// //     const response = await axios.post(
// //       `${REVENUECAT_API_BASE}/customer_portal_sessions`,
// //       {
// //         app_user_id: customerId,
// //       },
// //       {
// //         headers: {
// //           Authorization: `Bearer ${REVENUECAT_SECRET_KEY}`,
// //           "Content-Type": "application/json",
// //         },
// //       }
// //     );

// //     return {
// //       portalUrl: response.data.portal_url,
// //     };
// //   } catch (error: any) {
// //     console.error("[RevenueCat] Portal session creation failed:", error.response?.data || error.message);
// //     throw new Error("Failed to create portal session");
// //   }
// // }
// // export async function createCustomerPortalSession(
// //   customerId: string
// // ): Promise<{ portalUrl: string }> {
// //   console.log("[RevenueCat][Portal] Request started", { customerId });

// //   try {
// //     // 1️⃣ Placeholder / local mode
// //     if (REVENUECAT_SECRET_KEY === "PLACEHOLDER_SECRET_KEY") {
// //       console.warn(
// //         "[RevenueCat][Portal] Placeholder secret key detected — returning mock portal URL"
// //       );

// //       return {
// //         portalUrl: `/portal-placeholder?customer=${customerId}`,
// //       };
// //     }

// //     console.log("[RevenueCat][Portal] Creating portal session with RevenueCat", {
// //       apiBase: REVENUECAT_API_BASE,
// //       customerId,
// //     });

// //     // 2️⃣ API call
// //     const response = await axios.post(
// //       `${REVENUECAT_API_BASE}/projects/proje450b2c5/customer_portal_sessions`,
// //       {
// //         app_user_id: customerId,
// //       },
// //       {
// //         headers: {
// //           Authorization: `Bearer ${REVENUECAT_SECRET_KEY}`,
// //           "Content-Type": "application/json",
// //         },
// //         timeout: 10000, // prevents hanging requests
// //       }
// //     );

// //     console.log("[RevenueCat][Portal] API response received", {
// //       status: response.status,
// //       data: response.data,
// //     });

// //     // 3️⃣ Validate response
// //     if (!response.data?.portal_url) {
// //       console.error(
// //         "[RevenueCat][Portal] Missing portal_url in response",
// //         response.data
// //       );
// //       throw new Error("RevenueCat response missing portal_url");
// //     }

// //     console.log("[RevenueCat][Portal] Portal URL created successfully", {
// //       portalUrl: response.data.portal_url,
// //     });

// //     return {
// //       portalUrl: response.data.portal_url,
// //     };
// //   } catch (error: any) {
// //     // 4️⃣ Axios-specific debugging
// //     if (axios.isAxiosError(error)) {
// //       console.error("[RevenueCat][Portal] Axios error", {
// //         message: error.message,
// //         status: error.response?.status,
// //         responseData: error.response?.data,
// //         requestUrl: error.config?.url,
// //       });
// //     } else {
// //       console.error("[RevenueCat][Portal] Unknown error", error);
// //     }

// //     throw new Error("Failed to create portal session");
// //   }
// // }
// export async function createCustomerPortalSession(
//   customerId: string
// ): Promise<{ portalUrl: string }> {
//   console.log("[RevenueCat][Portal] Request started", { customerId });

//   try {
//     // 1️⃣ Placeholder / local mode
//     if (REVENUECAT_SECRET_KEY === "PLACEHOLDER_SECRET_KEY") {
//       console.warn(
//         "[RevenueCat][Portal] Placeholder secret key detected — returning mock portal URL"
//       );

//       return {
//         portalUrl: `/portal-placeholder?customer=${customerId}`,
//       };
//     }

//     // Use the project ID from environment variable
//     const projectId = REVENUECAT_PROJECT_ID;
//     console.log("[RevenueCat][Portal] Creating portal session with RevenueCat", {
//       apiBase: REVENUECAT_V1_API_BASE,
//       projectId,
//       customerId,
//     });

//     // 2️⃣ API call to v1 endpoint
//     const response = await axios.post(
//       `${REVENUECAT_V1_API_BASE}/projects/${projectId}/customer_portal_sessions`,
//       {
//         app_user_id: customerId,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${REVENUECAT_SECRET_KEY}`,
//           "Content-Type": "application/json",
//         },
//         timeout: 10000, // prevents hanging requests
//       }
//     );

//     console.log("[RevenueCat][Portal] API response received", {
//       status: response.status,
//       data: response.data,
//     });

//     // 3️⃣ Validate response
//     if (!response.data?.portal_url) {
//       console.error(
//         "[RevenueCat][Portal] Missing portal_url in response",
//         response.data
//       );
//       throw new Error("RevenueCat response missing portal_url");
//     }

//     console.log("[RevenueCat][Portal] Portal URL created successfully", {
//       portalUrl: response.data.portal_url,
//     });

//     return {
//       portalUrl: response.data.portal_url,
//     };
//   } catch (error: any) {
//     // 4️⃣ Axios-specific debugging
//     if (axios.isAxiosError(error)) {
//       console.error("[RevenueCat][Portal] Axios error", {
//         message: error.message,
//         status: error.response?.status,
//         responseData: error.response?.data,
//         requestUrl: error.config?.url,
//       });
//     } else {
//       console.error("[RevenueCat][Portal] Unknown error", error);
//     }

//     throw new Error("Failed to create portal session");
//   }
// }

// /**
//  * Get public configuration for frontend
//  */
// export function getPublicConfig() {
//   return {
//     projectId: REVENUECAT_PROJECT_ID,
//     publicKey: REVENUECAT_PUBLIC_KEY,
//     isPlaceholder: REVENUECAT_PUBLIC_KEY === "PLACEHOLDER_PUBLIC_KEY",
//   };
// }
// import axios from "axios";
// import { createHmac, timingSafeEqual } from "crypto";

// /**
//  * =========================
//  * REVENUECAT CONFIGURATION
//  * =========================
//  */
// const REVENUECAT_API_BASE = "https://api.revenuecat.com/v1";

// const REVENUECAT_PROJECT_ID =
//   process.env.REVENUECAT_PROJECT_ID || "PLACEHOLDER_PROJECT_ID";

// const REVENUECAT_PUBLIC_KEY =
//   process.env.REVENUECAT_PUBLIC_KEY || "PLACEHOLDER_PUBLIC_KEY";

// const REVENUECAT_SECRET_KEY =
//   process.env.REVENUECAT_SECRET_KEY || "PLACEHOLDER_SECRET_KEY";

// const REVENUECAT_WEBHOOK_SECRET =
//   process.env.REVENUECAT_WEBHOOK_SECRET || "PLACEHOLDER_WEBHOOK_SECRET";

// /**
//  * =========================
//  * TYPES
//  * =========================
//  */
// export interface CheckoutSessionParams {
//   customerId: string;
//   email: string;
//   planId: string;
//   successUrl: string;
//   cancelUrl: string;
// }

// export interface WebhookEvent {
//   type: string;
//   app_user_id: string;
//   product_id: string;
//   period_type: string;
//   purchased_at_ms: number;
//   expiration_at_ms: number;
//   store: string;
//   environment: string;
//   entitlements: Record<string, any>;
// }

// /**
//  * =========================
//  * HELPER: CHECK CONFIG
//  * =========================
//  */
// export function isRevenueCatConfigured(): boolean {
//   return (
//     !!REVENUECAT_PROJECT_ID &&
//     !!REVENUECAT_SECRET_KEY &&
//     !!REVENUECAT_WEBHOOK_SECRET &&
//     !REVENUECAT_SECRET_KEY.startsWith("PLACEHOLDER")
//   );
// }

// /**
//  * =========================
//  * CHECKOUT (WEB BILLING)
//  * =========================
//  */
// export async function createCheckoutSession(
//   params: CheckoutSessionParams
// ): Promise<{ checkoutUrl: string }> {
//   console.log("[RevenueCat][Checkout] Start", params);

//   if (!isRevenueCatConfigured()) {
//     console.warn("[RevenueCat][Checkout] Placeholder mode active");
//     return {
//       checkoutUrl: `/checkout-placeholder?plan=${params.planId}&user=${params.customerId}`,
//     };
//   }

//   const checkoutUrl = new URL("https://pay.rev.cat/sandbox/hbogbjqbywpllhzo/");
//   checkoutUrl.searchParams.set("app_user_id", params.customerId);
//   checkoutUrl.searchParams.set("email", params.email);
//   checkoutUrl.searchParams.set("success_url", params.successUrl);
//   checkoutUrl.searchParams.set("cancel_url", params.cancelUrl);

//   console.log("[RevenueCat][Checkout] URL created", checkoutUrl.toString());
//   return { checkoutUrl: checkoutUrl.toString() };
// }

// /**
//  * =========================
//  * CUSTOMER INFO
//  * =========================
//  */
// export async function getCustomerInfo(customerId: string): Promise<any> {
//   console.log("[RevenueCat][Subscriber] Fetching info", { customerId });

//   if (!isRevenueCatConfigured()) {
//     console.warn("[RevenueCat][Subscriber] Placeholder mode");
//     return { subscriber: { subscriptions: {}, entitlements: {} } };
//   }

//   try {
//     const response = await axios.get(
//       `${REVENUECAT_API_BASE}/subscribers/${customerId}`,
//       {
//         headers: {
//           Authorization: `Bearer ${REVENUECAT_SECRET_KEY}`,
//         },
//         timeout: 10000,
//       }
//     );

//     console.log("[RevenueCat][Subscriber] Success", response.data);
//     return response.data;
//   } catch (error: any) {
//     console.error(
//       "[RevenueCat][Subscriber] Failed",
//       axios.isAxiosError(error)
//         ? { status: error.response?.status, data: error.response?.data }
//         : error
//     );
//     throw new Error("Failed to get customer info");
//   }
// }

// /**
//  * =========================
//  * CUSTOMER PORTAL
//  * =========================
//  */
// export async function createCustomerPortalSession(
//   customerId: string,
//   email?: string
// ): Promise<{ portalUrl: string }> {
//   console.log("[RevenueCat][Portal] Creating portal session", { customerId });

//   if (!isRevenueCatConfigured()) {
//     console.warn("[RevenueCat][Portal] Placeholder mode");
//     return { portalUrl: `/portal-placeholder?customer=${customerId}` };
//   }

//   const portalUrl = new URL("https://pay.rev.cat/sandbox/hbogbjqbywpllhzo/567");
//   portalUrl.searchParams.set("app_user_id", customerId);
//   if (email) portalUrl.searchParams.set("email", email);

//   console.log("[RevenueCat][Portal] Portal URL created", portalUrl.toString());
//   return { portalUrl: portalUrl.toString() };
// }

// /**
//  * =========================
//  * WEBHOOK VERIFICATION
//  * =========================
//  */
// export function verifyWebhookSignature(
//   payload: string,
//   signature: string
// ): { valid: boolean; error?: string } {
//   if (!REVENUECAT_WEBHOOK_SECRET || !signature) {
//     return { valid: false, error: "SIGNATURE_MISSING" };
//   }

//   try {
//     const expected = createHmac("sha256", REVENUECAT_WEBHOOK_SECRET)
//       .update(payload)
//       .digest("hex");

//     const valid = timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
//     return valid ? { valid: true } : { valid: false, error: "INVALID_SIGNATURE" };
//   } catch {
//     return { valid: false, error: "INVALID_SIGNATURE" };
//   }
// }

// /**
//  * =========================
//  * WEBHOOK PARSING
//  * =========================
//  */
// export function parseWebhookEvent(payload: any): WebhookEvent {
//   return {
//     type: payload.type,
//     app_user_id: payload.app_user_id,
//     product_id: payload.product_id,
//     period_type: payload.period_type,
//     purchased_at_ms: payload.purchased_at_ms,
//     expiration_at_ms: payload.expiration_at_ms,
//     store: payload.store,
//     environment: payload.environment,
//     entitlements: payload.entitlements ?? {},
//   };
// }

// /**
//  * =========================
//  * SUBSCRIPTION STATUS MAPPING
//  * =========================
//  */
// export function mapEventToStatus(
//   eventType: string
// ): "active" | "past_due" | "canceled" | "expired" | "trialing" {
//   switch (eventType) {
//     case "INITIAL_PURCHASE":
//     case "RENEWAL":
//     case "UNCANCELLATION":
//       return "active";
//     case "BILLING_ISSUE":
//       return "past_due";
//     case "CANCELLATION":
//       return "canceled";
//     case "EXPIRATION":
//       return "expired";
//     case "TRIAL_STARTED":
//       return "trialing";
//     case "TRIAL_CONVERTED":
//       return "active";
//     case "TRIAL_CANCELLED":
//       return "canceled";
//     default:
//       return "active";
//   }
// }

// /**
//  * =========================
//  * PLAN MAPPING
//  * =========================
//  */
// export function getPlanFromProductId(
//   productId: string
// ): "starter" | "pro" | "scale" {
//   if (productId.includes("starter")) return "starter";
//   if (productId.includes("pro")) return "pro";
//   if (productId.includes("scale")) return "scale";
//   return "starter";
// }

// /**
//  * =========================
//  * PUBLIC CONFIG
//  * =========================
//  */
// export function getPublicConfig() {
//   return {
//     projectId: REVENUECAT_PROJECT_ID,
//     publicKey: REVENUECAT_PUBLIC_KEY,
//     isPlaceholder: REVENUECAT_PUBLIC_KEY === "PLACEHOLDER_PUBLIC_KEY",
//   };
// }
import axios from "axios";
import { createHmac } from "crypto";

/**
 * RevenueCat Web Billing Integration
 *
 * Uses RevenueCat's hosted Web Billing payment links for subscription checkout.
 * Payment links follow the format: https://pay.rev.cat/[environment]/[project_id]/[product_id]
 *
 * Required environment variables:
 * - REVENUECAT_PROJECT_ID: Your RevenueCat project ID
 * - REVENUECAT_PUBLIC_KEY: Public API key (starts with rcb_)
 * - REVENUECAT_SECRET_KEY: Secret API key for server-side calls
 * - REVENUECAT_WEBHOOK_SECRET: Secret for verifying webhook signatures
 * - REVENUECAT_ENVIRONMENT: "sandbox" or "production" (defaults to "sandbox")
 */

const REVENUECAT_API_BASE = "https://api.revenuecat.com/v1";
const REVENUECAT_WEB_BILLING_BASE = "https://pay.rev.cat";

// Environment variables (set via Settings UI or .env)
const REVENUECAT_PROJECT_ID = process.env.REVENUECAT_PROJECT_ID || "PLACEHOLDER_PROJECT_ID";
const REVENUECAT_PUBLIC_KEY = process.env.REVENUECAT_PUBLIC_KEY || "PLACEHOLDER_PUBLIC_KEY";
const REVENUECAT_SECRET_KEY = process.env.REVENUECAT_SECRET_KEY || "PLACEHOLDER_SECRET_KEY";
const REVENUECAT_WEBHOOK_SECRET = process.env.REVENUECAT_WEBHOOK_SECRET || "PLACEHOLDER_WEBHOOK_SECRET";
const REVENUECAT_ENVIRONMENT = process.env.REVENUECAT_ENVIRONMENT || "sandbox";

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
 * Build RevenueCat Web Billing checkout URL
 *
 * RevenueCat Web Billing uses hosted payment links, not a REST API.
 * Format: https://pay.rev.cat/[sandbox|production]/[project_id]/[product_id]?app_user_id=xxx&email=xxx
 */
export async function createCheckoutSession(params: CheckoutSessionParams): Promise<{ checkoutUrl: string }> {
  if (REVENUECAT_PROJECT_ID === "PLACEHOLDER_PROJECT_ID") {
    console.warn("[RevenueCat] Using placeholder credentials - checkout will not work in production");
    return {
      checkoutUrl: `/checkout-placeholder?plan=${params.planId}&customer=${params.customerId}`,
    };
  }

  // Build the RevenueCat Web Billing URL
  // The successUrl and cancelUrl are configured in the RevenueCat dashboard, not passed here
  const checkoutUrl = new URL(
    `${REVENUECAT_WEB_BILLING_BASE}/${REVENUECAT_ENVIRONMENT}/${REVENUECAT_PROJECT_ID}/${params.planId}`
  );

  // Add query parameters for user identification
  checkoutUrl.searchParams.set("app_user_id", params.customerId);
  if (params.email) {
    checkoutUrl.searchParams.set("email", params.email);
  }

  console.log(`[RevenueCat] Generated checkout URL for ${params.customerId}: ${checkoutUrl.toString()}`);

  return {
    checkoutUrl: checkoutUrl.toString(),
  };
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
 */
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (REVENUECAT_WEBHOOK_SECRET === "PLACEHOLDER_WEBHOOK_SECRET") {
    console.warn("[RevenueCat] Using placeholder webhook secret - skipping signature verification");
    return true;
  }

  const expectedSignature = createHmac("sha256", REVENUECAT_WEBHOOK_SECRET).update(payload).digest("hex");

  return signature === expectedSignature;
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
 * Build RevenueCat customer management portal URL
 *
 * RevenueCat Web Billing provides a customer center for subscription management.
 * This can be accessed via direct URL or embedded in your app.
 *
 * Note: The portal URL format depends on your RevenueCat setup. Options include:
 * 1. RevenueCat's hosted customer center (requires setup in dashboard)
 * 2. Direct Stripe billing portal (if using Stripe as payment processor)
 */
export async function createCustomerPortalSession(customerId: string): Promise<{ portalUrl: string }> {
  if (REVENUECAT_PROJECT_ID === "PLACEHOLDER_PROJECT_ID") {
    console.warn("[RevenueCat] Using placeholder credentials - portal will not work in production");
    return {
      portalUrl: `/portal-placeholder?customer=${customerId}`,
    };
  }

  // RevenueCat Web Billing uses Stripe as the payment processor
  // The customer can manage their subscription through RevenueCat's customer center
  // or through a Stripe-powered portal configured in RevenueCat dashboard

  // Option 1: RevenueCat Customer Center (configure in RevenueCat dashboard)
  const portalUrl = new URL(
    `${REVENUECAT_WEB_BILLING_BASE}/${REVENUECAT_ENVIRONMENT}/${REVENUECAT_PROJECT_ID}/manage`
  );
  portalUrl.searchParams.set("app_user_id", customerId);

  console.log(`[RevenueCat] Generated portal URL for ${customerId}: ${portalUrl.toString()}`);

  return {
    portalUrl: portalUrl.toString(),
  };
}

/**
 * Get public configuration for frontend
 */
export function getPublicConfig() {
  return {
    projectId: REVENUECAT_PROJECT_ID,
    publicKey: REVENUECAT_PUBLIC_KEY,
    environment: REVENUECAT_ENVIRONMENT,
    isPlaceholder: REVENUECAT_PROJECT_ID === "PLACEHOLDER_PROJECT_ID",
  };
}
