/**
 * Email notification system with SMTP adapter
 * Routes notifications to njj1986@gmail.com for v1
 * Extensible for future email providers (SendGrid, AWS SES, etc.)
 */

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email notification
 * Currently logs to console and returns success
 * TODO: Integrate actual SMTP provider or Gmail OAuth
 */
export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    console.log("[Email] Sending email:", {
      to: params.to,
      subject: params.subject,
      preview: params.text?.substring(0, 100) || params.html.substring(0, 100),
    });

    // TODO: Implement actual email sending
    // For now, just log and return success
    // In production, integrate with:
    // - Gmail OAuth (for njj1986@gmail.com)
    // - SendGrid API
    // - AWS SES
    // - Or other SMTP provider

    return true;
  } catch (error) {
    console.error("[Email] Failed to send email:", error);
    return false;
  }
}

/**
 * Send subscription status change notification
 */
export async function sendSubscriptionNotification(
  tenantName: string,
  status: string,
  plan: string
): Promise<boolean> {
  return sendEmail({
    to: "njj1986@gmail.com",
    subject: `Subscription ${status}: ${tenantName}`,
    html: `
      <h2>Subscription Status Change</h2>
      <p><strong>Tenant:</strong> ${tenantName}</p>
      <p><strong>Status:</strong> ${status}</p>
      <p><strong>Plan:</strong> ${plan}</p>
      <p>View details in the admin portal.</p>
    `,
    text: `Subscription ${status} for ${tenantName} (${plan})`,
  });
}

/**
 * Send deliverable completion notification
 */
export async function sendDeliverableNotification(
  tenantName: string,
  deliverableType: string,
  deliverableTitle: string
): Promise<boolean> {
  return sendEmail({
    to: "njj1986@gmail.com",
    subject: `Deliverable Complete: ${deliverableTitle}`,
    html: `
      <h2>Deliverable Completed</h2>
      <p><strong>Tenant:</strong> ${tenantName}</p>
      <p><strong>Type:</strong> ${deliverableType}</p>
      <p><strong>Title:</strong> ${deliverableTitle}</p>
      <p>The deliverable is ready for review in the client portal.</p>
    `,
    text: `Deliverable completed for ${tenantName}: ${deliverableTitle}`,
  });
}

/**
 * Send onboarding step notification
 */
export async function sendOnboardingNotification(
  tenantName: string,
  step: string,
  message: string
): Promise<boolean> {
  return sendEmail({
    to: "njj1986@gmail.com",
    subject: `Onboarding: ${tenantName} - ${step}`,
    html: `
      <h2>Onboarding Update</h2>
      <p><strong>Tenant:</strong> ${tenantName}</p>
      <p><strong>Step:</strong> ${step}</p>
      <p>${message}</p>
    `,
    text: `Onboarding update for ${tenantName}: ${step} - ${message}`,
  });
}

/**
 * Send weekly report notification
 */
export async function sendWeeklyReport(
  tenantName: string,
  reportData: {
    deliverables: number;
    traffic: number;
    conversions: number;
    notes: string;
  }
): Promise<boolean> {
  return sendEmail({
    to: "njj1986@gmail.com",
    subject: `Weekly Report: ${tenantName}`,
    html: `
      <h2>Weekly Report for ${tenantName}</h2>
      <h3>Summary</h3>
      <ul>
        <li><strong>Deliverables Completed:</strong> ${reportData.deliverables}</li>
        <li><strong>Traffic:</strong> ${reportData.traffic} visits</li>
        <li><strong>Conversions:</strong> ${reportData.conversions}</li>
      </ul>
      <h3>Notes</h3>
      <p>${reportData.notes}</p>
    `,
    text: `Weekly report for ${tenantName}: ${reportData.deliverables} deliverables, ${reportData.traffic} visits, ${reportData.conversions} conversions`,
  });
}

/**
 * Send lead submission notification
 */
export async function sendLeadNotification(
  name: string,
  email: string,
  phone: string | null,
  message: string | null,
  source: string
): Promise<boolean> {
  return sendEmail({
    to: "njj1986@gmail.com",
    subject: `New Lead: ${name}`,
    html: `
      <h2>New Lead Submitted</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
      ${message ? `<p><strong>Message:</strong> ${message}</p>` : ""}
      <p><strong>Source:</strong> ${source}</p>
    `,
    text: `New lead from ${name} (${email}) via ${source}`,
  });
}
