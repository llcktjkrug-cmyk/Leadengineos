# Lead Engine OS - n8n Workflow Documentation

This document describes the 10 core automation workflows for Lead Engine OS. Each workflow uses the app's API endpoints for data access and content generation.

## Setup Instructions

### 1. Environment Variables

Configure these in your n8n instance:

```
APP_API_URL=https://leadengineos.manus.app
TENANT_API_KEY=<tenant-specific-api-key-from-database>
```

### 2. Authentication

All API requests use the `X-API-Key` header for authentication. Each tenant has a unique API key stored in the `tenants` table.

### 3. API Endpoints

Base URL: `${APP_API_URL}/api/trpc/`

**n8n Router:**
- `n8n.logWorkflowRun` - Log workflow execution
- `n8n.updateWorkflowRun` - Update workflow status
- `n8n.getTenantConfig` - Get tenant configuration
- `n8n.getPendingRequests` - Get pending deliverable requests
- `n8n.updateRequestStatus` - Update request status
- `n8n.generateBlogPost` - Generate blog post content
- `n8n.generateLandingPage` - Generate landing page content
- `n8n.generateSEOImprovements` - Generate SEO recommendations
- `n8n.generateInternalLinks` - Generate internal linking suggestions
- `n8n.storeDeliverable` - Store generated deliverable

---

## WF1: Subscription Provisioner

**Trigger:** Webhook (called by RevenueCat webhook handler)  
**Frequency:** On subscription event  
**Purpose:** Activate or pause tenants based on subscription status

### Flow:

1. **Webhook Trigger** - Receives subscription event
2. **Log Start** - Call `n8n.logWorkflowRun` with status "running"
3. **Get Config** - Call `n8n.getTenantConfig` to get current state
4. **Check Status** - Branch based on subscription status
   - If `active` or `trialing` → Activate tenant
   - If `canceled`, `expired`, or `past_due` → Pause tenant
5. **Update Tenant** - Call `tenants.updateStatus` with new status
6. **Log Success** - Call `n8n.updateWorkflowRun` with status "success"
7. **Respond** - Return success response

### Error Handling:

- On error, call `n8n.updateWorkflowRun` with status "failed" and error message
- Send notification to admin via `system.notifyOwner`

---

## WF2: Subscription State Enforcer

**Trigger:** Schedule (runs every 6 hours)  
**Frequency:** 4x daily  
**Purpose:** Enforce subscription limits and pause overdue accounts

### Flow:

1. **Schedule Trigger** - Runs at 00:00, 06:00, 12:00, 18:00 UTC
2. **Log Start** - Call `n8n.logWorkflowRun`
3. **Get All Subscriptions** - Call `subscriptions.listAll`
4. **Loop Through Subscriptions**:
   - Check if `currentPeriodEnd` has passed
   - Check if status is `past_due` for >7 days
   - If overdue, call `tenants.updateStatus` to pause
5. **Get Active Tenants** - Call `tenants.list` with filter `status=active`
6. **Loop Through Tenants**:
   - Get quota usage via `quota.getCurrent`
   - If over quota, pause deliverable processing
7. **Log Success** - Call `n8n.updateWorkflowRun`

### Configuration:

- Grace period for past_due: 7 days
- Over-quota action: Pause new requests, allow in-flight to complete

---

## WF3: Tenant Onboarding Collector

**Trigger:** Webhook (called when new tenant created)  
**Frequency:** On tenant creation  
**Purpose:** Collect onboarding information and configure tenant

### Flow:

1. **Webhook Trigger** - Receives tenant ID
2. **Log Start** - Call `n8n.logWorkflowRun`
3. **Get Tenant** - Call `tenants.getById`
4. **Send Welcome Email** - Email tenant owner with onboarding checklist
5. **Wait for Responses** - Collect via form or email:
   - Business name and vertical
   - Target keywords (3-5)
   - Unique selling points (3-5)
   - Competitor URLs (optional)
   - WordPress site URL and credentials
6. **Store Configuration** - Call `tenants.update` with collected data
7. **Create Website Connection** - Call `websiteConnections.create` if WordPress provided
8. **Test Connection** - Verify WordPress REST API access
9. **Log Success** - Call `n8n.updateWorkflowRun`
10. **Notify Admin** - Call `system.notifyOwner` with onboarding summary

### Data Collected:

- Business details (name, vertical, location)
- Marketing goals and target audience
- SEO keywords and competitor analysis
- WordPress credentials (encrypted)
- Content preferences (tone, style, topics to avoid)

---

## WF4: Content Brief Generator

**Trigger:** Schedule (runs daily at 09:00 UTC)  
**Frequency:** Daily  
**Purpose:** Generate content briefs for upcoming blog posts and landing pages

### Flow:

