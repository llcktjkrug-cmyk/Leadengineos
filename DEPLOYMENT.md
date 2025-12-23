# Lead Engine OS - Deployment Guide

## Overview

Lead Engine OS is a production-ready multi-tenant SaaS platform for automating marketing deliverables for vertical-specific service businesses (med spas, dental implants, multi-location operations).

**Current Status: ~65% Complete**
- ✅ Core platform infrastructure
- ✅ Public marketing site (14 pages)
- ✅ Client portal with deliverable wizard
- ✅ Admin portal with blog CMS
- ✅ RevenueCat billing integration
- ✅ LLM content generation system
- ✅ n8n API layer + workflow documentation
- ✅ WordPress REST API integration
- ✅ Analytics tracking
- ✅ Email notification system
- ⏳ Initial blog content (framework ready, needs execution)
- ⏳ Advanced analytics dashboards (tracking works, visualization pending)
- ⏳ Proof system with ROI calculator (framework ready, needs data)

---

## Prerequisites

### Required Services

1. **Manus Platform** (already configured)
   - Database (MySQL/TiDB)
   - OAuth authentication
   - File storage (S3)
   - LLM API access
   - Image generation API
   - Analytics tracking

2. **RevenueCat** (requires setup)
   - Project ID
   - Public API key (for web)
   - Secret API key (for backend)
   - Webhook secret

3. **n8n Instance** (already configured)
   - Instance URL: `$N8N_INSTANCE_URL`
   - API Key: `$N8N_API_KEY`

### Optional Services

- **Gmail OAuth** (for email notifications) - Currently logs to console
- **WordPress Sites** (for automated content publishing) - Per-tenant configuration

---

## Configuration Checklist

### 1. RevenueCat Setup

**Status:** Integration code complete, credentials needed

**Steps:**
1. Create RevenueCat project at https://app.revenuecat.com
2. Set up three offerings:
   - **Starter**: $497/month
   - **Pro**: $997/month
   - **Scale**: $1,997/month
3. Enable Web Billing in project settings
4. Copy credentials and add via Manus secrets panel:
   - `REVENUECAT_PROJECT_ID`
   - `REVENUECAT_PUBLIC_KEY`
   - `REVENUECAT_SECRET_KEY`
   - `REVENUECAT_WEBHOOK_SECRET`
5. Configure webhook URL: `https://your-domain.manus.app/api/billing/webhook`
6. Test checkout flow at `/pricing`

### 2. n8n Workflow Import

**Status:** 10 workflows documented, ready to import

**Location:** `/n8n-workflows/WORKFLOWS.md`

**Steps:**
1. Open your n8n instance
2. Import workflows from documentation (copy/paste JSON or build from specs)
3. Configure each workflow:
   - Set `APP_API_URL` to your deployment URL
   - Set `APP_API_KEY` to tenant API key (generated in admin portal)
   - Enable `DRY_RUN` mode for testing
   - Set batch limits and rate limiting
4. Test each workflow manually before enabling automation
5. Monitor workflow runs in admin portal → Workflows tab

**Workflows:**
1. Subscription Provisioner (webhook trigger)
2. State Enforcer (daily cron)
3. Onboarding Collector (webhook trigger)
4. Content Brief Generator (scheduled)
5. Blog Draft Generator (scheduled)
6. Landing Page Builder (scheduled)
7. SEO Improver (weekly)
8. Internal Linking Engine (weekly)
9. Local Presence Engine (monthly)
10. Weekly Report Generator (weekly)

### 3. Email Notifications

**Status:** Framework complete, provider integration pending

**Current Behavior:** Logs to console, returns success

**To Enable:**
1. Choose email provider:
   - Gmail OAuth (recommended for njj1986@gmail.com)
   - SendGrid API
   - AWS SES
   - Other SMTP provider
2. Update `server/email.ts` with provider integration
3. Test notifications:
   - Subscription status changes
   - Deliverable completions
   - Lead submissions
   - Weekly reports

### 4. Custom Domain

**Status:** Ready for configuration

**Steps:**
1. In Manus UI → Settings → Domains
2. Modify auto-generated domain prefix or bind custom domain
3. For `leadengine.kiasufamilytrust.org`:
   - Add CNAME record pointing to Manus
   - Verify domain ownership
   - Enable SSL (automatic)

### 5. Brand Customization

**Current Settings:**
- Brand: Lead Engine OS
- Tagline: "Done-for-you growth + fulfillment subscriptions"
- Support email: support@leadengine.kiasufamilytrust.org
- Notification email: njj1986@gmail.com

**To Update:**
1. Edit `client/src/components/Navigation.tsx` (logo, brand name)
2. Edit `client/src/components/Footer.tsx` (support email, social links)
3. Edit `client/src/pages/Home.tsx` (hero copy, tagline)
4. Update `VITE_APP_TITLE` in Manus secrets panel

---

## Database Schema

**Tables:** 15 total

