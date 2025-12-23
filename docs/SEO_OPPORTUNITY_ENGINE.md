# SEO Opportunity Intelligence Engine

## Overview

The SEO Opportunity Engine is an API-driven, n8n-powered system that automatically discovers, prioritizes, and generates SEO content for Lead Engine OS clients. It operates on a "human-in-the-loop" model where opportunities are surfaced for approval before content generation.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SEO OPPORTUNITY ENGINE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │  WF-SEO-01   │    │  WF-SEO-02   │    │  WF-SEO-03   │                   │
│  │   Keyword    │───▶│  Page Type   │───▶│   Geo Hub    │                   │
│  │   Scanner    │    │   Decision   │    │  Generator   │                   │
│  │   (Weekly)   │    │   Engine     │    │  (Monthly)   │                   │
│  └──────────────┘    └──────────────┘    └──────────────┘                   │
│         │                   │                   │                            │
│         │                   │                   ▼                            │
│         │                   │            ┌──────────────┐                   │
│         │                   │            │  WF-SEO-04   │                   │
│         │                   └───────────▶│   Insight    │                   │
│         │                                │  Articles    │                   │
│         │                                │  (Bi-weekly) │                   │
│         │                                └──────────────┘                   │
│         │                                       │                            │
│         ▼                                       ▼                            │
│  ┌──────────────┐                        ┌──────────────┐                   │
│  │  Opportunity │                        │  WF-SEO-05   │                   │
│  │    Queue     │                        │   Internal   │                   │
│  │  (Approval)  │                        │   Linking    │                   │
│  └──────────────┘                        │   (Daily)    │                   │
│                                          └──────────────┘                   │
│                                                 │                            │
│                                                 ▼                            │
│                                          ┌──────────────┐                   │
│                                          │  WF-SEO-06   │                   │
│                                          │  CTR + Meta  │                   │
│                                          │ Maintenance  │                   │
│                                          │   (Weekly)   │                   │
│                                          └──────────────┘                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Workflow Details

### WF-SEO-01: Keyword + Intent Scanner
**Schedule:** Weekly (Monday 6 AM)

**Purpose:** Discovers keyword opportunities using DataForSEO API and scores them based on intent, volume, and competition.

**Process:**
1. Fetches seed keywords from config per vertical
2. Queries DataForSEO for related keywords + metrics
3. Scores each keyword using weighted formula
4. Classifies intent tier (A/B/C/D)
5. Queues high-scoring opportunities for approval

**Scoring Formula:**
```
Score = (Volume × 0.3) + (Intent × 0.4) + (Competition × 0.2) + (Geo × 0.1)
```

### WF-SEO-02: Page Type Decision Engine
**Trigger:** Webhook (called after approval)

**Purpose:** Determines what type of page to build based on keyword intent and geo scope.

**Decision Matrix:**
| Intent Tier | Geo Scope | Page Type |
|-------------|-----------|-----------|
| A (Purchase) | National | Core Money Landing Page |
| A (Purchase) | State/Metro | Geo Hub Landing Page |
| B (Evaluation) | Any | Comparison/Pricing Page |
| C (Operator Pain) | Any | Insight Article |
| D (Informational) | Any | Skip (no page) |

### WF-SEO-03: Geo Hub Page Generator
**Schedule:** Monthly (1st of month, 8 AM)

**Purpose:** Generates geo-targeted landing pages for state/metro markets.

**Content Structure:**
- H1 optimized for geo + service
- Hero section with value proposition
- Market dynamics section (geo-specific)
- Why operators choose us section
- CTA section with audit request

**Safeguards:**
- Max 5 pages per batch
- All pages created as DRAFT
- Rollback history logged

### WF-SEO-04: Geo Insight Article Generator
**Schedule:** Bi-weekly (Wednesday 9 AM)

**Purpose:** Generates educational articles targeting operator pain points with geo context.

**Article Types:**
- "Why [Geo] operators struggle with [problem]"
- "What makes [service] marketing harder in [Geo]"
- "Common [service] marketing mistakes in [Geo]"

**Internal Linking Rules:**
- Links UPWARD only: Article → Geo Hub → Money Page
- Max 2 internal links per article
- NO article-to-article chains

### WF-SEO-05: Internal Linking Enforcer
**Schedule:** Daily (5 AM)

**Purpose:** Audits and corrects internal links to maintain hierarchy.

**Link Hierarchy:**
```
Core Money Page (top)
       ↑
   Geo Hub Page
       ↑
  Insight Article (bottom)
```

**Rules Enforced:**
- Articles can only link to Geo Hubs or Money Pages
- Geo Hubs can only link to Money Pages, Proof, or Pricing
- No horizontal linking at same level
- Max 2 internal links per page

### WF-SEO-06: CTR + Content Maintenance
**Schedule:** Weekly (Friday 10 AM)

**Purpose:** Identifies underperforming pages and optimizes meta tags.

**Triggers:**
1. **Weak CTR:** Impressions > 100, CTR < 2%, Position < 20
2. **Page 2 Ranking:** Impressions > 50, Position 11-20

**Actions:**
- Weak CTR → Auto-generate new title/meta
- Page 2 → Flag for content review

## Required API Keys

| Service | Environment Variable | Purpose |
|---------|---------------------|---------|
| DataForSEO | `DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD` | Keyword research |
| Google Search Console | OAuth2 credentials | CTR data |
| Lead Engine API | `LEADENGINE_API_KEY` | Internal API calls |

## Safety Controls

All workflows include:

1. **DRY_RUN Check:** Set `DRY_RUN=true` to simulate without making changes
2. **LAUNCH_MODE Check:** Set `LAUNCH_MODE=STAGING` to prevent production writes
3. **Rate Limiting:** Built-in delays between API calls
4. **Rollback History:** Every change logged with previous state for revert

## Configuration

See `n8n-workflows/seo-opportunity-config.json` for:
- Scoring thresholds
- Seed keywords per vertical
- Geo scope limits
- Max pages per month
- Intent tier definitions

## Deployment

1. Import all workflow JSON files into n8n
2. Configure environment variables:
   - `DRY_RUN=true` (start in dry run)
   - `LAUNCH_MODE=STAGING`
   - `LEADENGINE_API_URL`
   - `LEADENGINE_API_KEY`
   - `DATAFORSEO_LOGIN`
   - `DATAFORSEO_PASSWORD`
3. Set up Google Search Console OAuth2 credentials
4. Activate workflows in order: 01 → 02 → 03 → 04 → 05 → 06
5. Monitor first execution in dry run mode
6. Switch `DRY_RUN=false` when ready

## Monitoring

Check workflow execution logs at:
- n8n execution history
- Lead Engine API: `/api/workflow/log`
- Rollback history: `/api/seo/rollback-history`
