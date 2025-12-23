/**
 * Analytics tracking helper for Manus integrated analytics
 * Tracks conversion funnel, subscription metrics, and fulfillment throughput
 */

import { ENV } from "./_core/env";

export type AnalyticsEvent =
  | "page_view"
  | "cta_click"
  | "checkout_start"
  | "checkout_complete"
  | "subscription_active"
  | "subscription_past_due"
  | "subscription_canceled"
  | "login"
  | "request_created"
  | "job_completed"
  | "lead_submitted";

interface TrackEventParams {
  event: AnalyticsEvent;
  url?: string;
  referrer?: string;
  metadata?: Record<string, any>;
}

/**
 * Check if we're in staging environment
 */
function isStaging(): boolean {
  // Check various indicators of staging environment
  const hostname = process.env.HOSTNAME || "";
  const nodeEnv = process.env.NODE_ENV || "";
  const appUrl = process.env.VITE_APP_URL || "";
  
  return (
    nodeEnv === "development" ||
    hostname.includes("staging") ||
    hostname.includes("manusvm") ||
    appUrl.includes("staging") ||
    appUrl.includes("manusvm")
  );
}

/**
 * Track analytics event using Manus integrated analytics
 * Events are automatically aggregated in the Manus analytics dashboard
 * 
 * NOTE: In staging environments, events are logged but not sent to prevent
 * polluting production metrics.
 */
export async function trackEvent(params: TrackEventParams): Promise<boolean> {
  try {
    // Skip sending analytics in staging to prevent polluting production metrics
    if (isStaging()) {
      console.log(`[Analytics] STAGING - Event logged but not sent: ${params.event}`, params.metadata || {});
      return true; // Return true to not break calling code
    }

    const endpoint = ENV.analyticsEndpoint;
    const websiteId = ENV.analyticsWebsiteId;

    if (!endpoint || !websiteId) {
      console.warn("[Analytics] Analytics endpoint or website ID not configured");
      return false;
    }

    const payload = {
      website_id: websiteId,
      event_name: params.event,
      url: params.url || "",
      referrer: params.referrer || "",
      metadata: params.metadata || {},
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(`${endpoint}/api/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.warn(`[Analytics] Failed to track event: ${response.status}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Analytics] Error tracking event:", error);
    return false;
  }
}

/**
 * Track page view
 */
export async function trackPageView(url: string, referrer?: string): Promise<boolean> {
  return trackEvent({
    event: "page_view",
    url,
    referrer,
  });
}

/**
 * Track CTA click
 */
export async function trackCTAClick(ctaLabel: string, url: string): Promise<boolean> {
  return trackEvent({
    event: "cta_click",
    url,
    metadata: { cta_label: ctaLabel },
  });
}

/**
 * Track checkout start
 */
export async function trackCheckoutStart(plan: string, url: string): Promise<boolean> {
  return trackEvent({
    event: "checkout_start",
    url,
    metadata: { plan },
  });
}

/**
 * Track checkout complete
 */
export async function trackCheckoutComplete(plan: string, amount: number): Promise<boolean> {
  return trackEvent({
    event: "checkout_complete",
    metadata: { plan, amount },
  });
}

/**
 * Track subscription status change
 */
export async function trackSubscriptionEvent(
  event: "subscription_active" | "subscription_past_due" | "subscription_canceled",
  tenantId: number,
  plan: string
): Promise<boolean> {
  return trackEvent({
    event,
    metadata: { tenant_id: tenantId, plan },
  });
}

/**
 * Track deliverable request creation
 */
export async function trackRequestCreated(tenantId: number, deliverableType: string): Promise<boolean> {
  return trackEvent({
    event: "request_created",
    metadata: { tenant_id: tenantId, deliverable_type: deliverableType },
  });
}

/**
 * Track job completion
 */
export async function trackJobCompleted(tenantId: number, jobType: string, durationMs: number): Promise<boolean> {
  return trackEvent({
    event: "job_completed",
    metadata: { tenant_id: tenantId, job_type: jobType, duration_ms: durationMs },
  });
}

/**
 * Track lead submission
 */
export async function trackLeadSubmitted(source: string, email: string): Promise<boolean> {
  return trackEvent({
    event: "lead_submitted",
    metadata: { source, email },
  });
}
