# RevenueCat Setup Guide for Lead Engine OS

**Last Updated:** December 15, 2025  
**Author:** Manus AI

---

## Overview

Lead Engine OS uses RevenueCat for subscription billing. This document provides a complete setup checklist and testing plan.

---

## Required Environment Variables

Copy and paste these into your Manus Settings → Secrets panel:

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `REVENUECAT_PROJECT_ID` | Your RevenueCat project identifier | RevenueCat Dashboard → Project Settings → API Keys |
| `REVENUECAT_PUBLIC_KEY` | Public API key for frontend SDK | RevenueCat Dashboard → Project Settings → API Keys |
| `REVENUECAT_SECRET_KEY` | Secret API key for server-side operations | RevenueCat Dashboard → Project Settings → API Keys |
| `REVENUECAT_WEBHOOK_SECRET` | Webhook signature verification secret | RevenueCat Dashboard → Project Settings → Webhooks |

---

## Product Configuration

Create the following products in RevenueCat Dashboard → Products:

| Product ID | Display Name | Price | Billing Cycle |
|------------|--------------|-------|---------------|
| `starter_monthly` | Starter Plan | $497/month | Monthly |
| `pro_monthly` | Pro Plan | $997/month | Monthly |
| `scale_monthly` | Scale Plan | $1,997/month | Monthly |

### Entitlements

Create an entitlement called `premium` and attach all three products to it.

### Offerings

Create a default offering with all three products available for purchase.

---

## Webhook Configuration

### Endpoint URL

```
https://YOUR_DOMAIN/api/trpc/billing.webhook
```

For staging (replace with your actual staging URL):
```
https://leadengineos.manus.space/api/trpc/billing.webhook
```

### Events to Enable

Enable the following webhook events in RevenueCat Dashboard → Webhooks:

| Event | Purpose |
|-------|---------|
| `INITIAL_PURCHASE` | New subscription created |
| `RENEWAL` | Subscription renewed |
| `CANCELLATION` | Subscription canceled |
| `BILLING_ISSUE` | Payment failed (past_due) |
| `SUBSCRIBER_ALIAS` | User ID mapping |
| `EXPIRATION` | Subscription expired |

### Webhook Payload Format

RevenueCat sends webhooks with the following structure:

```json
{
  "event": {
    "type": "INITIAL_PURCHASE",
    "app_user_id": "tenant_123",
    "product_id": "pro_monthly",
    "purchased_at_ms": 1702684800000,
    "expiration_at_ms": 1705363200000
  }
}
```

The `app_user_id` format is `tenant_{tenantId}` which maps to your database tenant.

---

## Billing Sandbox Test Plan

### Test Scenarios

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | **New Purchase** | Create tenant → Select Pro plan → Complete checkout | Subscription status = `active`, plan = `pro_monthly` |
| 2 | **Successful Renewal** | Wait for renewal or trigger test renewal | Subscription status remains `active`, `currentPeriodEnd` updated |
| 3 | **Payment Failure** | Use test card that declines | Subscription status = `past_due`, portal access restricted |
| 4 | **Cancellation** | Cancel via customer portal | Subscription status = `canceled`, access until period end |
| 5 | **Expiration** | Let canceled subscription expire | Subscription status = `expired`, full access revoked |
| 6 | **Reactivation** | Resubscribe after expiration | New subscription created, status = `active` |

### Test Cards (RevenueCat Sandbox)

| Card Number | Behavior |
|-------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0341` | Attach succeeds, charge fails |
| `4000 0000 0000 9995` | Insufficient funds |

### Entitlement Gating Verification

After each test, verify:

1. **Dashboard Access:** User can/cannot access portal based on subscription status
2. **Request Creation:** User can/cannot create deliverable requests based on status
3. **Quota Display:** Correct plan limits shown in dashboard
4. **Billing Status:** Correct status badge displayed (Active, Past Due, Canceled)

---

## Code Integration Points

### Checkout Flow

```typescript
// Frontend: client/src/pages/Pricing.tsx
const checkout = trpc.billing.createCheckout.useMutation();
await checkout.mutateAsync({ planId: "pro_monthly" });
```

### Customer Portal

```typescript
// Frontend: client/src/pages/Dashboard.tsx
const portal = trpc.billing.createPortal.useMutation();
const { url } = await portal.mutateAsync();
window.location.href = url;
```

### Webhook Handler

```typescript
// Server: server/billingRouter.ts
// Endpoint: POST /api/trpc/billing.webhook
```

### Entitlement Check

```typescript
// Server: server/routers.ts
// tenantProcedure automatically checks subscription status
```

---

## Troubleshooting

### Webhook Not Received

1. Verify webhook URL is correct and publicly accessible
2. Check RevenueCat Dashboard → Webhooks → Recent Events
3. Verify `REVENUECAT_WEBHOOK_SECRET` matches dashboard value

### Signature Verification Failed

1. Ensure raw payload is used for signature verification
2. Check that secret hasn't been rotated without updating env var

### Subscription Status Not Updating

1. Check server logs for webhook processing errors
2. Verify tenant ID extraction from `app_user_id`
3. Confirm database connection is working

---

## Production Checklist

Before going live with billing:

- [ ] All environment variables set in production
- [ ] Webhook URL updated to production domain
- [ ] Test purchase completed successfully
- [ ] Test renewal completed successfully
- [ ] Test cancellation completed successfully
- [ ] Entitlement gating verified for all states
- [ ] Customer portal link working
- [ ] Error handling tested (payment failures)

---

## Support

For RevenueCat-specific issues, consult:
- [RevenueCat Documentation](https://docs.revenuecat.com/)
- [RevenueCat Web SDK Guide](https://docs.revenuecat.com/docs/web)
- [Webhook Integration Guide](https://docs.revenuecat.com/docs/webhooks)
