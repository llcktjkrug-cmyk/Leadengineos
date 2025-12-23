# Lead Engine OS - Domain & SSL Setup Guide

**Prepared for:** MyTasker  
**Domain:** leadengineos.com  
**Date:** December 15, 2025

---

## Overview

This guide covers the complete domain registration and SSL certificate setup for Lead Engine OS. The domain will be registered with WHOIS privacy protection and configured with placeholder DNS records until the production server is ready.

---

## Part 1: Domain Registration

### 1.1 Domain Details

| Field | Value |
|-------|-------|
| Domain | `leadengineos.com` |
| Registrar | Namecheap, Cloudflare, or GoDaddy |
| Registration Period | 1 year (with auto-renewal) |
| WHOIS Privacy | **Enabled** (required) |

### 1.2 Registration Steps

1. Go to your preferred registrar (Namecheap recommended for privacy)
2. Search for `leadengineos.com`
3. Add to cart and proceed to checkout
4. **Enable WHOIS Privacy Protection** (usually called "WhoisGuard" or "Domain Privacy")
5. Complete purchase

### 1.3 Registrant Information

Use the following for registration (will be hidden by WHOIS privacy):

| Field | Value |
|-------|-------|
| Organization | Kiasu Family Trust |
| Country | Puerto Rico, US |
| Email | njj1986@gmail.com |

---

## Part 2: Initial DNS Configuration

### 2.1 Placeholder Records

Configure these DNS records immediately after registration. These are **placeholder records** that prevent the domain from being hijacked while we prepare the production server.

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | 127.0.0.1 | 3600 |
| A | www | 127.0.0.1 | 3600 |
| A | app | 127.0.0.1 | 3600 |

**Important:** These placeholder records point to localhost (127.0.0.1) and will be updated to the actual server IP when ready for production.

### 2.2 Anti-Spoofing Email Records

Add these TXT records to **block all email** from this domain until a real email sender is configured. This prevents email spoofing/phishing while the domain is in staging:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| TXT | @ | `v=spf1 -all` | 3600 |
| TXT | _dmarc | `v=DMARC1; p=reject;` | 3600 |

**What these records do:**
- **SPF `-all`** — Tells receiving mail servers that NO servers are authorized to send email for this domain. Any email claiming to be from `leadengineos.com` will fail SPF checks.
- **DMARC `p=reject`** — Instructs receiving mail servers to reject (not quarantine) any email that fails authentication.

**When to update:** These records will be replaced with proper email authentication (SPF allow, DKIM, DMARC reporting) when an email provider is configured post-launch.

### 2.3 What NOT to Configure Yet

Do **NOT** add the following records at this stage:

- **No MX records** (email receiving will be configured later)
- **No DKIM records** (requires email provider setup)

Email sending configuration will be added after launch when the email provider is finalized.

---

## Part 3: Production DNS Configuration

When the DigitalOcean server is ready, update the DNS records as follows:

### 3.1 Production A Records

Replace the placeholder records with the actual server IP:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | YOUR_DROPLET_IP | 300 |
| A | www | YOUR_DROPLET_IP | 300 |
| A | app | YOUR_DROPLET_IP | 300 |

### 3.2 Verification

After updating DNS, verify propagation:

```bash
# Check A record
dig leadengineos.com A +short

# Check www subdomain
dig www.leadengineos.com A +short

# Check app subdomain
dig app.leadengineos.com A +short
```

DNS propagation typically takes 5-30 minutes, but can take up to 48 hours in rare cases.

---

## Part 4: SSL Certificate Setup

### 4.1 Prerequisites

Before obtaining SSL certificates, ensure:

1. DNS records point to the production server IP
2. Nginx is installed and running on the server
3. Ports 80 and 443 are open in the firewall

### 4.2 Install Certbot

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

### 4.3 Obtain Certificates

Run Certbot with the Nginx plugin:

```bash
sudo certbot --nginx -d leadengineos.com -d www.leadengineos.com -d app.leadengineos.com
```

