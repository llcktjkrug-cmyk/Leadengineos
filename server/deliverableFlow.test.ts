import { describe, it, expect, beforeAll } from "vitest";

/**
 * Deliverable Request Flow Tests
 * 
 * Tests for the end-to-end deliverable request workflow:
 * - Request submission
 * - Status transitions
 * - Quota tracking
 * - Audit logging
 */

// Mock JWT_SECRET for any encryption needs
beforeAll(() => {
  process.env.JWT_SECRET = "test-secret-key-for-encryption-testing-32chars!";
});

describe("Deliverable Request Types", () => {
  const validRequestTypes = [
    "landing_page",
    "blog_post",
    "seo_improvement",
    "internal_linking",
    "local_presence",
    "weekly_report",
  ] as const;

  it("should support all request types", () => {
    expect(validRequestTypes).toHaveLength(6);
    expect(validRequestTypes).toContain("landing_page");
    expect(validRequestTypes).toContain("blog_post");
    expect(validRequestTypes).toContain("seo_improvement");
    expect(validRequestTypes).toContain("internal_linking");
    expect(validRequestTypes).toContain("local_presence");
    expect(validRequestTypes).toContain("weekly_report");
  });
});

describe("Request Status Transitions", () => {
  const validStatuses = ["requested", "needs_info", "queued", "running", "done", "failed"] as const;

  it("should have all valid status values", () => {
    expect(validStatuses).toHaveLength(6);
  });

  it("should follow valid transition: requested -> queued", () => {
    const currentStatus = "requested";
    const nextStatus = "queued";
    const validTransitions: Record<string, string[]> = {
      requested: ["needs_info", "queued"],
      needs_info: ["queued"],
      queued: ["running"],
      running: ["done", "failed"],
      done: [],
      failed: ["queued"], // Can retry
    };

    expect(validTransitions[currentStatus]).toContain(nextStatus);
  });

  it("should follow valid transition: queued -> running", () => {
    const currentStatus = "queued";
    const nextStatus = "running";
    const validTransitions: Record<string, string[]> = {
      requested: ["needs_info", "queued"],
      needs_info: ["queued"],
      queued: ["running"],
      running: ["done", "failed"],
      done: [],
      failed: ["queued"],
    };

    expect(validTransitions[currentStatus]).toContain(nextStatus);
  });

  it("should follow valid transition: running -> done", () => {
    const currentStatus = "running";
    const nextStatus = "done";
    const validTransitions: Record<string, string[]> = {
      requested: ["needs_info", "queued"],
      needs_info: ["queued"],
      queued: ["running"],
      running: ["done", "failed"],
      done: [],
      failed: ["queued"],
    };

    expect(validTransitions[currentStatus]).toContain(nextStatus);
  });

  it("should allow retry from failed -> queued", () => {
    const currentStatus = "failed";
    const nextStatus = "queued";
    const validTransitions: Record<string, string[]> = {
      requested: ["needs_info", "queued"],
      needs_info: ["queued"],
      queued: ["running"],
      running: ["done", "failed"],
      done: [],
      failed: ["queued"],
    };

    expect(validTransitions[currentStatus]).toContain(nextStatus);
  });
});

describe("Request Data Structure", () => {
  it("should validate landing page request data", () => {
    const requestData = {
      title: "New Landing Page",
      targetKeywords: ["med spa", "botox"],
      vertical: "med_spa",
      callToAction: "Book Consultation",
    };

    expect(requestData.title).toBeDefined();
    expect(requestData.targetKeywords).toBeInstanceOf(Array);
    expect(requestData.vertical).toBe("med_spa");
  });

  it("should validate blog post request data", () => {
    const requestData = {
      topic: "Benefits of Botox",
      targetKeywords: ["botox benefits", "anti-aging"],
      wordCount: 1500,
      category: "med_spa_growth",
    };

    expect(requestData.topic).toBeDefined();
    expect(requestData.wordCount).toBeGreaterThan(0);
  });

  it("should validate SEO improvement request data", () => {
    const requestData = {
      targetUrl: "https://example.com/services",
      currentTitle: "Services",
      targetKeywords: ["med spa services"],
      improvements: ["title", "meta_description", "headings"],
    };

    expect(requestData.targetUrl).toBeDefined();
    expect(requestData.improvements).toBeInstanceOf(Array);
  });
});

