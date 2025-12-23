import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ArrowRight, Target, Users, TrendingUp, CheckCircle2 } from "lucide-react";

export default function Solutions() {
  const solutions = [
    {
      icon: Target,
      title: "Med Spa Booked Consult Engine",
      slug: "med-spa",
      tagline: "Convert browsers into booked aesthetic consultations",
      description:
        "Purpose-built for medical spas, aesthetic clinics, and cosmetic practices. We create high-intent landing pages for your services (Botox, fillers, laser treatments, body contouring), optimize for local search, and automate content that educates and converts.",
      deliverables: [
        "Service-specific landing pages (Botox, fillers, CoolSculpting, etc.)",
        "Before/after gallery optimization",
        "Treatment education blog content",
        "Local SEO for aesthetic searches",
        "Review request automation",
        "Monthly performance reporting",
      ],
      outcomes: [
        "40-60% increase in consultation bookings",
        "Higher-quality leads (pre-educated, ready to book)",
        "Reduced cost per consultation",
        "Improved show rates",
      ],
    },
    {
      icon: Users,
      title: "Dental Implants Qualified Consult Engine",
      slug: "dental-implants",
      tagline: "Attract qualified implant candidates at scale",
      description:
        "Designed for dental practices focused on implant dentistry, full-arch restoration, and high-value restorative cases. We generate treatment-focused content, dominate local implant searches, and create patient journeys that drive qualified consultations.",
      deliverables: [
        "Implant treatment landing pages (single, multiple, All-on-4)",
        "Patient education content (process, recovery, financing)",
        "Local SEO for implant searches",
        "Competitor analysis and positioning",
        "Internal linking to money pages",
        "Monthly lead quality reports",
      ],
      outcomes: [
        "3-5x more qualified implant leads",
        "Better patient education = higher case acceptance",
        "Reduced time spent on unqualified inquiries",
        "Increased average case value",
      ],
    },
    {
      icon: TrendingUp,
      title: "Multi-location Local Presence Engine",
      slug: "multi-location",
      tagline: "Dominate local search across all your locations",
      description:
        "Built for multi-location practices, franchises, and regional service businesses. We automate NAP consistency, create location-specific content, manage reviews at scale, and ensure every location ranks in the local pack.",
      deliverables: [
        "Location-specific landing pages",
        "NAP consistency audits and fixes",
        "Google Business Profile optimization per location",
        "Location-based blog content",
        "Review monitoring and response templates",
        "Centralized reporting dashboard",
      ],
      outcomes: [
        "Top 3 local pack rankings per location",
        "Consistent 4.5+ star review average",
        "Reduced marketing overhead (no per-location agencies)",
        "Unified brand presence across all markets",
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col" data-surface="marketing">
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="mb-6">Vertical-Specific Growth Engines</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Each engine is purpose-built for your industry with proven templates, vertical-specific strategies, and
              automated fulfillment. Choose one or combine them for multi-service practices.
            </p>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="section-padding">
        <div className="container">
          <div className="space-y-24">
            {solutions.map((solution, index) => (
              <div
                key={solution.slug}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <solution.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="mb-4">{solution.title}</h2>
                  <p className="text-xl text-accent font-medium mb-6">{solution.tagline}</p>
                  <p className="text-lg text-muted-foreground mb-8">{solution.description}</p>
                  <Button asChild size="lg" className="gradient-primary">
                    <Link href={`/solutions/${solution.slug}`}>
                      Learn More
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                </div>

                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle>What You Get</CardTitle>
                      <CardDescription>Monthly deliverables included in your subscription</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-8">
                        {solution.deliverables.map((item) => (
                          <li key={item} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="pt-6 border-t border-border">
                        <h4 className="font-semibold mb-3">Expected Outcomes</h4>
                        <ul className="space-y-2">
                          {solution.outcomes.map((outcome) => (
                            <li key={outcome} className="flex items-start gap-2">
                              <span className="text-primary font-bold shrink-0">→</span>
                              <span className="text-sm text-muted-foreground">{outcome}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="mb-4">Ready to Choose Your Engine?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              All plans include unlimited revisions, priority support, and the ability to pause or cancel anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gradient-primary">
                <Link href="/pricing">
                  View Pricing
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/contact">
                  Talk to Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
