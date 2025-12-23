import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { getLoginUrl } from "@/const";

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Solutions", href: "/solutions" },
    { name: "Pricing", href: "/pricing" },
    { name: "Proof", href: "/proof" },
    { name: "Blog", href: "/blog" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  // Show staging label in non-production environments
  const isStaging = typeof window !== 'undefined' && 
    (window.location.hostname.includes('manus') || 
     window.location.hostname.includes('localhost') ||
     window.location.hostname.includes('127.0.0.1'));

  return (
    <>
      {isStaging && (
        <div className="bg-amber-500 text-amber-950 text-center py-1 text-xs font-medium">
          STAGING ENVIRONMENT - Not indexed by search engines
        </div>
      )}
      <nav className={`fixed ${isStaging ? 'top-6' : 'top-0'} left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border`}>
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">L</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none">Lead Engine OS</span>
              <span className="text-xs text-muted-foreground leading-none">Done-for-you growth subscriptions</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link 
                key={item.name} 
                href={item.href}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Button asChild variant="ghost" size="sm">
              <a href={getLoginUrl()}>Sign In</a>
            </Button>
            <Button asChild size="sm" className="gradient-primary">
              <Link href="/pricing">View Plans</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-border flex flex-col space-y-2">
                <Button asChild variant="ghost" size="sm" className="w-full">
                  <a href={getLoginUrl()}>Sign In</a>
                </Button>
                <Button asChild size="sm" className="w-full gradient-primary">
                  <Link href="/pricing">View Plans</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
    </>
  );
}
