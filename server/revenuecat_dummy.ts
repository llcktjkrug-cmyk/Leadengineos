import axios from "axios";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * RevenueCat REST API Integration
 */

const REVENUECAT_API_BASE = "https://api.revenuecat.com/v1";

/**
 * ENV Configuration
 */
const REVENUECAT_PUBLIC_KEY = process.env.REVENUECAT_PUBLIC_KEY || "PLACEHOLDER_PUBLIC_KEY";
const REVENUECAT_SECRET_KEY = process.env.REVENUECAT_SECRET_KEY || "PLACEHOLDER_SECRET_KEY";
const REVENUECAT_WEBHOOK_SECRET = process.env.REVENUECAT_WEBHOOK_SECRET || "PLACEHOLDER_WEBHOOK_SECRET";

/**
 * TYPES
 */
export interface CustomerInfo {
  request_date: string;
  request_date_ms: number;
  subscriber: {
    entitlements: Record<string, any>;
    first_seen: string;
    last_seen: string;
    management_url?: string;
    non_subscriptions: Record<string, any>;
    original_app_user_id: string;
    original_application_version?: string;
    original_purchase_date?: string;
    other_purchases?: Record<string, any>;
    subscriber_attributes?: Record<string, any>;
    subscriptions: Record<string, any>;
  };
}

