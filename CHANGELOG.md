# Changelog

All notable changes to Lead Engine OS are documented in this file.

## [Calm CSS v1] - 2025-12-15

### Design System Overhaul

This release introduces a calmer, more professional design system inspired by Stripe and Linear. The goal is to build trust through restraint rather than flashy animations.

### Visual Changes

**Color Palette**
- Primary: Muted indigo (`oklch(0.55 0.15 265)`) replacing bright blue
- Accent: Soft teal for secondary actions
- Background: Warm off-white (`oklch(0.985 0.002 90)`)
- Reduced saturation across all semantic colors
- OKLCH color format for better perceptual uniformity

**Typography**
- Restrained heading sizes (h1: 2.75rem, h2: 2rem, h3: 1.5rem)
- Improved letter-spacing for readability
- System font stack with Inter as primary

**Shadows & Depth**
- Soft, subtle shadows replacing heavy drop shadows
- Reduced blur radius on all shadow utilities
- No infinite animations or heavy blur filters

**Spacing**
- Consistent section padding (py-16 to py-24)
- Tighter component spacing
- Better visual hierarchy

### Staging Safeguards

**Staging Banner**
- Amber banner at top of all pages in staging environments
- Detects staging via hostname (manus, localhost, 127.0.0.1)
- Automatically hidden in production (custom domain)

**SEO Protection**
- `noindex, nofollow` meta tags in index.html
- Dynamic robots.txt endpoint blocks crawlers in staging
- **IMPORTANT:** Remove noindex tags before production launch

### Files Changed

- `client/src/index.css` - Complete design system rewrite
- `client/src/components/Navigation.tsx` - Added staging banner logic
- `client/index.html` - Added noindex meta tags

### Performance Improvements

- Removed all infinite CSS animations
- Removed heavy backdrop-blur filters
- Simplified gradient backgrounds
- Reduced CSS file size

### Accessibility

- Improved button contrast ratios
- Better focus states on interactive elements
- Semantic color naming for status indicators

---

## Production Launch Checklist

Before going live, complete these steps:

1. **Remove staging meta tags** from `client/index.html`:
   ```html
   <!-- DELETE THESE LINES -->
   <meta name="robots" content="noindex, nofollow" />
   <meta name="googlebot" content="noindex, nofollow" />
   ```

2. **Configure custom domain** in Manus Settings → Domains

3. **Add RevenueCat credentials** in Settings → Secrets:
   - REVENUECAT_PROJECT_ID
   - REVENUECAT_PUBLIC_KEY
   - REVENUECAT_SECRET_KEY
   - REVENUECAT_WEBHOOK_SECRET

4. **Test checkout flow** end-to-end before announcing

5. **Verify staging banner is hidden** on production domain