When prompted:

1. Enter email address: `njj1986@gmail.com`
2. Agree to terms of service: `Y`
3. Share email with EFF: `N` (optional)
4. Redirect HTTP to HTTPS: `2` (Yes, redirect)

### 4.4 Verify Certificate

```bash
# Check certificate details
sudo certbot certificates

# Test SSL configuration
curl -I https://leadengineos.com
```

### 4.5 Auto-Renewal

Certbot automatically sets up a cron job for renewal. Verify it works:

```bash
sudo certbot renew --dry-run
```

### 4.6 Certificate Renewal Schedule

Let's Encrypt certificates are valid for 90 days. Certbot will automatically renew them when they have less than 30 days remaining. The renewal check runs twice daily via systemd timer.

---

## Part 5: Cloudflare Alternative (Optional)

If you prefer to use Cloudflare for DNS and SSL, follow these steps instead:

### 5.1 Add Domain to Cloudflare

1. Create a Cloudflare account at cloudflare.com
2. Add `leadengineos.com` as a new site
3. Select the Free plan
4. Cloudflare will scan existing DNS records

### 5.2 Update Nameservers

At your registrar (Namecheap/GoDaddy), change nameservers to:

```
ns1.cloudflare.com
ns2.cloudflare.com
```

(Actual nameservers will be provided by Cloudflare during setup)

### 5.3 Cloudflare DNS Records

In Cloudflare DNS settings, add:

| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| A | @ | YOUR_DROPLET_IP | Proxied (orange cloud) |
| A | www | YOUR_DROPLET_IP | Proxied (orange cloud) |
| A | app | YOUR_DROPLET_IP | Proxied (orange cloud) |

### 5.4 Cloudflare SSL Settings

1. Go to SSL/TLS → Overview
2. Set encryption mode to **Full (strict)**
3. Enable "Always Use HTTPS"
4. Enable "Automatic HTTPS Rewrites"

With Cloudflare, you don't need Certbot on the server—Cloudflare handles SSL termination.

---

## Part 6: Verification Checklist

After completing domain and SSL setup, verify the following:

| Check | Command/Action | Expected Result |
|-------|----------------|-----------------|
| Domain resolves | `dig leadengineos.com A` | Returns server IP |
| HTTPS works | `curl -I https://leadengineos.com` | HTTP/2 200 |
| HTTP redirects | `curl -I http://leadengineos.com` | HTTP/1.1 301 → HTTPS |
| Certificate valid | Browser padlock icon | Green/valid |
| WHOIS privacy | `whois leadengineos.com` | Shows privacy service |
| www works | `curl -I https://www.leadengineos.com` | HTTP/2 200 |
| app subdomain | `curl -I https://app.leadengineos.com` | HTTP/2 200 |

---

## Part 7: Timeline

| Phase | Action | Status |
|-------|--------|--------|
| Day 1 | Register domain with WHOIS privacy | Pending |
| Day 1 | Configure placeholder A records (127.0.0.1) | Pending |
| Day 2-3 | Deploy application to DigitalOcean | Pending |
| Day 3 | Update DNS to production server IP | Pending |
| Day 3 | Obtain SSL certificate via Certbot | Pending |
| Day 3 | Verify HTTPS and redirects | Pending |
| Day 4+ | Configure email DNS (post-launch) | Future |

---

## Notes

1. **No live pointing yet:** The domain uses placeholder records (127.0.0.1) until the production server is ready.

2. **No email DNS:** Email-related records (MX, SPF, DKIM, DMARC) will be configured after launch when the email provider is selected.

3. **WHOIS privacy is mandatory:** This protects the registrant's personal information from public WHOIS lookups.

4. **SSL is free:** Let's Encrypt provides free SSL certificates that auto-renew every 90 days.

5. **Cloudflare is optional:** If using Cloudflare, SSL is handled automatically and you get additional benefits like DDoS protection and CDN caching.
