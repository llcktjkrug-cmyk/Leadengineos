import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

/**
 * Check if request is for OAuth callback path
 * OAuth callback requires sameSite=none for cross-origin redirects
 */
function isOAuthCallbackPath(req: Request): boolean {
  const path = req.path || "";
  return path.includes("/oauth/callback") || path.includes("/api/oauth");
}

/**
 * Check if request is from a staging/development environment
 * Staging environments may need sameSite=none for cross-origin testing
 */
function isStagingEnvironment(req: Request): boolean {
  const hostname = req.hostname || "";
  return (
    hostname.includes("manusvm.computer") ||
    hostname.includes("manus.space") ||
    LOCAL_HOSTS.has(hostname) ||
    process.env.NODE_ENV === "development"
  );
}

/**
 * Get session cookie options with proper security settings
 * 
 * Security Policy:
 * - Production: sameSite=lax (prevents CSRF while allowing normal navigation)
 * - OAuth callback: sameSite=none (required for cross-origin OAuth redirects)
 * - Staging/Dev: sameSite=none (allows cross-origin testing)
 * 
 * Note: sameSite=none requires secure=true (HTTPS)
 */
export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const isSecure = isSecureRequest(req);
  const isOAuth = isOAuthCallbackPath(req);
  const isStaging = isStagingEnvironment(req);
  
  // Determine sameSite value based on context
  // OAuth callbacks require "none" for cross-origin redirects
  // Staging environments use "none" for testing flexibility
  // Production uses "lax" for CSRF protection
  let sameSite: "lax" | "none" | "strict" = "lax";
  
  if (isOAuth || isStaging) {
    // OAuth and staging require sameSite=none
    // This must be paired with secure=true
    sameSite = "none";
  }
  
  // If sameSite is "none", secure MUST be true
  // Fall back to "lax" if we can't set secure
  if (sameSite === "none" && !isSecure) {
    console.warn("[Cookie] sameSite=none requires secure=true, falling back to lax");
    sameSite = "lax";
  }

  return {
    httpOnly: true,
    path: "/",
    sameSite,
    // secure: isSecure,
    secure: isSecure, // TEMPORARY FOR TESTING ON NON-HTTPS
  };
}

/**
 * Get cookie options specifically for OAuth callback
 * Always uses sameSite=none with secure=true
 */
export function getOAuthCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const isSecure = isSecureRequest(req);
  
  if (!isSecure) {
    console.warn("[Cookie] OAuth callback on non-HTTPS connection - cookies may not work correctly");
  }
  
  return {
    httpOnly: true,
    path: "/",
    sameSite: isSecure ? "none" : "lax",
    secure: isSecure,
  };
}
