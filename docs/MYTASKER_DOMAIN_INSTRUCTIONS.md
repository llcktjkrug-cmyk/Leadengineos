# COPY/PASTE INSTRUCTIONS FOR MYTASKER: BUY DOMAIN + PREP DNS (DO NOT POINT LIVE YET)

**Date:** December 15, 2025  
**Project:** Lead Engine OS  
**Target Domain:** leadengine.kiasufamilytrust.org (or alternative)

---

## IMPORTANT: DO NOT POINT LIVE YET

This task is to **purchase and prepare** the domain only. Do NOT point any DNS records to production servers yet. The staging environment must remain isolated until billing is configured and tested.

---

## Task 1: Purchase Domain (if not already owned)

### Option A: Use Existing Domain

If `kiasufamilytrust.org` is already owned, skip to Task 2.

### Option B: Purchase New Domain

**Registrar:** Namecheap, Cloudflare, or Google Domains

**Domain to purchase:** `leadengine.io` or `leadengineos.com` (if kiasufamilytrust.org subdomain not preferred)

**Requirements:**
- [ ] **⚠️ CRITICAL: Enable WHOIS Privacy Protection** (free on most registrars) — This MUST be enabled to protect owner identity
- [ ] Use registrar's default nameservers for now
- [ ] Set auto-renew to ON
- [ ] **SKIP 2FA setup for now** (can be enabled after launch)

**WHOIS Privacy is REQUIRED** — Without it, owner name, address, email, and phone will be publicly visible in WHOIS records.

---

## Task 2: Create Placeholder DNS Records

Create the following DNS records but **DO NOT point them to production yet**. Use placeholder IPs.

### Required Records

| Type | Host | Value | TTL | Notes |
|------|------|-------|-----|-------|
| A | `@` | `127.0.0.1` | 3600 | Placeholder - DO NOT USE REAL IP |
| A | `www` | `127.0.0.1` | 3600 | Placeholder - DO NOT USE REAL IP |
| A | `app` | `127.0.0.1` | 3600 | Placeholder - DO NOT USE REAL IP |
| A | `api` | `127.0.0.1` | 3600 | Placeholder - DO NOT USE REAL IP |
| A | `staging` | `127.0.0.1` | 3600 | Placeholder - DO NOT USE REAL IP |
| TXT | `@` | `v=spf1 -all` | 3600 | Anti-spoofing - blocks all email |
| TXT | `_dmarc` | `v=DMARC1; p=reject;` | 3600 | Anti-spoofing - rejects spoofed email |

**Note:** The TXT records above are **anti-spoofing** records that block ALL email from this domain. This prevents email spoofing/phishing while in staging. They will be updated when a real email provider is configured.

### Why Placeholders?

Using `127.0.0.1` (localhost) ensures:
1. Domain is configured and ready
2. No traffic can accidentally reach production
3. DNS propagation happens before we need it
4. Easy to update when ready to go live

---

## Task 3: Verify Configuration

After creating records, verify:

- [ ] WHOIS shows privacy protection enabled
- [ ] DNS records are created (use `dig` or DNS checker)
- [ ] No records point to real production servers
- [ ] Auto-renew is enabled

### Verification Commands

```bash
# Check A record
dig leadengine.kiasufamilytrust.org A

# Check www record
dig www.leadengine.kiasufamilytrust.org A

# Check WHOIS privacy
whois leadengine.kiasufamilytrust.org | grep -i "privacy\|redacted"
```

---

## Task 4: Document Access Credentials

Store the following securely (NOT in this document):

- [ ] Registrar login URL
- [ ] Registrar username
- [ ] Registrar password (in password manager)
- [ ] Domain expiration date
- [ ] Nameserver addresses

---

## What NOT To Do

| Action | Reason |
|--------|--------|
| ❌ Point DNS to production IP | Staging must remain isolated |
| ❌ Enable 2FA | Can complicate handoff; enable after launch |
| ❌ Configure SSL/TLS | Will be handled by hosting platform |
| ❌ Set up email forwarding | Not needed yet |
| ❌ Transfer domain | Keep at current registrar for now |
| ❌ Add MX records | Email receiving not configured yet |
| ❌ Add DKIM records | Requires email provider setup |

---

## Confirmation Checklist

When complete, confirm:

- [ ] Domain purchased or subdomain available
- [ ] WHOIS privacy enabled
- [ ] Placeholder DNS records created (A records + anti-spoofing TXT)
- [ ] **Nothing points to production yet**
- [ ] Anti-spoofing TXT records added (SPF -all, DMARC reject)
- [ ] Auto-renew enabled
- [ ] Credentials documented securely

---

## Next Steps (NOT for MyTasker)

After this task is complete, the following will be done by the development team:

1. Configure RevenueCat billing
2. Test checkout flow
3. Update DNS to point to production
4. Configure SSL/TLS
5. Go live

---

## Contact

If questions arise during this task, contact the project owner before making changes that could affect production.

**DO NOT POINT LIVE YET.**
