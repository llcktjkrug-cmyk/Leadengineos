import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export default function Cookie() {
  return (
    <div className="min-h-screen flex flex-col" data-surface="marketing">
      <Navigation />

      <div className="pt-24 pb-16 flex-1">
        <div className="container max-w-4xl">
          <h1 className="mb-8">Cookie Policy</h1>

          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-muted-foreground mb-8">
              Effective date: December 15, 2024
            </p>

            <p>
              Lead Engine OS uses cookies and similar technologies to operate the site and improve the Service.
            </p>

            <h2>What Cookies We Use</h2>
            <ul>
              <li><strong>Essential cookies:</strong> Required for login and core functionality</li>
              <li><strong>Analytics cookies:</strong> Help us understand usage and improve performance</li>
              <li><strong>Preference cookies:</strong> Remember settings like theme preference</li>
            </ul>

            <h2>Essential Cookies (Required)</h2>
            <p>These cookies are necessary for the Service to function:</p>
            <ul>
              <li><strong>Session Cookie:</strong> Maintains your login session</li>
              <li><strong>Security Cookie:</strong> Prevents cross-site request forgery (CSRF)</li>
            </ul>
            <p>You cannot opt-out of essential cookies without affecting functionality.</p>

            <h2>Analytics Cookies (Optional)</h2>
            <p>These cookies help us understand how you use the Service:</p>
            <ul>
              <li><strong>Usage Analytics:</strong> Pages visited, features used, time spent</li>
              <li><strong>Performance Monitoring:</strong> Load times, errors</li>
            </ul>
            <p>You can opt-out of analytics cookies through your browser settings.</p>

            <h2>Third-Party Services</h2>
            <p>We may use third-party services that set their own cookies:</p>
            <ul>
              <li><strong>RevenueCat:</strong> Payment processing and subscription management</li>
              <li><strong>Manus Analytics:</strong> Usage tracking and performance monitoring</li>
            </ul>

            <h2>Managing Cookies</h2>
            <p>
              You can control cookies through your browser settings.
              If you disable certain cookies, parts of the Service may not function properly.
            </p>

            <h2>Jurisdiction (Puerto Rico)</h2>
            <p>
              This site is operated from Puerto Rico.
            </p>

            <h2>Contact</h2>
            <p>
              Questions: privacy@leadengine.kiasufamilytrust.org
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