1. **Schedule Trigger** - Runs daily at 09:00 UTC
2. **Log Start** - Call `n8n.logWorkflowRun`
3. **Get Active Tenants** - Call `tenants.list` with filter `status=active`
4. **Loop Through Tenants**:
   - Get subscription plan via `subscriptions.getByTenant`
   - Check monthly quota remaining via `quota.getCurrent`
   - If quota available:
     - Get tenant vertical and keywords
     - Generate 3-5 blog post topics using LLM
     - Generate 2-3 landing page ideas using LLM
     - Store briefs in `deliverableRequests` with status "queued"
5. **Log Success** - Call `n8n.updateWorkflowRun`

### Brief Structure:

```json
{
  "type": "blog_post",
  "requestData": {
    "topic": "5 Ways Med Spas Can Increase Booked Consultations",
    "keywords": ["med spa marketing", "booked consultations", "aesthetic clinic growth"],
    "targetWordCount": 1500,
    "targetAudience": "Med spa owners and marketing managers",
    "contentAngle": "Actionable tactics with ROI focus"
  }
}
```

---

## WF5: Blog Draft Generator

**Trigger:** Schedule (runs every 2 hours)  
**Frequency:** 12x daily  
**Purpose:** Generate blog post drafts from queued requests

### Flow:

1. **Schedule Trigger** - Runs every 2 hours
2. **Log Start** - Call `n8n.logWorkflowRun`
3. **Get Pending Requests** - Call `n8n.getPendingRequests` with filter `type=blog_post`, `status=queued`
4. **Loop Through Requests** (max 5 per run):
   - Update status to "running" via `n8n.updateRequestStatus`
   - Call `n8n.generateBlogPost` with request data
   - If WordPress auto-publish enabled:
     - Post to WordPress via REST API
     - Store WordPress post ID in deliverable
   - Update status to "done" via `n8n.updateRequestStatus`
   - Send notification to tenant via email
5. **Log Success** - Call `n8n.updateWorkflowRun`

### Rate Limiting:

- Max 5 posts per workflow run
- 2-hour intervals = max 60 posts/day across all tenants
- Priority queue for "Pro" and "Scale" plan tenants

---

## WF6: Landing Page Builder

**Trigger:** Schedule (runs every 4 hours)  
**Frequency:** 6x daily  
**Purpose:** Generate landing pages from queued requests

### Flow:

1. **Schedule Trigger** - Runs every 4 hours
2. **Log Start** - Call `n8n.logWorkflowRun`
3. **Get Pending Requests** - Call `n8n.getPendingRequests` with filter `type=landing_page`, `status=queued`
4. **Loop Through Requests** (max 3 per run):
   - Update status to "running" via `n8n.updateRequestStatus`
   - Call `n8n.generateLandingPage` with request data
   - If WordPress auto-publish enabled:
     - Create WordPress page via REST API
     - Store WordPress page ID in deliverable
   - Update status to "done" via `n8n.updateRequestStatus`
   - Send notification to tenant
5. **Log Success** - Call `n8n.updateWorkflowRun`

### Landing Page Types:

- Service pages (e.g., "Botox in [City]")
- Location pages (e.g., "[Business] in [City]")
- Offer pages (e.g., "New Patient Special")
- Comparison pages (e.g., "Botox vs. Dysport")

---

## WF7: SEO Improver

**Trigger:** Schedule (runs daily at 14:00 UTC)  
**Frequency:** Daily  
**Purpose:** Analyze existing content and generate SEO improvement recommendations

### Flow:

1. **Schedule Trigger** - Runs daily at 14:00 UTC
2. **Log Start** - Call `n8n.logWorkflowRun`
3. **Get Pending Requests** - Call `n8n.getPendingRequests` with filter `type=seo_improvement`, `status=queued`
4. **Loop Through Requests** (max 10 per run):
   - Update status to "running"
   - Fetch page content from WordPress via REST API
   - Call `n8n.generateSEOImprovements` with page content and target keywords
   - Store recommendations in deliverable
   - Update status to "done"
   - Send notification to tenant with actionable checklist
5. **Log Success** - Call `n8n.updateWorkflowRun`

### SEO Analysis Includes:

- Title tag optimization
- Meta description improvements
- Header structure (H1, H2, H3)
- Keyword density and placement
- Internal linking opportunities
- Image alt text recommendations
- Content length and readability
- Schema markup suggestions

---

## WF8: Internal Linking Engine

**Trigger:** Schedule (runs weekly on Monday at 10:00 UTC)  
**Frequency:** Weekly  
**Purpose:** Generate internal linking suggestions to improve site architecture

### Flow:

1. **Schedule Trigger** - Runs weekly on Monday at 10:00 UTC
2. **Log Start** - Call `n8n.logWorkflowRun`
3. **Get Active Tenants** - Call `tenants.list` with filter `status=active`
4. **Loop Through Tenants**:
   - Get all published blog posts via `blog.listMyPosts`
   - Get all published landing pages via `landingPages.list`
   - For each page:
     - Call `n8n.generateInternalLinks` with page content and available pages
     - Store suggestions in deliverable
   - Send weekly internal linking report to tenant
5. **Log Success** - Call `n8n.updateWorkflowRun`

### Linking Strategy:

