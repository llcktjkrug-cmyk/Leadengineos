# Lead Engine OS - Security Audit Report

**Audit Date:** December 15, 2025  
**Auditor:** Automated Security Analysis  
**Codebase Version:** 820a5c29  
**Scope:** Full application stack (client, server, database)

---

## 1. Executive Risk Summary

| Severity | Count | Status |
|----------|-------|--------|
| **P0 (Critical)** | 2 | 🔴 REQUIRES FIX |
| **P1 (High)** | 3 | 🟠 SHOULD FIX |
| **P2 (Medium)** | 4 | 🟡 RECOMMENDED |

**Overall Status:** ❌ **NO-GO** — 2 P0 blockers must be resolved before production deployment.

---

## 2. Findings Table

### P0 - Critical (Must Fix Before Production)

| ID | Component | Location | Exploit Scenario | Impact | Fix |
|----|-----------|----------|------------------|--------|-----|
| P0-001 | rate-limit | `server/_core/index.ts` (no rate limiting applied) | Attacker sends unlimited requests to `/api/trpc/*` endpoints, causing DoS or brute-forcing API keys | Service unavailable, credential enumeration | Install `express-rate-limit`, apply to all `/api/*` routes with 100 req/15min for general, 10 req/hour for auth |
| P0-002 | cors | `server/_core/index.ts` (no CORS configured) | Malicious site makes cross-origin requests to API while user is authenticated, stealing session data | Session hijacking, data exfiltration | Install `cors`, configure allowlist: production domain, localhost for dev only |

### P1 - High (Should Fix)

| ID | Component | Location | Exploit Scenario | Impact | Fix |
|----|-----------|----------|------------------|--------|-----|
| P1-001 | secrets | `server/revenuecat.ts:112-114` | Webhook signature verification bypassed when using placeholder secret | Fake webhook events could manipulate subscription status | Remove placeholder bypass; require real secret or disable webhook endpoint entirely |
| P1-002 | api | `server/_core/index.ts` (no security headers) | Missing X-Frame-Options, CSP, HSTS headers | Clickjacking, XSS via injected scripts, protocol downgrade | Install `helmet`, configure CSP for Stripe/RevenueCat domains |
| P1-003 | auth | `server/_core/cookies.ts:45` | `sameSite: "none"` allows cross-site cookie sending | CSRF attacks possible if combined with missing CORS | Change to `sameSite: "lax"` for production, keep "none" only for OAuth callback flow |

### P2 - Medium (Recommended)

| ID | Component | Location | Exploit Scenario | Impact | Fix |
|----|-----------|----------|------------------|--------|-----|
| P2-001 | secrets | `server/encryption.ts:13` | Static salt for PBKDF2 key derivation | If JWT_SECRET is compromised, all historical encrypted data is vulnerable | Use per-record random salt stored with ciphertext |
| P2-002 | db | `server/db.ts:339,346,357,371,378,417` | Drizzle `sql` template usage | While Drizzle escapes properly, pattern could be misused | Document safe usage, add eslint rule to flag raw sql usage |
| P2-003 | frontend | `client/src/const.ts:5-6` | VITE_* env vars exposed to client bundle | Non-sensitive but could leak internal URLs | Audit all VITE_* vars, ensure no secrets have VITE_ prefix |
| P2-004 | api | `server/routers.ts:304` | `getByRequest` doesn't verify tenant ownership of requestId | User could enumerate other tenants' deliverable IDs | Add tenant verification: `AND deliverableRequests.tenantId = ctx.tenantId` |

---

## 3. Confirmed Controls Checklist

### Session Cookie Settings

| Setting | Value | Evidence | Status |
|---------|-------|----------|--------|
| httpOnly | `true` | `server/_core/cookies.ts:43` | ✅ PASS |
| secure | Dynamic (true if HTTPS) | `server/_core/cookies.ts:46` | ✅ PASS |
| sameSite | `"none"` | `server/_core/cookies.ts:45` | ⚠️ WEAK (P1-003) |
| path | `"/"` | `server/_core/cookies.ts:44` | ✅ PASS |

### CSRF Strategy

| Control | Status | Evidence |
|---------|--------|----------|
| CSRF tokens | Not implemented | N/A |
| Justification | tRPC uses POST for mutations, combined with proper CORS and sameSite cookies provides protection | Requires CORS fix (P0-002) |

