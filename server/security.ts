import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { Express, Request, Response, NextFunction } from "express";

// ============================================================================
// CORS CONFIGURATION (P0-002 FIX)
// ============================================================================

const PRODUCTION_ORIGINS = [
  "https://leadengineos.com",
  "https://www.leadengineos.com",
  "https://app.leadengineos.com",
  "https://leadengineosapp.com",
];

const STAGING_ORIGINS = [
  // Manus staging domains
  /^https:\/\/[a-z0-9-]+\.manusvm\.computer$/,
  /^https:\/\/[a-z0-9-]+\.manus\.space$/,
];

const DEV_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
];

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return false;
  
  // Check production origins
  if (PRODUCTION_ORIGINS.includes(origin)) return true;
  
  // Check staging origins (regex patterns)
  for (const pattern of STAGING_ORIGINS) {
    if (pattern.test(origin)) return true;
  }
  
  // Check dev origins only in development
  if (process.env.NODE_ENV === "development") {
    if (DEV_ORIGINS.includes(origin)) return true;
  }
  
  return false;
}

export const corsOptions: cors.CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-API-Key", "X-Admin-API-Key", "X-Requested-With"],
  maxAge: 86400, // 24 hours
};

// ============================================================================
// RATE LIMITING (P0-001 FIX)
// ============================================================================

// General API rate limit: 100 requests per 15 minutes
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: "Too many requests, please try again later", code: "RATE_LIMIT_EXCEEDED" },
  standardHeaders: true,
  legacyHeaders: false,
  // Use default keyGenerator which handles IPv6 properly
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === "/api/health" || req.path.includes("system.healthCheck");
  },
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many requests, please try again later",
      code: "RATE_LIMIT_EXCEEDED",
      retryAfter: res.getHeader("Retry-After"),
    });
  },
});

// Strict rate limit for auth endpoints: 10 attempts per hour
export const authRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: { error: "Too many authentication attempts, please try again later", code: "AUTH_RATE_LIMIT_EXCEEDED" },
  standardHeaders: true,
  legacyHeaders: false,
  // Use default keyGenerator which handles IPv6 properly
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many authentication attempts, please try again later",
      code: "AUTH_RATE_LIMIT_EXCEEDED",
      retryAfter: res.getHeader("Retry-After"),
    });
  },
});

// Webhook rate limit: 60 requests per minute (for n8n/RevenueCat)
export const webhookRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: { error: "Webhook rate limit exceeded", code: "WEBHOOK_RATE_LIMIT_EXCEEDED" },
  standardHeaders: true,
  legacyHeaders: false,
  // Use default keyGenerator which handles IPv6 properly
  handler: (req, res) => {
    res.status(429).json({
      error: "Webhook rate limit exceeded",
      code: "WEBHOOK_RATE_LIMIT_EXCEEDED",
      retryAfter: res.getHeader("Retry-After"),
    });
  },
});

// Admin API rate limit: 60 requests per minute
export const adminApiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: { error: "Admin API rate limit exceeded", code: "ADMIN_RATE_LIMIT_EXCEEDED" },
  standardHeaders: true,
  legacyHeaders: false,
  // Use default keyGenerator which handles IPv6 properly
  handler: (req, res) => {
    res.status(429).json({
      error: "Admin API rate limit exceeded",
      code: "ADMIN_RATE_LIMIT_EXCEEDED",
      retryAfter: res.getHeader("Retry-After"),
    });
  },
});

// ============================================================================
// SECURITY HEADERS - HELMET (FINAL FIX)
// ============================================================================

