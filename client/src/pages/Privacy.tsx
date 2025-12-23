import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col" data-surface="marketing">
      <Navigation />

      <div className="pt-24 pb-16 flex-1">
        <div className="container max-w-4xl">
          <h1 className="mb-8">Privacy Policy</h1>

          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-muted-foreground mb-8">
              Effective date: December 15, 2024
            </p>

            <p>
              This Privacy Policy explains how Kiasu Family Trust ("Company", "we", "us") collects, uses, and shares information when you use Lead Engine OS ("Service").
            </p>

            <h2>Information We Collect</h2>
            <ul>
              <li>Account information (name, email, login credentials)</li>
              <li>Billing and subscription information (handled through our billing provider)</li>
              <li>Usage data (pages visited, actions in the portal, request history)</li>
              <li>Content you submit through forms or the portal</li>
              <li>Technical data (IP address, device/browser metadata)</li>
            </ul>

            <h2>How We Use Information</h2>
            <ul>
              <li>To provide and operate the Service</li>
              <li>To process subscriptions and manage accounts</li>
              <li>To deliver requested work and communicate status updates</li>
              <li>To improve reliability, security, and performance</li>
              <li>To comply with legal obligations</li>
            </ul>

            <h2>How We Share Information</h2>
            <p>
              We share data with service providers that help us operate the Service, such as billing, hosting, analytics, and email delivery providers.
            </p>
            <p>
              <strong>We do not sell personal data.</strong>
            </p>

            <h2>Service Providers</h2>
            <ul>
              <li><strong>RevenueCat/Stripe:</strong> Payment processing</li>
              <li><strong>n8n:</strong> Workflow automation</li>
              <li><strong>OpenAI:</strong> Content generation</li>
              <li><strong>Manus:</strong> Hosting and infrastructure</li>
            </ul>

            <h2>Data Retention</h2>
            <p>
              We retain data as long as needed to provide the Service and comply with legal obligations.
            </p>

            <h2>Security</h2>
            <p>
              We use reasonable safeguards including encryption in transit (TLS/SSL), secure authentication (OAuth 2.0), and access controls. No method of transmission is 100% secure.
            </p>

            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Export:</strong> Download your generated content</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails</li>
            </ul>

            <h2>Cookies</h2>
            <p>We use cookies for:</p>
            <ul>
              <li><strong>Essential:</strong> Authentication and session management (required)</li>
              <li><strong>Analytics:</strong> Usage statistics and performance monitoring</li>
              <li><strong>Preferences:</strong> Theme and language settings</li>
            </ul>
            <p>You can control cookies through your browser settings.</p>

            <h2>Jurisdiction (Puerto Rico)</h2>
            <p>
              This Service is operated from Puerto Rico. If you access the Service from outside Puerto Rico, you understand that your information may be processed and stored in Puerto Rico and other locations where our service providers operate.
            </p>

            <h2>Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Continued use after changes constitutes acceptance.
            </p>

            <h2>Contact</h2>
            <p>
              Privacy requests: privacy@leadengine.kiasufamilytrust.org
              <br />
              Support: support@leadengine.kiasufamilytrust.org
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