export interface PurchaseParams {
  app_user_id: string;
  fetch_token: string;
  product_id?: string;
  price?: number;
  currency?: string;
  payment_mode?: string;
  introductory_price?: number;
  is_restore?: boolean;
  presented_offering_identifier?: string;
  attributes?: Record<string, {
    value: string;
    updated_at_ms?: number;
  }>;
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

export interface GrantEntitlementParams {
  end_time_ms?: number;
  duration?: string; // Deprecated, but kept for compatibility
  start_time_ms?: number; // Deprecated, but kept for compatibility
}

export interface DeferSubscriptionParams {
  expiry_time_ms?: number;
  extend_by_days?: number;
}

export interface ExtendSubscriptionParams {
  extend_by_days: number;
  extend_reason_code: 0 | 1 | 2 | 3;
}

export interface CustomerAttributes {
  [key: string]: {
    value: string;
    updated_at_ms?: number;
  };
}

/**
 * =========================
 * CUSTOMER MANAGEMENT
 * =========================
 */

/**
 * Get or Create a Customer
 */
export async function getOrCreateCustomer(
  appUserId: string,
  platform?: "ios" | "android" | "amazon" | "macos" | "uikitformac"
): Promise<CustomerInfo> {
  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${REVENUECAT_PUBLIC_KEY}`,
    };

    if (platform) {
      headers["X-Platform"] = platform;
    }

    const response = await axios.get(
      `${REVENUECAT_API_BASE}/subscribers/${encodeURIComponent(appUserId)}`,
      { headers, timeout: 10000 }
    );

    return response.data;
  } catch (error: any) {
    console.error("[RevenueCat][GetCustomer] Failed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to get or create customer");
  }
}

/**
 * Delete a Customer
 */
export async function deleteCustomer(appUserId: string): Promise<{ app_user_id: string; deleted: boolean }> {
  try {
    const response = await axios.delete(
      `${REVENUECAT_API_BASE}/subscribers/${encodeURIComponent(appUserId)}`,
      {
        headers: { Authorization: `Bearer ${REVENUECAT_SECRET_KEY}` },
        timeout: 10000,
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("[RevenueCat][DeleteCustomer] Failed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to delete customer");
  }
}

/**
 * Update Customer Attributes
 */
export async function updateCustomerAttributes(
  appUserId: string,
  attributes: CustomerAttributes
): Promise<CustomerInfo> {
  try {
    const response = await axios.post(
      `${REVENUECAT_API_BASE}/subscribers/${encodeURIComponent(appUserId)}/attributes`,
      { attributes },
      {
        headers: {
          Authorization: `Bearer ${REVENUECAT_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("[RevenueCat][UpdateAttributes] Failed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to update customer attributes");
  }
}

/**
 * =========================
 * PURCHASES & TRANSACTIONS
 * =========================
 */

/**
 * Create a Purchase (Record a receipt)
 */
export async function createPurchase(
  platform: "ios" | "android" | "amazon" | "macos" | "uikitformac" | "stripe" | "roku" | "paddle",
  params: PurchaseParams
): Promise<CustomerInfo> {
  try {
    const response = await axios.post(
      `${REVENUECAT_API_BASE}/receipts`,
      params,
      {
        headers: {
          Authorization: `Bearer ${REVENUECAT_SECRET_KEY}`,
          "Content-Type": "application/json",
          "X-Platform": platform,
        },
        timeout: 15000,
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("[RevenueCat][CreatePurchase] Failed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to record purchase");
  }
}

/**
 * =========================
 * GOOGLE PLAY SPECIFIC
 * =========================
 */

/**
 * Google Play: Refund and Revoke Subscription
 */
export async function revokeGoogleSubscription(
  appUserId: string,
  productIdentifier: string
): Promise<CustomerInfo> {
  try {
    const response = await axios.post(
      `${REVENUECAT_API_BASE}/subscribers/${encodeURIComponent(appUserId)}/subscriptions/${productIdentifier}/revoke`,
      {},
      {
        headers: { Authorization: `Bearer ${REVENUECAT_SECRET_KEY}` },
        timeout: 10000,
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("[RevenueCat][RevokeGoogleSub] Failed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to revoke Google subscription");
  }
}

/**
 * Google Play: Defer a Subscription
 */
export async function deferGoogleSubscription(
  appUserId: string,
  productIdentifier: string,
  params: DeferSubscriptionParams
): Promise<CustomerInfo> {
  try {
    if (!params.expiry_time_ms && !params.extend_by_days) {
      throw new Error("Either expiry_time_ms or extend_by_days must be provided");
    }

    const response = await axios.post(
      `${REVENUECAT_API_BASE}/subscribers/${encodeURIComponent(appUserId)}/subscriptions/${productIdentifier}/defer`,
      params,
      {
        headers: {
          Authorization: `Bearer ${REVENUECAT_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("[RevenueCat][DeferGoogleSub] Failed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to defer Google subscription");
  }
}

/**
 * Google Play: Refund and Revoke Purchase
 */
export async function refundGooglePurchase(
  appUserId: string,
  storeTransactionIdentifier: string
): Promise<CustomerInfo> {
  try {
    const response = await axios.post(
      `${REVENUECAT_API_BASE}/subscribers/${encodeURIComponent(appUserId)}/transactions/${storeTransactionIdentifier}/refund`,
      {},
      {
        headers: { Authorization: `Bearer ${REVENUECAT_SECRET_KEY}` },
        timeout: 10000,
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("[RevenueCat][RefundGooglePurchase] Failed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to refund Google purchase");
  }
}

/**
 * Google Play: Cancel a Subscription
 */
export async function cancelGoogleSubscription(
  appUserId: string,
  storeTransactionIdentifier: string
): Promise<CustomerInfo> {
  try {
    const response = await axios.post(
      `${REVENUECAT_API_BASE}/subscribers/${encodeURIComponent(appUserId)}/subscriptions/${storeTransactionIdentifier}/cancel`,
      {},
      {
        headers: { Authorization: `Bearer ${REVENUECAT_SECRET_KEY}` },
        timeout: 10000,
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("[RevenueCat][CancelGoogleSub] Failed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to cancel Google subscription");
  }
}

/**
 * =========================
 * APP STORE SPECIFIC
 * =========================
 */

/**
 * App Store: Extend a Subscription
 */
export async function extendAppStoreSubscription(
  appUserId: string,
  storeTransactionIdentifier: string,
  params: ExtendSubscriptionParams
): Promise<CustomerInfo> {
  try {
    const response = await axios.post(
      `${REVENUECAT_API_BASE}/subscribers/${encodeURIComponent(appUserId)}/subscriptions/${storeTransactionIdentifier}/extend`,
      params,
      {
        headers: {
          Authorization: `Bearer ${REVENUECAT_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("[RevenueCat][ExtendAppStoreSub] Failed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to extend App Store subscription");
  }
}

/**
 * =========================
 * OFFERINGS
 * =========================
 */

/**
 * Get Offerings for a Customer
 */
export async function getOfferings(
  appUserId: string,
  platform?: "ios" | "android" | "amazon" | "stripe" | "roku" | "paddle"
): Promise<any> {
  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${REVENUECAT_PUBLIC_KEY}`,
    };

    if (platform) {
      headers["X-Platform"] = platform;
    }

    const response = await axios.get(
      `${REVENUECAT_API_BASE}/subscribers/${encodeURIComponent(appUserId)}/offerings`,
      { headers, timeout: 10000 }
    );

    return response.data;
  } catch (error: any) {
    console.error("[RevenueCat][GetOfferings] Failed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to get offerings");
  }
}

/**
 * Override a Customer's Current Offering
 */
export async function overrideCustomerOffering(
  appUserId: string,
  offeringUuid: string
): Promise<CustomerInfo> {
  try {
    const response = await axios.post(
      `${REVENUECAT_API_BASE}/subscribers/${encodeURIComponent(appUserId)}/offerings/${offeringUuid}/override`,
      {},
      {
        headers: { Authorization: `Bearer ${REVENUECAT_SECRET_KEY}` },
        timeout: 10000,
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("[RevenueCat][OverrideOffering] Failed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to override offering");
  }
}

/**
 * Remove a Customer's Offering Override
 */
export async function removeCustomerOfferingOverride(
  appUserId: string
): Promise<CustomerInfo> {
  try {
    const response = await axios.delete(
      `${REVENUECAT_API_BASE}/subscribers/${encodeURIComponent(appUserId)}/offerings/override`,
      {
        headers: { Authorization: `Bearer ${REVENUECAT_SECRET_KEY}` },
        timeout: 10000,
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("[RevenueCat][RemoveOfferingOverride] Failed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to remove offering override");
  }
}

/**
 * =========================
 * ENTITLEMENTS
 * =========================
 */

/**
 * Grant an Entitlement
 */
export async function grantEntitlement(
  appUserId: string,
  entitlementIdentifier: string,
  params: GrantEntitlementParams
): Promise<CustomerInfo> {
  try {
    const response = await axios.post(
      `${REVENUECAT_API_BASE}/subscribers/${encodeURIComponent(appUserId)}/entitlements/${entitlementIdentifier}/promotional`,
      params,
      {
        headers: {
          Authorization: `Bearer ${REVENUECAT_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("[RevenueCat][GrantEntitlement] Failed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to grant entitlement");
  }
}

/**
 * Revoke Granted Entitlements
 */
export async function revokeEntitlements(
  appUserId: string,
  entitlementIdentifier: string
): Promise<CustomerInfo> {
  try {
    const response = await axios.post(
      `${REVENUECAT_API_BASE}/subscribers/${encodeURIComponent(appUserId)}/entitlements/${entitlementIdentifier}/revoke_promotionals`,
      {},
      {
        headers: { Authorization: `Bearer ${REVENUECAT_SECRET_KEY}` },
        timeout: 10000,
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("[RevenueCat][RevokeEntitlements] Failed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to revoke entitlements");
  }
}

/**
 * =========================
 * DEPRECATED ENDPOINTS (Kept for compatibility)
 * =========================
 */

/**
 * Add Customer Attribution Data (Deprecated)
 */
export async function addCustomerAttribution(
  appUserId: string,
  data: Record<string, any>,
  network: "0" | "1" | "2" | "3" | "4" | "5"
): Promise<void> {
  console.warn("[RevenueCat] Attribution endpoint is deprecated");
  
  try {
    await axios.post(
      `${REVENUECAT_API_BASE}/subscribers/${encodeURIComponent(appUserId)}/attribution`,
      { data, network },
      {
        headers: {
          Authorization: `Bearer ${REVENUECAT_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );
  } catch (error: any) {
    console.error("[RevenueCat][Attribution] Failed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to add attribution data");
  }
}

/**
 * =========================
 * WEBHOOK VERIFICATION
 * =========================
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): { valid: boolean; error?: string } {
  try {
    if (!REVENUECAT_WEBHOOK_SECRET || !signature) {
      return { valid: false, error: "SIGNATURE_MISSING" };
    }

    const expected = createHmac("sha256", REVENUECAT_WEBHOOK_SECRET)
      .update(payload)
      .digest("hex");

    const valid = timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature)
    );

    return valid ? { valid: true } : { valid: false, error: "INVALID_SIGNATURE" };
  } catch (error) {
    console.error("[RevenueCat][Webhook] Verification failed", error);
    return { valid: false, error: "INVALID_SIGNATURE" };
  }
}

/**
 * =========================
 * WEBHOOK PARSING
 * =========================
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
    entitlements: payload.entitlements ?? {},
  };
}

/**
 * =========================
 * SUBSCRIPTION STATUS LOGIC
 * =========================
 */
export function mapEventToStatus(
  eventType: string
): "active" | "past_due" | "canceled" | "expired" | "trialing" {
  switch (eventType) {
    case "INITIAL_PURCHASE":
    case "RENEWAL":
    case "UNCANCELLATION":
      return "active";
    case "BILLING_ISSUE":
      return "past_due";
    case "CANCELLATION":
      return "canceled";
    case "EXPIRATION":
      return "expired";
    case "TRIAL_STARTED":
      return "trialing";
    case "TRIAL_CONVERTED":
      return "active";
    case "TRIAL_CANCELLED":
      return "canceled";
    default:
      return "active";
  }
}

/**
 * =========================
 * PLAN MAPPING
 * =========================
 */
export function getPlanFromProductId(
  productId: string
): "starter" | "pro" | "scale" {
  if (productId.includes("starter")) return "starter";
  if (productId.includes("pro")) return "pro";
  if (productId.includes("scale")) return "scale";
  return "starter";
}

/**
 * Get Customer's Management URL
 * Helper function to extract management URL from customer info
 */
export function getCustomerManagementUrl(customerInfo: CustomerInfo): string | undefined {
  return customerInfo.subscriber.management_url;
}

/**
 * =========================
 * CONFIG CHECK
 * =========================
 */
export function isRevenueCatConfigured(): boolean {
  const configured =
    !!REVENUECAT_PUBLIC_KEY &&
    !!REVENUECAT_SECRET_KEY &&
    !!REVENUECAT_WEBHOOK_SECRET &&
    !REVENUECAT_SECRET_KEY.startsWith("PLACEHOLDER");

  return configured;
}

/**
 * =========================
 * PUBLIC CONFIG
 * =========================
 */
export function getPublicConfig() {
  return {
    publicKey: REVENUECAT_PUBLIC_KEY,
    isPlaceholder: REVENUECAT_PUBLIC_KEY === "PLACEHOLDER_PUBLIC_KEY",
    isConfigured: isRevenueCatConfigured(),
  };
}