export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://js.stripe.com",
        "https://js.revenuecat.com",
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com",
        "https://*.google-analytics.com",
        "https://*.analytics.google.com",
        "https://tagassistant.google.com",
        "https://analytics.manus.im",
        "https://googleads.g.doubleclick.net", // <--- ADDED
        "https://www.googleadservices.com",      // <--- ADDED (Often needed with Ads)
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://tagassistant.google.com",
      ],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "blob:",
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com",
        "https://googleads.g.doubleclick.net", // <--- ADDED
        "https://www.google.com",
        "https://www.googleadservices.com",      // <--- ADDED
      ],
      connectSrc: [
        "'self'",
        "https://api.stripe.com",
        "https://api.revenuecat.com",
        process.env.N8N_INSTANCE_URL || "",
        process.env.OAUTH_SERVER_URL || "",
        "https://*.manusvm.computer",
        "https://*.manus.space",
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com",
        "https://*.google-analytics.com",
        "https://*.analytics.google.com",
        "https://tagassistant.google.com",
        "https://analytics.manus.im",
        "https://www.google.com",
        "https://googleads.g.doubleclick.net", // <--- ADDED
        "https://www.googleadservices.com",      // <--- ADDED
      ].filter(Boolean),
      frameSrc: [
        "'self'",
        "https://js.stripe.com",
        "https://www.googletagmanager.com",
        "https://tagassistant.google.com",
        "https://googleads.g.doubleclick.net", // <--- ADDED
      ],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: process.env.NODE_ENV === "production" ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  } : false,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xContentTypeOptions: true,
  xFrameOptions: { action: "deny" },
  xXssProtection: true,
});
// ============================================================================
// REQUEST SANITIZATION
// ============================================================================

export function sanitizeRequest(req: Request, res: Response, next: NextFunction) {
  // Remove any potential XSS from query params
  if (req.query) {
    for (const key of Object.keys(req.query)) {
      const value = req.query[key];
      if (typeof value === "string") {
        req.query[key] = sanitizeString(value);
      }
    }
  }
  next();
}

function sanitizeString(str: string): string {
  return str
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// ============================================================================
// ADMIN API KEY VALIDATION
// ============================================================================

export function validateAdminApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers["x-admin-api-key"] as string;
  const expectedKey = process.env.ADMIN_API_KEY;

  if (!expectedKey) {
    console.error("[Security] ADMIN_API_KEY not configured");
    return res.status(500).json({ error: "Admin API not configured" });
  }

  if (!apiKey) {
    return res.status(401).json({ error: "Missing admin API key" });
  }

  if (apiKey !== expectedKey) {
    console.warn(`[Security] Invalid admin API key attempt from ${req.ip}`);
    return res.status(403).json({ error: "Invalid admin API key" });
  }

  next();
}

// ============================================================================
// SECURITY LOGGING
// ============================================================================

function securityLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on("finish", () => {
    // Log security-relevant events
    if (res.statusCode >= 400) {
      const logEntry = {
        type: "security_event",
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        status: res.statusCode,
        ip: (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip,
        userAgent: req.headers["user-agent"]?.substring(0, 100),
        duration: Date.now() - start,
      };
      
      // Log 4xx/5xx responses
      if (res.statusCode === 401 || res.statusCode === 403 || res.statusCode === 429) {
        console.warn(JSON.stringify(logEntry));
      } else if (res.statusCode >= 500) {
        console.error(JSON.stringify(logEntry));
      }
    }
  });
  
  next();
}

// ============================================================================
// APPLY ALL SECURITY MIDDLEWARE
// ============================================================================

export function applySecurityMiddleware(app: Express) {
  // Trust proxy for rate limiting behind reverse proxy (DigitalOcean, Nginx)
  app.set("trust proxy", 1);

  // Security headers (Helmet)
  app.use(helmetConfig);

  // CORS
  app.use(cors(corsOptions));

  // Request sanitization
  app.use(sanitizeRequest);

  // Security logging (production only)
  if (process.env.NODE_ENV === "production") {
    app.use(securityLogger);
  }

  // Rate limiting for different route types
  app.use("/api/oauth", authRateLimiter);
  app.use("/api/trpc/billing.webhook", webhookRateLimiter);
  app.use("/api/admin", adminApiRateLimiter);
  app.use("/api/trpc", apiRateLimiter);
  
  console.log("[Security] Middleware applied: Helmet, CORS, Rate Limiting, Sanitization");
}