- Prioritize topical relevance
- Avoid over-linking (max 5 internal links per 1000 words)
- Use descriptive anchor text
- Link to cornerstone content
- Avoid linking to same page multiple times

---

## WF9: Local Presence Engine

**Trigger:** Schedule (runs weekly on Wednesday at 11:00 UTC)  
**Frequency:** Weekly  
**Purpose:** Generate local SEO content and monitor local presence

### Flow:

1. **Schedule Trigger** - Runs weekly on Wednesday at 11:00 UTC
2. **Log Start** - Call `n8n.logWorkflowRun`
3. **Get Pending Requests** - Call `n8n.getPendingRequests` with filter `type=local_presence`, `status=queued`
4. **Loop Through Requests**:
   - Update status to "running"
   - Generate location-specific content:
     - City/neighborhood landing pages
     - Local event tie-ins
     - Community involvement posts
   - Check Google Business Profile status (if API available)
   - Generate GMB post suggestions
   - Store deliverables
   - Update status to "done"
5. **Log Success** - Call `n8n.updateWorkflowRun`

### Local Content Types:

- "[Service] in [City]" landing pages
- "[Business Type] near [Landmark]" pages
- Local event coverage
- Community partnerships
- Local awards and recognition

---

## WF10: Weekly Report Generator

**Trigger:** Schedule (runs weekly on Friday at 16:00 UTC)  
**Frequency:** Weekly  
**Purpose:** Generate and send weekly performance reports to tenants

### Flow:

1. **Schedule Trigger** - Runs weekly on Friday at 16:00 UTC
2. **Log Start** - Call `n8n.logWorkflowRun`
3. **Get Active Tenants** - Call `tenants.list` with filter `status=active`
4. **Loop Through Tenants**:
   - Get deliverables created this week via `deliverables.list`
   - Get quota usage via `quota.getCurrent`
   - Get workflow runs via `workflows.listRuns`
   - Fetch WordPress analytics (if available):
     - Page views
     - Top performing posts
     - Conversion events
   - Generate report using LLM:
     - Executive summary
     - Deliverables completed
     - Content performance
     - SEO improvements
     - Next week's plan
   - Store report as deliverable
   - Send email to tenant with report attached
5. **Log Success** - Call `n8n.updateWorkflowRun`

### Report Sections:

1. **Executive Summary** - Key metrics and highlights
2. **Content Delivered** - List of blog posts, landing pages, SEO improvements
3. **Performance Metrics** - Traffic, engagement, conversions
4. **SEO Progress** - Keyword rankings, backlinks, technical improvements
5. **Next Week** - Planned deliverables and recommendations

---

## Error Handling (All Workflows)

### Standard Error Flow:

1. **Catch Error** - Use n8n error trigger node
2. **Log Error** - Call `n8n.updateWorkflowRun` with:
   - `status: "failed"`
   - `errorMessage: <error details>`
3. **Notify Admin** - Call `system.notifyOwner` with error details
4. **Retry Logic**:
   - Automatic retry 3x with exponential backoff (1min, 5min, 15min)
   - After 3 failures, mark request as "failed" and notify tenant

### Common Error Scenarios:

- **API Rate Limit** - Wait and retry with exponential backoff
- **LLM Generation Failure** - Retry with simplified prompt
- **WordPress Connection Error** - Mark as "needs_info" and notify tenant
- **Quota Exceeded** - Pause processing and notify tenant

---

## Monitoring & Maintenance

### Key Metrics to Track:

- Workflow execution time (target: <5min per workflow)
- Success rate (target: >95%)
- Content generation quality (manual review sample)
- Tenant satisfaction (survey after deliverables)

### Weekly Maintenance:

- Review failed workflow runs
- Check for stuck requests (status "running" for >1 hour)
- Audit quota usage vs. plan limits
- Review and update content templates

### Monthly Optimization:

- Analyze workflow performance
- Update LLM prompts based on feedback
- Optimize API call patterns
- Review and adjust rate limits

---

## Import Instructions

### Option 1: Manual Build

1. Create new workflow in n8n
2. Add nodes according to flow diagrams above
3. Configure API endpoints and authentication
4. Test with sample data
5. Activate workflow

### Option 2: JSON Import (if provided)

1. Download workflow JSON from `/n8n-workflows/` directory
2. In n8n, go to Workflows → Import from File
3. Select JSON file
4. Configure environment variables
5. Test and activate

---

## Support & Troubleshooting

### Common Issues:

**Workflow not triggering:**
- Check webhook URL is correct
- Verify API key is valid
- Check n8n execution logs

**API authentication errors:**
- Verify `X-API-Key` header is set
- Check tenant API key in database
- Ensure API key matches tenant

**Content generation failures:**
- Check LLM API credentials
- Review prompt templates
- Verify input data format

**WordPress publishing errors:**
- Test WordPress REST API access
- Verify credentials are current
- Check WordPress user permissions

### Getting Help:

- Review workflow execution logs in n8n
- Check app logs for API errors
- Contact support: njj1986@gmail.com
