import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ArrowRight, CheckCircle2, Target, TrendingUp, Users, FileText, Search, MapPin, Link2 } from "lucide-react";

export default function Home() {
  const monthlyDeliverables = [
    {
      icon: FileText,
      item: "Landing pages",
      quota: "Up to 10/month",
      description: "Treatment pages, service pages, location pages",
    },
    {
      icon: FileText,
      item: "Blog posts",
      quota: "Up to 16/month",
      description: "SEO-optimized content for your industry",
    },
    {
      icon: Search,
      item: "SEO improvements",
      quota: "Up to 50/month",
      description: "Meta tags, schema, technical fixes",
    },
    {
      icon: Link2,
      item: "Internal linking",
      quota: "Up to 30/month",
      description: "Strategic link structure updates",
    },
    {
      icon: MapPin,
      item: "Local presence ops",
      quota: "Daily to weekly",
      description: "GBP updates, citations, NAP consistency",
    },
  ];

  const howItWorksSteps = [
    {
      step: "1",
      title: "Connect your site",
      description: "We integrate with your WordPress, Webflow, or custom site. Or we host a site for you.",
    },
    {
      step: "2",
      title: "Set your preferences",
      description: "Choose your vertical, target services, locations, and content priorities. Takes about 15 minutes.",
    },
    {
      step: "3",
      title: "Receive monthly deliverables",
      description: "Content publishes on schedule. Track everything in your dashboard. Request changes anytime.",
    },
  ];

  const offers = [
    {
      icon: Target,
      title: "Med Spa Booked Consult Engine",
      description:
        "Convert browsers into booked consultations with high-intent landing pages, SEO-optimized content, and automated follow-up systems designed for aesthetic medicine.",
      outcomes: ["40-60% increase in consultation bookings", "Reduced cost per lead", "Higher show rates"],
      href: "/solutions/med-spa",
    },
    {
      icon: Users,
      title: "Dental Implants Qualified Consult Engine",
      description:
        "Attract qualified implant candidates with treatment-focused content, local SEO dominance, and conversion-optimized patient journeys that drive high-value consultations.",
      outcomes: ["3-5x more qualified implant leads", "Better patient education", "Increased case acceptance"],
      href: "/solutions/dental-implants",
    },
    {
      icon: TrendingUp,
      title: "Multi-location Local Presence Engine",
      description:
        "Dominate local search across all locations with automated NAP consistency, location-specific content, review management, and unified brand presence at scale.",
      outcomes: ["Top 3 local rankings per location", "Consistent 4.5+ star reviews", "Reduced marketing overhead"],
      href: "/solutions/multi-location",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col" data-surface="marketing">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-balance mb-6">
              Marketing fulfillment
              <br />
              <span className="text-primary">that runs itself.</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 text-balance max-w-3xl mx-auto">
              Landing pages, blog content, and SEO improvements delivered monthly. Set your preferences once, receive
              deliverables on schedule. Pause or cancel anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gradient-primary text-lg px-8">
                <Link href="/pricing">
                  View Plans
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8">
                <Link href="/proof">
                  See Benchmarks
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get Monthly */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="mb-4">What you get every month</h2>
            <p className="text-lg text-muted-foreground">
              Clear quotas. Predictable delivery. No surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {monthlyDeliverables.map((d) => (
              <Card key={d.item} className="text-center">
                <CardContent className="pt-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <d.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="font-medium mb-1">{d.item}</div>
                  <Badge variant="secondary" className="mb-2">{d.quota}</Badge>
                  <p className="text-xs text-muted-foreground">{d.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Quotas vary by plan. <Link href="/pricing" className="text-primary hover:underline">Compare plans</Link>
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="mb-4">How it works</h2>
            <p className="text-lg text-muted-foreground">
              Three steps to automated marketing fulfillment.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {howItWorksSteps.map((step) => (
              <div key={step.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-semibold">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button asChild size="lg" className="gradient-primary">
              <Link href="/pricing">
                View Plans
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Offers Section */}
      <section className="section-padding bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="mb-4">Choose Your Vertical</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the engine built for your vertical, or combine them for multi-service practices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {offers.map((offer) => (
              <Card key={offer.title} className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <offer.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{offer.title}</CardTitle>
                  <CardDescription className="text-base">{offer.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-6">
                    {offer.outcomes.map((outcome) => (
                      <div key={outcome} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{outcome}</span>
                      </div>
                    ))}
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={offer.href}>
                      Learn More
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="section-padding bg-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="mb-4">Clear Monthly Pricing</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Plans start at $497/month. No setup fees. No contracts. Pause or cancel from your dashboard.
            </p>
            <Button asChild size="lg" className="gradient-primary text-lg px-8">
              <Link href="/pricing">
                View Plans
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="mb-4 text-primary-foreground">Ready to automate your marketing fulfillment?</h2>
            <p className="text-xl mb-8 text-primary-foreground/90">
              Predictable monthly deliverables. Clear quotas. Cancel anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8">
                <Link href="/pricing">
                  View Plans
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                <Link href="/contact">
                  Contact Us
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