**Note:** CSRF protection relies on CORS + sameSite cookies. Current configuration is vulnerable until P0-002 and P1-003 are fixed.

### RBAC Enforcement Points

| Procedure | Protection Level | Location | Status |
|-----------|-----------------|----------|--------|
| `protectedProcedure` | Requires authenticated user | `server/routers.ts:36-46` | ✅ PASS |
| `adminProcedure` | Requires `role === "admin"` | `server/routers.ts:49-54` | ✅ PASS |
| `tenantProcedure` | Requires `user.tenantId` | `server/routers.ts:57-67` | ✅ PASS |
| `apiKeyProcedure` | Validates tenant API key | `server/routers.ts:70-91` | ✅ PASS |

**Evidence:** All sensitive routes use appropriate procedure wrappers. Admin routes (`tenants.list`, `tenants.create`, `users.listAll`, `subscriptions.listAll`) use `adminProcedure`. Tenant-scoped routes use `tenantProcedure`.

### Tenant Isolation Enforcement Points

| Query Function | Tenant Filter | Location | Status |
|----------------|---------------|----------|--------|
| `getDeliverableRequestsByTenant` | `eq(deliverableRequests.tenantId, tenantId)` | `server/db.ts` | ✅ PASS |
| `getDeliverablesByTenant` | `eq(deliverables.tenantId, tenantId)` | `server/db.ts` | ✅ PASS |
| `getWebsiteConnectionsByTenant` | `eq(websiteConnections.tenantId, tenantId)` | `server/db.ts` | ✅ PASS |
| `getLandingPagesByTenant` | `eq(landingPages.tenantId, tenantId)` | `server/db.ts` | ✅ PASS |
| `getBlogPostsByTenant` | `eq(blogPosts.tenantId, tenantId)` | `server/db.ts` | ✅ PASS |
| `getLeadsByTenant` | `eq(leads.tenantId, tenantId)` | `server/db.ts` | ✅ PASS |
| `getWorkflowRunsByTenant` | `eq(workflowRuns.tenantId, tenantId)` | `server/db.ts` | ✅ PASS |

**Evidence:** All tenant-scoped queries require `tenantId` parameter and filter using Drizzle's `eq()` function.

### Input Validation

| Layer | Method | Location | Status |
|-------|--------|----------|--------|
| API Input | Zod schemas via tRPC `.input()` | `server/routers.ts` (15+ instances) | ✅ PASS |
| Type Coercion | TypeScript + Zod | All procedures | ✅ PASS |
| SQL Parameters | Drizzle ORM parameterized queries | `server/db.ts` | ✅ PASS |

**Evidence:** All tRPC procedures with user input use Zod validation. Example: `z.object({ id: z.number() })`, `z.object({ slug: z.string() })`.

### Output Encoding / XSS Controls

| Control | Status | Evidence |
|---------|--------|----------|
| React auto-escaping | ✅ Enabled | Default React behavior |
| dangerouslySetInnerHTML | Not used | Grep search returned 0 results |
| Content-Type headers | JSON for API | tRPC default |
| CSP header | ❌ Missing | Requires P1-002 fix |

### CORS Allowlist Configuration

| Status | Evidence |
|--------|----------|
| ❌ NOT CONFIGURED | Grep for "cors" in server files returned 0 results |

**Required Configuration (after fix):**
```javascript
const allowedOrigins = [
  "https://leadengineos.com",
  "https://app.leadengineos.com",
  process.env.NODE_ENV === "development" ? "http://localhost:3000" : null,
].filter(Boolean);
```

### Rate Limiting Scope and Thresholds

| Status | Evidence |
|--------|----------|
| ❌ NOT IMPLEMENTED | Grep for "rate" in server files returned only test mocks |

**Required Configuration (after fix):**

| Route | Window | Max Requests |
|-------|--------|--------------|
| `/api/trpc/*` | 15 minutes | 100 |
| `/api/oauth/*` | 1 hour | 10 |
| `/api/admin/*` | 1 minute | 60 |

### Secrets Handling

