# Lead Engine OS — V4 Changelog

**Release Date:** December 15, 2025  
**Version:** 4.0.0 (Launch-Ready Build)

---

## Summary

This release completes the launch-ready build with full security hardening, WordPress connection flow, dynamic plan limits, and staging/production environment controls. All 124 tests passing.

---

## New Features

### A) Indexing Control (Staging/Production Switch)

| Component | Change |
|-----------|--------|
| `VITE_ENVIRONMENT` | New env variable (`staging` or `production`) |
| `RobotsMetaTag.tsx` | Dynamic meta robots tag based on environment |
| `server/_core/index.ts` | X-Robots-Tag header for staging (noindex, nofollow) |
| Staging banner | Orange "STAGING ENVIRONMENT" banner when not in production |
| `INDEXING_FLIP_CHECKLIST.md` | Step-by-step guide for production flip |

### B) WordPress Connection Flow

| Component | Description |
|-----------|-------------|
| `DashboardSettings.tsx` | Full UI for managing WordPress connections |
| Add Website modal | Site URL, username, application password, auto-publish toggle |
| Connection status badges | Green (connected), Red (failed), Gray (not tested) |
| Test connection button | Verify credentials before saving |
| Delete connection | With confirmation dialog |
| Backend endpoints | `wordpress.createConnection`, `testConnection`, `deleteConnection`, `updateConnection` |
| Credential encryption | AES-256-GCM encryption at rest |

### C) Dynamic Plan Limits

| Component | Change |
|-----------|--------|
| `subscriptions.getMyPlanLimits` | New tRPC endpoint returning plan limits from database |
| `DashboardQuota.tsx` | Fetches limits from backend instead of hardcoded values |
| Plan limits card | Visual display of current plan's monthly limits |
| Near-limit warnings | Yellow highlighting when usage >= 75% |

---

## Security Hardening (Completed in V3.5)

All P0/P1 security issues resolved:

| ID | Issue | Fix |
|----|-------|-----|
| P0-001 | No rate limiting | 4-tier rate limiting (global, auth, webhook, admin) |
| P0-002 | No CORS | Allowlist-based CORS with credentials |
| P1-001 | Webhook signature bypass | Strict signature verification, reject if secret missing |
| P1-002 | Missing security headers | Helmet with CSP, HSTS, X-Frame-Options |
| P1-003 | Cookie sameSite | Changed to "lax" for production |
| P2-004 | Tenant verification | Added tenantId check to getByRequest |

---

## Dashboard Navigation (Completed in V3.5)

All dashboard pages now use `DashboardLayout` with proper sidebar navigation:

- `/dashboard` — Overview with stats and quick actions
- `/dashboard/requests` — Request list with filters and status badges
- `/dashboard/library` — Deliverables library with download links
- `/dashboard/quota` — Usage bars with dynamic plan limits
- `/dashboard/billing` — Subscription info and manage button
- `/dashboard/settings` — Profile, WordPress connections, logout

---

## n8n Workflows Imported

7 workflows successfully imported to n8n instance:

1. `01-subscription-provisioner` — Tenant provisioning on subscription events
2. `wf-seo-01-keyword-intent-scanner` — Weekly keyword discovery
3. `wf-seo-02-page-type-decision-engine` — Page type classification
4. `wf-seo-03-geo-hub-page-generator` — Monthly geo hub pages
5. `wf-seo-04-geo-insight-article-generator` — Bi-weekly insight articles
6. `wf-seo-05-internal-linking-enforcer` — Daily internal linking
7. `wf-seo-06-ctr-content-maintenance` — Weekly CTR maintenance

---

## Documentation Added

| Document | Purpose |
|----------|---------|
| `REVENUECAT_SETUP.md` | RevenueCat configuration guide |
| `DIGITALOCEAN_DEPLOYMENT_GUIDE.md` | MyTasker deployment instructions |
| `DOMAIN_SSL_SETUP.md` | Domain and SSL configuration |
| `MYTASKER_DOMAIN_INSTRUCTIONS.md` | Copy/paste domain registration task |
| `INDEXING_FLIP_CHECKLIST.md` | Staging to production flip guide |
| `SECURITY_AUDIT_REPORT_V2.md` | Final security audit (GO status) |
| `PRE_LAUNCH_IMPROVEMENTS.md` | UI/UX improvement checklist |

---

## Test Coverage

| Test Suite | Tests |
|------------|-------|
| `security.test.ts` | 21 |
| `securityFixes.test.ts` | 30 |
| `encryption.test.ts` | 18 |
| `deliverableFlow.test.ts` | 20 |
| `wordpressRollback.test.ts` | 12 |
| `n8nWorkflowSafety.test.ts` | 22 |
| `auth.logout.test.ts` | 1 |
| **Total** | **124** |

---

## Breaking Changes

None. All changes are backward compatible.

---

## Known Issues

1. **RevenueCat not configured** — Billing features require RevenueCat API credentials
2. **DataForSEO not configured** — SEO workflows require DataForSEO credentials

---

## Next Steps

1. Configure RevenueCat credentials in environment
2. Hand off `MYTASKER_DOMAIN_INSTRUCTIONS.md` for domain registration
3. Set `VITE_ENVIRONMENT=production` when ready to go live
4. Activate n8n workflows after DataForSEO setup
