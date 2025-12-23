# Lead Engine OS - WEB DEVELOPMENT TEAM Instructions

**ASSIGNED TO: MyTasker Web Development Team**
**DEADLINE: Complete within 3 days**
**PRIORITY: CRITICAL**

---

## YOUR RESPONSIBILITIES

You are responsible for:
1. Launching the website on leadengineosapp.com
2. Configuring Stripe/RevenueCat for payments
3. Testing that everything works end-to-end

**DO NOT delegate this to the marketing team. This is technical work.**

---

## TASK 1: LAUNCH WEBSITE ON LEADENGINEOSAPP.COM

### Current Situation
- Domain purchased: leadengineosapp.com ✓
- Staging site URL: https://leadeng-os-d8s8haem.manus.space
- Status: Staging site is live and working

### What You Need To Do

**STEP 1: Log into your domain registrar**
- You purchased leadengineosapp.com
- Log into wherever you bought it (GoDaddy, Namecheap, Google Domains, etc.)

**STEP 2: Find DNS settings**
- Look for "DNS Management" or "DNS Settings" or "Nameservers"
- You need to add/edit DNS records

**STEP 3: Contact Manus support for DNS configuration**
- The staging site (https://leadeng-os-d8s8haem.manus.space) needs to be pointed to leadengineosapp.com
- You CANNOT just add a CNAME or A record yourself
- Email: help@manus.im
- Subject: "Point leadengineosapp.com to Manus project"
- Body:
  ```
  Hi Manus Support,
  
  We need to point our custom domain leadengineosapp.com to our Manus project.
  
  Staging URL: https://leadeng-os-d8s8haem.manus.space
  Custom domain: leadengineosapp.com
  
  Please provide DNS configuration instructions.
  
  Thank you
  ```

**STEP 4: Follow Manus instructions**
- They will reply with specific DNS records to add
- It will likely be:
  - A record: @ → [IP address]
  - CNAME record: www → [target]
  - Or custom nameservers

**STEP 5: Add DNS records**
- Go back to your domain registrar DNS settings
- Add the exact records Manus provided
- Save changes

**STEP 6: Wait for propagation**
- DNS changes take 1-24 hours to propagate
- Check status: https://www.whatsmydns.net/#A/leadengineosapp.com
- When it shows the correct IP globally, it's live

**STEP 7: Verify site is live**
- Open https://leadengineosapp.com in incognito browser
- Verify it loads the Lead Engine OS website (not an error page)
- Test: Click around, make sure all pages work
- Test: Try to sign up (don't complete payment yet)

**STEP 8: Confirm completion**
- Email njj1986@gmail.com and task@mytasker.com
- Subject: "Lead Engine OS website is LIVE"
- Include: Screenshot of the live site

---

## TASK 2: CONFIGURE STRIPE/REVENUECAT PAYMENTS

### Current Situation
- KTJ Krug LLC has existing Stripe account
- RevenueCat needs to be set up
- Three pricing tiers: $297, $497, $997/month

### What You Need To Do

**STEP 1: Access KTJ Krug LLC Stripe account**
- Ask client for Stripe login credentials
- OR ask them to add you as a team member
- Email njj1986@gmail.com: "Please add [your email] to KTJ Krug LLC Stripe account as admin"

**STEP 2: Create RevenueCat account**
- Go to: https://app.revenuecat.com/signup
- Sign up with: hello@leadengineosapp.com
- Password: (create strong password, save it)
- Company name: DIS OPTIMUS CAPITAL LLC
- Project name: Lead Engine OS

**STEP 3: Connect Stripe to RevenueCat**
- In RevenueCat dashboard, go to "Integrations"
- Click "Stripe"
- Click "Connect Stripe Account"
- It will redirect to Stripe OAuth
- Log in with KTJ Krug LLC Stripe account
- Authorize RevenueCat to access Stripe

**STEP 4: Create Products in RevenueCat**

**Product 1: Starter**
- Click "Products" in RevenueCat
- Click "Create Product"
- Product ID: `starter_monthly`
- Display name: `Starter Plan`
- Price: `$297.00`
- Billing period: `Monthly`
- Stripe Price ID: (will auto-populate after connecting Stripe)
- Save

**Product 2: Pro**
- Click "Create Product"
- Product ID: `pro_monthly`
- Display name: `Pro Plan`
- Price: `$497.00`
- Billing period: `Monthly`
- Save

**Product 3: Scale**
- Click "Create Product"
- Product ID: `scale_monthly`
- Display name: `Scale Plan`
- Price: `$997.00`
- Billing period: `Monthly`
- Save

**STEP 5: Get RevenueCat API Keys**
- In RevenueCat, go to "Settings" → "API Keys"
- Copy "Public API Key" (starts with `rcpk_`)
- Copy "Secret API Key" (starts with `sk_`)
- **SAVE THESE - YOU'LL NEED THEM**

**STEP 6: Set up Webhook**
- In RevenueCat, go to "Settings" → "Webhooks"
- Click "Add Webhook"
- Webhook URL: `https://leadengineosapp.com/api/trpc/billing.webhook`
- Events: Select ALL events
- Save
- Copy the "Webhook Secret" (starts with `whsec_`)
- **SAVE THIS**

**STEP 7: Provide credentials to client**
- Email njj1986@gmail.com
- Subject: "RevenueCat Credentials for Lead Engine OS"
- Body:
  ```
  RevenueCat setup complete.
  
  Credentials:
  - RevenueCat Public API Key: rcpk_xxxxx
  - RevenueCat Secret API Key: sk_xxxxx
  - Webhook Secret: whsec_xxxxx
  - Webhook URL: https://leadengineosapp.com/api/trpc/billing.webhook
  
  Products created:
  - starter_monthly: $297/month
  - pro_monthly: $497/month
  - scale_monthly: $997/month
  
  Stripe account connected: KTJ Krug LLC
  ```

**STEP 8: Test payment flow**
- Go to https://leadengineosapp.com
- Click "Start Free Trial" or "Pricing"
- Select a plan
- Use Stripe test card: 4242 4242 4242 4242
- Expiry: Any future date
- CVC: Any 3 digits
- Complete signup
- Verify:
  - Payment processes successfully
  - User account is created
  - Subscription shows in Stripe dashboard
  - Webhook fires in RevenueCat

**STEP 9: Document any issues**
- If payment doesn't work, note the error message
- Check browser console for errors (F12 → Console tab)
- Check Stripe dashboard for failed payments
- Email details to njj1986@gmail.com

**STEP 10: Confirm completion**
- Email njj1986@gmail.com and task@mytasker.com
- Subject: "Stripe/RevenueCat integration COMPLETE"
- Include:
  - Screenshot of successful test payment
  - Screenshot of Stripe dashboard showing subscription
  - Confirmation that webhook is working

---

## TASK 3: SSL CERTIFICATE

### What You Need To Do

**STEP 1: Verify SSL is active**
- After domain is pointed, check: https://leadengineosapp.com
- Look for padlock icon in browser
- If you see "Not Secure" warning, SSL is not configured

**STEP 2: Contact Manus if SSL not working**
- Email: help@manus.im
- Subject: "SSL certificate for leadengineosapp.com"
- Body: "Please enable SSL for leadengineosapp.com pointed to our Manus project"

**STEP 3: Wait for SSL provisioning**
- Usually automatic within 1-2 hours
- Check again: https://leadengineosapp.com
- Should show padlock icon

---

## TASK 4: EMAIL FORWARDING VERIFICATION

### Current Situation
- You created: hello@leadengineosapp.com and support@leadengineosapp.com
- Forwarding configured to: ktjkrugllcteam@gmail.com and client's personal email
- Status: Waiting for verification

### What You Need To Do

**STEP 1: Ask client to verify forwarding**
- Email njj1986@gmail.com
- Subject: "Please verify email forwarding for Lead Engine OS"
- Body:
  ```
  We've set up email forwarding for:
  - hello@leadengineosapp.com
  - support@leadengineosapp.com
  
  Please check ktjkrugllcteam@gmail.com and your personal email for verification links from Google Workspace.
  
  Click the verification links to activate forwarding.
  
  Let us know when complete.
  ```

**STEP 2: Test email forwarding**
- After client confirms verification
- Send test email to hello@leadengineosapp.com
- Ask client: "Did you receive it?"
- If yes: ✓ Complete
- If no: Check Google Workspace forwarding settings

---

## TROUBLESHOOTING

### Problem: Domain not pointing to site after 24 hours

**Solution:**
1. Check DNS records at registrar - are they correct?
2. Check DNS propagation: https://www.whatsmydns.net
3. Contact Manus support: help@manus.im
4. Provide them with:
   - Domain: leadengineosapp.com
   - Current DNS records (screenshot)
   - Error message when visiting site

### Problem: SSL certificate not working

**Solution:**
1. Wait 2-4 hours after DNS propagation
2. Clear browser cache
3. Try incognito browser
4. If still not working, contact Manus support

### Problem: Payment fails during test

**Solution:**
1. Check browser console for errors (F12 → Console)
2. Check Stripe dashboard → Logs
3. Verify RevenueCat webhook URL is correct
4. Verify API keys are correct
5. Try different browser
6. Email error details to njj1986@gmail.com

### Problem: RevenueCat webhook not firing

**Solution:**
1. In RevenueCat, go to Settings → Webhooks
2. Click "Test Webhook"
3. Check if it returns 200 OK
4. If error, check webhook URL is exactly: https://leadengineosapp.com/api/trpc/billing.webhook
5. Contact client if webhook endpoint is not working

---

## COMPLETION CHECKLIST

Before marking this complete, verify:

- [ ] leadengineosapp.com loads the website (not staging URL)
- [ ] SSL certificate is active (padlock icon in browser)
- [ ] All pages load correctly (no 404 errors)
- [ ] RevenueCat account created and connected to Stripe
- [ ] Three products created: $297, $497, $997/month
- [ ] Webhook configured and tested
- [ ] Test payment completed successfully
- [ ] Subscription shows in Stripe dashboard
- [ ] Email forwarding verified and working
- [ ] Client has been provided all credentials
- [ ] Screenshots sent to client showing everything works

---

## TIMELINE

- **Day 1:** Contact Manus for DNS config, start RevenueCat setup
- **Day 2:** DNS propagates, SSL activates, complete RevenueCat
- **Day 3:** Test everything, confirm completion

**DO NOT DELAY. This is blocking the marketing launch.**

---

## CONTACT INFO

**Questions about technical setup:**
- Manus Support: help@manus.im

**Questions about requirements:**
- Client: njj1986@gmail.com

**Report completion to:**
- njj1986@gmail.com
- task@mytasker.com

---

**REMINDER: You are the WEB DEVELOPMENT TEAM. Do not pass this to marketing team. This requires technical expertise.**
