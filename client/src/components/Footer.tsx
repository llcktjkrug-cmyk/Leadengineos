import { Link } from "wouter";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">L</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base leading-none">Lead Engine OS</span>
                <span className="text-xs text-muted-foreground leading-none mt-1">
                  Done-for-you growth subscriptions
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Lead Engine OS is a subscription fulfillment system for growth work.
              We deliver landing pages, blog content, and SEO improvements on a predictable monthly cadence.
              Clear quotas. Clear status. Built for operators.
            </p>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Solutions</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/solutions/med-spa"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Med Spa Engine
                </Link>
              </li>
              <li>
                <Link 
                  href="/solutions/dental-implants"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dental Implants Engine
                </Link>
              </li>
              <li>
                <Link 
                  href="/solutions/multi-location"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Multi-location Engine
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link 
                  href="/proof"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Proof
                </Link>
              </li>
              <li>
                <Link 
                  href="/blog"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  href="/cookie"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
            <p className="text-xs text-muted-foreground mt-4">
              We operate from Puerto Rico.
            </p>
          </div>
        </div>

        {/* Trust signals */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mb-6">
            <span className="text-xs text-muted-foreground">
              Built for operators who want predictable output, not endless meetings
            </span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            © {currentYear} Lead Engine OS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