| Check | Status | Evidence |
|-------|--------|----------|
| No secrets in client bundle | ✅ PASS | Only `VITE_APP_ID`, `VITE_OAUTH_PORTAL_URL` exposed (non-sensitive) |
| No secrets in logs | ✅ PASS | `sanitizeErrorMessage()` in `server/encryption.ts:109-121` |
| JWT_SECRET server-only | ✅ PASS | Only accessed via `ENV.cookieSecret` in server code |
| DATABASE_URL server-only | ✅ PASS | Only accessed in `server/db.ts` |
| API keys server-only | ✅ PASS | `BUILT_IN_FORGE_API_KEY`, `REVENUECAT_API_KEY` not prefixed with VITE_ |

### Credential Encryption at Rest

| Setting | Value | Evidence |
|---------|-------|----------|
| Algorithm | AES-256-GCM | `server/encryption.ts:10` |
| Key Derivation | PBKDF2 with 100,000 iterations | `server/encryption.ts:24` |
| Key Source | `JWT_SECRET` environment variable | `server/encryption.ts:19` |
| IV | Random 16 bytes per encryption | `server/encryption.ts:33` |
| Auth Tag | 16 bytes (GCM default) | `server/encryption.ts:12` |
| Salt | Static string (⚠️ P2-001) | `server/encryption.ts:13` |

**Status:** ✅ PASS with P2-001 recommendation for per-record salt.

---

## 4. Retest Results

| Test Suite | Tests | Status | Duration |
|------------|-------|--------|----------|
| security.test.ts | 21 | ✅ PASS | 0.2s |
| encryption.test.ts | 18 | ✅ PASS | 1.2s |
| wordpressRollback.test.ts | 12 | ✅ PASS | 0.1s |
| deliverableFlow.test.ts | 20 | ✅ PASS | 0.2s |
| n8nWorkflowSafety.test.ts | 22 | ✅ PASS | 0.1s |
| auth.logout.test.ts | 1 | ✅ PASS | 0.1s |

**Total: 94 tests passing**

### Test Coverage for Security Controls

| Control | Test Evidence |
|---------|---------------|
| Tenant isolation | `security.test.ts` - 8 tests verify query isolation |
| RBAC enforcement | `security.test.ts` - 6 tests verify procedure protection |
| API key auth | `security.test.ts` - 4 tests verify key validation |
| Credential encryption | `encryption.test.ts` - 18 tests verify encrypt/decrypt |
| Rollback security | `wordpressRollback.test.ts` - 12 tests verify history |
| Workflow safety | `n8nWorkflowSafety.test.ts` - 22 tests verify DRY_RUN |

---

## 5. GO/NO-GO Decision

### ❌ NO-GO for Production

**Blockers (must fix):**

1. **P0-001: No rate limiting** — Application is vulnerable to DoS and brute-force attacks
2. **P0-002: No CORS configuration** — Application is vulnerable to cross-origin attacks

**High Priority (should fix before launch):**

3. **P1-001: Webhook bypass** — RevenueCat webhooks can be spoofed
4. **P1-002: No security headers** — Missing Helmet/CSP protection
5. **P1-003: Weak sameSite cookie** — CSRF vulnerability

### Required Actions Before Production

```bash
# 1. Install security packages
pnpm add helmet cors express-rate-limit

# 2. Create security middleware (server/security.ts)
# 3. Apply middleware in server/_core/index.ts
# 4. Update cookie sameSite to "lax" for production
# 5. Remove webhook placeholder bypass
# 6. Run full test suite
# 7. Re-audit and confirm GO status
```

### Post-Fix Verification Checklist

- [ ] Rate limiting returns 429 after threshold
- [ ] CORS blocks requests from unauthorized origins
- [ ] Security headers present in all responses
- [ ] Webhook rejects invalid signatures
- [ ] All 94 tests still passing

---

## Appendix: File References

| File | Security Relevance |
|------|-------------------|
| `server/_core/index.ts` | Main Express app, security middleware entry point |
| `server/_core/cookies.ts` | Session cookie configuration |
| `server/_core/context.ts` | Authentication context creation |
| `server/_core/sdk.ts` | JWT signing/verification |
| `server/routers.ts` | RBAC procedure definitions |
| `server/db.ts` | Tenant-scoped database queries |
| `server/encryption.ts` | Credential encryption utilities |
| `server/revenuecat.ts` | Webhook signature verification |
| `server/security.ts` | Security middleware (to be created) |