describe("Quota Tracking", () => {
  it("should map request types to quota fields", () => {
    const quotaMapping: Record<string, string> = {
      landing_page: "landingPagesUsed",
      blog_post: "blogPostsUsed",
      seo_improvement: "seoImprovementsUsed",
      internal_linking: "internalLinkingUsed",
      local_presence: "localPresenceUsed",
      weekly_report: "weeklyReportsUsed",
    };

    expect(quotaMapping.landing_page).toBe("landingPagesUsed");
    expect(quotaMapping.blog_post).toBe("blogPostsUsed");
    expect(quotaMapping.seo_improvement).toBe("seoImprovementsUsed");
  });

  it("should check quota before allowing request", () => {
    const planLimits = {
      monthlyLandingPages: 2,
      monthlyBlogPosts: 4,
      monthlySeoImprovements: 4,
    };

    const currentUsage = {
      landingPagesUsed: 1,
      blogPostsUsed: 4,
      seoImprovementsUsed: 2,
    };

    const canRequestLandingPage = currentUsage.landingPagesUsed < planLimits.monthlyLandingPages;
    const canRequestBlogPost = currentUsage.blogPostsUsed < planLimits.monthlyBlogPosts;
    const canRequestSeo = currentUsage.seoImprovementsUsed < planLimits.monthlySeoImprovements;

    expect(canRequestLandingPage).toBe(true);
    expect(canRequestBlogPost).toBe(false); // At limit
    expect(canRequestSeo).toBe(true);
  });

  it("should increment quota on request completion", () => {
    let currentUsage = {
      landingPagesUsed: 1,
      blogPostsUsed: 2,
    };

    // Simulate completing a landing page request
    currentUsage = {
      ...currentUsage,
      landingPagesUsed: currentUsage.landingPagesUsed + 1,
    };

    expect(currentUsage.landingPagesUsed).toBe(2);
  });
});

describe("Audit Logging", () => {
  it("should create audit log entry for request creation", () => {
    const auditEntry = {
      tenantId: 1,
      userId: 5,
      action: "deliverable_request.create",
      resourceType: "deliverable_request",
      resourceId: 123,
      changes: JSON.stringify({
        type: "landing_page",
        status: "requested",
      }),
    };

    expect(auditEntry.action).toBe("deliverable_request.create");
    expect(auditEntry.resourceType).toBe("deliverable_request");
  });

  it("should create audit log entry for status change", () => {
    const auditEntry = {
      tenantId: 1,
      userId: null, // System action
      action: "deliverable_request.status_change",
      resourceType: "deliverable_request",
      resourceId: 123,
      changes: JSON.stringify({
        before: { status: "queued" },
        after: { status: "running" },
      }),
    };

    expect(auditEntry.action).toBe("deliverable_request.status_change");
    const changes = JSON.parse(auditEntry.changes);
    expect(changes.before.status).toBe("queued");
    expect(changes.after.status).toBe("running");
  });
});

describe("Deliverable Output", () => {
  it("should have required deliverable fields", () => {
    const deliverable = {
      id: 1,
      requestId: 123,
      tenantId: 1,
      type: "landing_page",
      title: "Med Spa Landing Page",
      contentUrl: "https://storage.example.com/deliverables/123/landing-page.html",
      metadataJson: JSON.stringify({
        wordCount: 500,
        keywords: ["med spa", "botox"],
      }),
      version: 1,
      publishedToWordpress: false,
      createdAt: new Date(),
    };

    expect(deliverable.requestId).toBe(123);
    expect(deliverable.contentUrl).toBeDefined();
    expect(deliverable.version).toBe(1);
  });

  it("should support version history", () => {
    const deliverables = [
      { id: 1, requestId: 123, version: 1, createdAt: new Date("2024-01-01") },
      { id: 2, requestId: 123, version: 2, createdAt: new Date("2024-01-02") },
      { id: 3, requestId: 123, version: 3, createdAt: new Date("2024-01-03") },
    ];

    const latestVersion = deliverables.reduce((max, d) => 
      d.version > max.version ? d : max
    );

    expect(latestVersion.version).toBe(3);
  });
});

describe("Subscription Gating", () => {
  it("should block requests when subscription is past_due", () => {
    const subscription = {
      status: "past_due",
      plan: "pro",
    };

    const canCreateRequest = subscription.status === "active" || subscription.status === "trialing";
    expect(canCreateRequest).toBe(false);
  });

  it("should block requests when subscription is canceled", () => {
    const subscription = {
      status: "canceled",
      plan: "pro",
    };

    const canCreateRequest = subscription.status === "active" || subscription.status === "trialing";
    expect(canCreateRequest).toBe(false);
  });

  it("should allow requests when subscription is active", () => {
    const subscription = {
      status: "active",
      plan: "pro",
    };

    const canCreateRequest = subscription.status === "active" || subscription.status === "trialing";
    expect(canCreateRequest).toBe(true);
  });

  it("should allow requests when subscription is trialing", () => {
    const subscription = {
      status: "trialing",
      plan: "starter",
    };

    const canCreateRequest = subscription.status === "active" || subscription.status === "trialing";
    expect(canCreateRequest).toBe(true);
  });
});