**Core:**
- `users` - Authentication and RBAC
- `tenants` - Workspace isolation
- `subscriptions` - RevenueCat billing

**Content:**
- `blogPosts` - Blog CMS
- `landingPages` - Generated landing pages
- `deliverables` - Deliverable library
- `deliverableRequests` - Job queue

**Integration:**
- `websiteConnections` - WordPress credentials
- `workflowRuns` - n8n job logging
- `auditLog` - Compliance tracking

**Lead Capture:**
- `leads` - Public site leads
- `leadEvents` - Consent tracking

**Configuration:**
- `plans` - Plan definitions
- `quotas` - Usage tracking
- `apiKeys` - n8n authentication

---

## API Endpoints

### Public API (n8n Integration)

**Base:** `/api/n8n/*`

**Authentication:** API key header (`X-API-Key: {tenant.apiKey}`)

**Endpoints:**
- `POST /api/n8n/workflow/log` - Log workflow execution
- `POST /api/n8n/jobs/create` - Create deliverable request
- `POST /api/n8n/jobs/update` - Update job status
- `GET /api/n8n/tenants/active` - List active tenants
- `GET /api/n8n/content/queue` - Get pending content requests
- `POST /api/n8n/content/store` - Store generated content
- `GET /api/n8n/tenant/config` - Get tenant configuration
- `POST /api/n8n/content/generate-blog` - Generate blog post
- `POST /api/n8n/content/generate-landing` - Generate landing page
- `POST /api/n8n/content/generate-image` - Generate featured image
- `POST /api/n8n/content/seo-improve` - Analyze SEO improvements
- `POST /api/n8n/content/internal-links` - Generate internal linking suggestions

### Billing API

**Base:** `/api/billing/*`

**Endpoints:**
- `POST /api/billing/create-checkout` - Create RevenueCat checkout session
- `POST /api/billing/webhook` - Handle RevenueCat webhook events
- `GET /api/billing/portal-url` - Get customer portal URL

### Admin API

**Base:** `/api/trpc/*`

**Authentication:** Manus OAuth session cookie

**Routers:**
- `auth` - Authentication (me, logout)
- `tenants` - Tenant management (admin only)
- `users` - User management (admin only)
- `subscriptions` - Subscription management
- `blog` - Blog CMS (admin only)
- `landingPages` - Landing page library
- `leads` - Lead capture
- `deliverables` - Deliverable library
- `workflows` - Workflow run logs
- `n8n` - n8n API endpoints

---

## Operational Runbook

### Daily Operations (30 minutes/week)

**Monday (10 min):**
1. Check admin portal → Workflows tab for failed runs
2. Review new leads in admin portal → Content tab
3. Verify active subscriptions in admin portal → Subscriptions tab

**Wednesday (10 min):**
1. Review deliverable requests in admin portal
2. Check for past_due subscriptions
3. Monitor workflow throughput

**Friday (10 min):**
1. Review weekly reports (automated)
2. Check blog post queue
3. Plan next week's content priorities

### Troubleshooting

**Workflow Failed:**
1. Check workflow logs in n8n instance
2. Verify tenant API key is valid
3. Check tenant subscription status
4. Re-run workflow manually with DRY_RUN enabled

**Subscription Webhook Not Received:**
1. Verify webhook URL in RevenueCat dashboard
2. Check webhook secret matches environment variable
3. Review webhook logs in RevenueCat
4. Manually sync subscription status via admin portal

**Content Generation Error:**
1. Check LLM API quota in Manus dashboard
2. Verify tenant has active subscription
3. Review content generation logs in workflow runs
4. Test content generation manually via admin portal

**WordPress Publishing Failed:**
1. Verify WordPress credentials in tenant settings
2. Test connection via admin portal
3. Check WordPress REST API is enabled
4. Verify user has publishing permissions

---

## Security Considerations

**Authentication:**
- Manus OAuth for user authentication
- API keys for n8n integration (per-tenant, unique)
- RevenueCat webhook signature verification

**Data Isolation:**
- Multi-tenant architecture with `tenantId` filtering
- Admin-only procedures for sensitive operations
- RBAC with admin/staff/user roles

**Secrets Management:**
- All secrets stored in Manus secrets panel
- Never commit `.env` files
- Rotate API keys periodically

**Compliance:**
- Audit log for all sensitive operations
- Lead consent tracking (GDPR/CCPA)
- WordPress metadata sanitization (no automation footprints)

---

## Monitoring & Analytics

**Manus Integrated Analytics:**
- Page views
- CTA clicks
- Checkout starts/completions
- Subscription events
- Request creations
- Job completions
- Lead submissions

**Admin Dashboard:**
- Total tenants
- Total users
- Active subscriptions
- Published blog posts
- Workflow run history

**Future Enhancements:**
- Conversion funnel visualization
- MRR and churn metrics
- Fulfillment throughput charts
- Top converting pages/posts

---

## Iteration 2 Backlog

### High Priority

