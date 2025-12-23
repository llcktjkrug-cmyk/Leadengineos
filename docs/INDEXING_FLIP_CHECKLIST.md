# Staging to Production Indexing Flip Checklist

## Overview

Lead Engine OS uses a dual-layer indexing control system:
1. **Server-side**: X-Robots-Tag HTTP header (set in `server/_core/index.ts`)
2. **Client-side**: Dynamic meta robots tags (managed by `RobotsMetaTag.tsx`)

Both are controlled by the `VITE_ENVIRONMENT` environment variable.

---

## Current State: STAGING

When `VITE_ENVIRONMENT=staging` (default):
- ✅ X-Robots-Tag: noindex, nofollow (HTTP header)
- ✅ Meta robots: noindex, nofollow (HTML)
- ✅ Search engines blocked from indexing
- ✅ Safe for testing without SEO impact

---

## Flip to Production Checklist

### Pre-Flight Checks

- [ ] All critical bugs fixed
- [ ] Security audit passed (see `SECURITY_AUDIT_REPORT_V2.md`)
- [ ] RevenueCat billing configured and tested
- [ ] WordPress connection flow tested
- [ ] All tests passing (`pnpm test`)
- [ ] Domain DNS configured and propagated
- [ ] SSL certificate active

### Environment Variable Change

**In your hosting environment (DigitalOcean, etc.), set:**

```bash
VITE_ENVIRONMENT=production
```

### Verification Steps

After setting `VITE_ENVIRONMENT=production`:

1. **Check HTTP Headers**
   ```bash
   curl -I https://leadengineos.com | grep -i robots
   # Should NOT contain X-Robots-Tag header
   ```

2. **Check HTML Meta Tags**
   - Open browser DevTools → Elements
   - Search for `<meta name="robots"`
   - Should NOT exist in production

3. **Check robots.txt**
   ```bash
   curl https://leadengineos.com/robots.txt
   ```
   Expected output:
   ```
   User-agent: *
   Allow: /
   Sitemap: https://leadengineos.com/sitemap.xml
   ```

4. **Check Sitemap**
   ```bash
   curl https://leadengineos.com/sitemap.xml
   ```
   Should return valid XML sitemap

5. **Google Search Console**
   - Submit sitemap URL
   - Request indexing for homepage
   - Monitor for crawl errors

---

## Rollback to Staging

If you need to block indexing again:

```bash
VITE_ENVIRONMENT=staging
```

Then restart the server. Indexing will be blocked immediately via HTTP headers.

---

## Files Involved

| File | Purpose |
|------|---------|
| `server/_core/env.ts` | Defines `ENV.isStaging` based on `VITE_ENVIRONMENT` |
| `server/_core/index.ts` | Adds X-Robots-Tag header when staging |
| `client/src/components/RobotsMetaTag.tsx` | Manages meta robots tags dynamically |
| `client/src/App.tsx` | Mounts RobotsMetaTag component |
| `server/sitemap.ts` | Serves robots.txt and sitemap.xml |

---

## Security Note

The `VITE_ENVIRONMENT` variable is safe to expose to the client (it's not a secret). It only controls indexing behavior, not authentication or access control.
