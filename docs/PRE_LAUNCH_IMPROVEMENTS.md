# Pre-Launch Improvements Checklist

**Date:** December 15, 2025  
**Status:** Review before RevenueCat setup and MyTasker handoff

---

## Executive Summary

After auditing the staging site, the following improvements are recommended before production launch. Items are prioritized by impact on user experience and conversion.

---

## Priority 1: Critical (Must Fix Before Launch)

### 1.1 Dashboard Navigation Issue
**Location:** Dashboard page  
**Issue:** Dashboard shows marketing navigation (Solutions, Pricing, etc.) instead of app-specific navigation  
**Impact:** Confusing UX for logged-in users who should see dashboard-focused nav  
**Fix:** Use DashboardLayout component with sidebar navigation for authenticated pages

### 1.2 Empty State Polish
**Location:** Dashboard → Deliverable Requests tab  
**Issue:** Empty state is functional but could be more engaging  
**Current:** "No active requests" with basic text  
**Fix:** Add illustration/icon, clearer CTA, and perhaps a quick-start checklist

### 1.3 Activity Summary Placeholder
**Location:** Dashboard → "This week's activity" card  
**Issue:** Shows "No completions yet this week. Items are currently in queue." even when there are no items  
**Fix:** Show contextual message based on actual state (new user vs. active user with pending items)

---

## Priority 2: High (Should Fix Before Launch)

### 2.1 Pricing Table Mobile Responsiveness
**Location:** /pricing  
**Issue:** Pricing comparison table may not display well on mobile devices  
**Fix:** Add horizontal scroll or stack cards vertically on mobile

### 2.2 "Most Popular" Badge Styling
**Location:** /pricing → Pro plan  
**Issue:** "Most Popular" badge appears but could be more prominent  
**Fix:** Add background color, border, or subtle animation to draw attention

### 2.3 CTA Button Consistency
**Location:** Throughout site  
**Issue:** Multiple button styles (filled, outline, ghost) used inconsistently  
**Fix:** Establish clear hierarchy: Primary (filled blue), Secondary (outline), Tertiary (ghost)

### 2.4 Footer Link Organization
**Location:** Site footer  
**Issue:** Footer has good content but could be better organized  
**Fix:** Consider adding social links, newsletter signup, or trust badges

---

## Priority 3: Medium (Nice to Have)

### 3.1 Hero Section Animation
**Location:** Homepage hero  
**Issue:** Hero is clean but static  
**Fix:** Add subtle entrance animation for headline and CTA buttons

### 3.2 Feature Cards Hover States
**Location:** Homepage → "What you get every month" section  
**Issue:** Cards are static, no hover feedback  
**Fix:** Add subtle lift/shadow on hover for better interactivity

### 3.3 Vertical Cards Visual Hierarchy
**Location:** Homepage → "Choose Your Vertical" section  
**Issue:** All three vertical cards look identical  
**Fix:** Consider highlighting the most popular vertical or adding unique icons/colors

### 3.4 Blog Page Empty State
**Location:** /blog  
**Issue:** If no blog posts exist, page may show empty state  
**Fix:** Ensure graceful empty state with "Coming soon" message

### 3.5 Proof Page Social Proof
**Location:** /proof  
**Issue:** Proof page exists but may lack real testimonials/case studies  
**Fix:** Add placeholder testimonials or "Results coming soon" messaging

---

## Priority 4: Low (Post-Launch)

### 4.1 Dark Mode Toggle
**Issue:** Site is light-mode only  
**Fix:** Add dark mode support (theme toggle in header)

### 4.2 Loading States
**Issue:** Some pages show spinner without context  
**Fix:** Add skeleton loaders for better perceived performance

### 4.3 Breadcrumbs
**Issue:** No breadcrumb navigation on inner pages  
**Fix:** Add breadcrumbs for better navigation context

### 4.4 Search Functionality
**Issue:** No search on blog or documentation  
**Fix:** Add search for content discovery

---

## MyTasker Instructions Improvements

### Current State: ✅ Complete
The MyTasker domain instructions are comprehensive and include:
- Domain registration steps
- WHOIS privacy requirements
- Placeholder A records (127.0.0.1)
- Anti-spoofing TXT records (SPF -all, DMARC reject)
- Clear "DO NOT POINT LIVE YET" warnings
- Verification checklist

### Recommended Additions:
1. Add estimated time for each task (e.g., "Domain registration: ~15 minutes")
2. Add screenshot examples of DNS record configuration
3. Add troubleshooting section for common issues

---

## RevenueCat Pre-Setup Checklist

Before configuring RevenueCat, ensure:

| Item | Status | Notes |
|------|--------|-------|
| Pricing page displays correctly | ✅ | Three tiers visible |
| Plan features match documentation | ⚠️ | Verify quotas match backend |
| Checkout buttons work (show toast) | ⚠️ | Need to test |
| Billing webhook endpoint exists | ✅ | /api/trpc/billing.webhook |
| Webhook signature verification | ✅ | Fixed in security audit |
| Entitlement gating logic | ✅ | protectedProcedure checks |
| Subscription status display | ⚠️ | Dashboard needs to show plan |

---

## Recommended Implementation Order

1. **Fix Dashboard navigation** (use DashboardLayout) — 2 hours
2. **Polish empty states** — 1 hour
3. **Test checkout flow** (add toast for unconnected RevenueCat) — 30 min
4. **Mobile responsiveness check** — 1 hour
5. **CTA button consistency audit** — 30 min

**Total estimated time:** 5 hours

---

## Go/No-Go for RevenueCat Setup

**Current Status:** CONDITIONAL GO

**Blockers:**
- None critical — RevenueCat can be configured now

**Recommendations:**
- Fix Dashboard navigation before user testing
- Ensure checkout buttons show appropriate feedback when RevenueCat is not yet configured

---

## Go/No-Go for MyTasker Handoff

**Current Status:** GO

**The MyTasker instructions are ready for handoff.** All required information is documented:
- Domain registration steps
- DNS record configuration
- Anti-spoofing email records
- Verification checklist
- Clear warnings about not pointing to production