1. **Initial Blog Content**
   - Generate 12 blog posts (4 per vertical)
   - 1200-1800 words each
   - Featured images
   - Internal linking
   - SEO optimization

2. **Proof System**
   - Research benchmark data for each vertical
   - Create 6 case studies (2 per vertical)
   - Build interactive ROI calculator
   - Add PDF export
   - Email opt-in capture

3. **Analytics Dashboards**
   - Conversion funnel visualization
   - Subscription metrics (MRR, churn, LTV)
   - Fulfillment throughput charts
   - Top converting pages/posts

### Medium Priority

4. **Blog CMS Enhancements**
   - XML sitemap generation
   - robots.txt endpoint
   - Canonical tag support
   - Schema.org blocks (Organization, FAQ)
   - Internal linking suggestion helper

5. **WordPress Integration**
   - Credential encryption
   - Auto-publish toggle per tenant
   - Metadata update endpoint
   - Rollback/revert functionality

6. **Email System**
   - Gmail OAuth integration
   - Email preferences per tenant
   - Template customization
   - Delivery tracking

### Low Priority

7. **Admin Portal**
   - Plan and quota configuration UI
   - Add-on management
   - Template/prompt management per vertical
   - Manual approval flags for risky operations

8. **Client Portal**
   - Version history and diffs view
   - "Connect Your Website" setup flow
   - Hosted microsite option

9. **QA & Testing**
   - End-to-end test suite
   - Subscription flow testing
   - Workflow dry-run validation
   - Multi-tenant isolation verification

---

## Support & Maintenance

**Platform Owner:** njj1986@gmail.com

**Manus Support:** https://help.manus.im

**Documentation:**
- `/README.md` - Development guide
- `/DEPLOYMENT.md` - This file
- `/n8n-workflows/WORKFLOWS.md` - Workflow specifications
- `/todo.md` - Feature tracking

**Code Structure:**
- `/client/src/pages/` - Page components
- `/client/src/components/` - Reusable UI
- `/server/routers.ts` - tRPC API procedures
- `/server/db.ts` - Database helpers
- `/server/contentGeneration.ts` - LLM content generation
- `/server/wordpress.ts` - WordPress integration
- `/server/analytics.ts` - Analytics tracking
- `/server/email.ts` - Email notifications
- `/drizzle/schema.ts` - Database schema

---

## Quick Start

1. **Access the platform:** https://leadengineos.manus.app (or custom domain)
2. **Sign in:** Click "Sign In" → Manus OAuth
3. **Admin access:** Owner (njj1986@gmail.com) is auto-promoted to admin
4. **Create first tenant:** Admin Portal → Tenants → New Tenant
5. **Copy API key:** Save for n8n workflow configuration
6. **Import n8n workflows:** Follow `/n8n-workflows/WORKFLOWS.md`
7. **Configure RevenueCat:** Follow "RevenueCat Setup" section above
8. **Test checkout:** Visit `/pricing` → Select plan → Complete checkout
9. **Monitor operations:** Admin Portal → Workflows, Subscriptions, Content

---

## What Must Be Filled In

**Before Production Launch:**

1. ✅ **n8n Integration** - Already configured
2. ❌ **RevenueCat Credentials** - Add via Manus secrets panel:
   - `REVENUECAT_PROJECT_ID`
   - `REVENUECAT_PUBLIC_KEY`
   - `REVENUECAT_SECRET_KEY`
   - `REVENUECAT_WEBHOOK_SECRET`
3. ❌ **Email Provider** - Update `server/email.ts` with Gmail OAuth or SMTP
4. ✅ **Custom Domain** - Optional, can use Manus default
5. ✅ **Analytics** - Already integrated (Manus)

**After Launch (Iteration 2):**

6. Generate initial blog content (12 posts)
7. Build proof system with real benchmark data
8. Create analytics visualization dashboards
9. Add XML sitemap and Schema.org blocks
10. Implement WordPress credential encryption

---

## Success Metrics

**Platform Health:**
- Uptime: 99.9%+
- API response time: <500ms p95
- Workflow success rate: >95%

**Business Metrics:**
- Active tenants
- MRR (Monthly Recurring Revenue)
- Churn rate
- Deliverables completed per week

**Customer Metrics:**
- Time to first deliverable: <7 days
- Customer satisfaction score
- Support ticket volume

---

## Changelog

**v1.0 (Current) - Core Platform**
- Multi-tenant architecture
- Public marketing site (14 pages)
- Client portal with deliverable wizard
- Admin portal with blog CMS
- RevenueCat billing integration
- LLM content generation
- n8n API layer
- WordPress integration
- Analytics tracking
- Email notification framework

**v1.1 (Planned) - Content & Analytics**
- Initial blog content (12 posts)
- Proof system with ROI calculator
- Analytics dashboards
- Blog CMS enhancements
- WordPress auto-publish

**v1.2 (Future) - Polish & Scale**
- Email provider integration
- Advanced admin features
- QA test suite
- Performance optimization
