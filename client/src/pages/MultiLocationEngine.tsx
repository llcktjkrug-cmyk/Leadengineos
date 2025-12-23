import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, HelpCircle, AlertCircle } from "lucide-react";

export default function MultiLocationEngine() {
  const monthlyDeliverables = [
    { item: "Location landing pages", quota: "Up to 5/month", description: "City, neighborhood, and service area pages" },
    { item: "Location-specific blog posts", quota: "Up to 8/month", description: "Local content targeting each market" },
    { item: "SEO improvements", quota: "Up to 25/month", description: "NAP consistency, schema, citations" },
    { item: "GBP optimization tasks", quota: "Up to 4/month", description: "Google Business Profile updates per location" },
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Add your locations",
      description: "Connect your sites and list all locations. We handle NAP consistency from day one.",
    },
    {
      step: "2",
      title: "Set location priorities",
      description: "Tell us which locations need the most attention. We allocate quota accordingly.",
    },
    {
      step: "3",
      title: "Scale with one dashboard",
      description: "Track all locations from a single dashboard. Centralized reporting across markets.",
    },
  ];

  const first7Days = [
    { day: "Day 1", task: "Account setup and location inventory" },
    { day: "Day 2-3", task: "NAP consistency audit across all locations" },
    { day: "Day 4-5", task: "First location pages drafted for priority markets" },
    { day: "Day 6-7", task: "Content published, centralized reporting activated" },
  ];

  const benchmarks = [
    { metric: "Local Pack Ranking (Top 3)", range: "60% - 85% of locations", source: "Local SEO Performance Study, 2024" },
    { metric: "Review Acquisition Rate", range: "8-15 reviews/month per location", source: "BrightLocal Survey, 2024" },
    { metric: "Average Review Rating", range: "4.3 - 4.7 stars", source: "Multi-location Service Businesses, 2024" },
    { metric: "Organic Traffic Growth (Year 1)", range: "120% - 200%", source: "SEO Case Study Database, 2024" },
  ];

  const faqs = [
    {
      question: "How many locations can you support?",
      answer: "Our Scale plan supports up to 10 locations. For more than 10 locations, contact us for custom pricing. Each location receives its share of the monthly quota.",
    },
    {
      question: "Do you handle Google Business Profile management?",
      answer: "We handle GBP optimization tasks like category updates, service descriptions, and post scheduling. We don't manage reviews or messaging directly, but we can set up review request workflows.",
    },
    {
      question: "What if my locations have different services?",
      answer: "We customize content per location based on services offered. A location with only Service A won't get content about Service B.",
    },
    {
      question: "Can I add or remove locations?",
      answer: "Yes. Upgrade to add locations or let us know if you're closing a location. Quota adjusts accordingly at your next billing cycle.",
    },
    {
      question: "How do you maintain brand consistency?",
      answer: "We create a brand guide during onboarding. All content follows your voice, terminology, and messaging across every location.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col" data-surface="marketing">
      <Navigation />

      {/* Hero - Outcome + Who it's for */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4" variant="secondary">
              For Multi-location Businesses
            </Badge>
            <h1 className="mb-6">
              Local presence that scales
              <span className="text-primary"> across all locations</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Monthly location pages, local SEO, and GBP optimization for franchises, regional chains, and multi-location practices.
              One dashboard. Consistent brand. Every market covered.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="gradient-primary">
                <Link href="/pricing">
                  View Plans
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/proof">
                  See Benchmarks
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Monthly Deliverables with Clear Quotas */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="mb-4">What you get every month</h2>
            <p className="text-lg text-muted-foreground">
              Clear quotas distributed across your locations. Predictable delivery.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {monthlyDeliverables.map((d) => (
              <Card key={d.item}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{d.item}</CardTitle>
                    <Badge variant="secondary" className="shrink-0">{d.quota}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{d.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Quotas vary by plan. <Link href="/pricing" className="text-primary hover:underline">Compare plans</Link>
            </p>
          </div>

          {/* Expectations - Workstream A */}
          <div className="max-w-2xl mx-auto mt-8 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <p>Deliverables are processed in a shared queue. Turnaround times are estimates, not guarantees.</p>
                <p className="mt-1">Complex requests may consume more than one unit. We'll confirm scope before execution if unclear.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works - 3 Steps */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="mb-4">How it works</h2>
            <p className="text-lg text-muted-foreground">
              Three steps to scalable local marketing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {howItWorks.map((step) => (
              <div key={step.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-semibold">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* First 7 Days - Onboarding Timeline */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="mb-4">Your first 7 days</h2>
            <p className="text-lg text-muted-foreground">
              From signup to first content across locations.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="space-y-4">
              {first7Days.map((item) => (
                <div key={item.day} className="flex items-start gap-4">
                  <div className="w-20 shrink-0">
                    <Badge variant="outline" className="font-mono">{item.day}</Badge>
                  </div>
                  <div className="flex-1 pb-4 border-b border-border last:border-0">
                    <p className="text-sm">{item.task}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Proof - Benchmarks */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="mb-4">Industry benchmarks</h2>
            <p className="text-lg text-muted-foreground">
              Typical performance ranges for multi-location businesses with consistent local SEO.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {benchmarks.map((b) => (
                    <div key={b.metric} className="flex items-start justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                      <div>
                        <div className="font-medium">{b.metric}</div>
                        <div className="text-xs text-muted-foreground">{b.source}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-primary">{b.range}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Illustrative Example */}
            <Card className="mt-6 border-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Illustrative Example</Badge>
                </div>
                <CardTitle className="text-lg mt-2">5-Location Service Business Expansion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Before</p>
                  <p className="text-sm">Inconsistent NAP data, 2 of 5 locations in local pack, managing 3 different agencies</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Actions</p>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>NAP consistency audit and citation cleanup</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>Location-specific landing pages for each market</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>GBP optimization and local content for all 5 locations</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">After</p>
                  <p className="text-sm">4 of 5 locations in local pack, 150% increase in local traffic, one centralized dashboard</p>
                </div>
                <p className="text-xs text-muted-foreground italic pt-2 border-t border-border">
                  Modeled from industry benchmarks. Results vary based on market, competition, and execution.
                </p>
              </CardContent>
            </Card>

            <div className="text-center mt-6">
              <Button asChild variant="outline">
                <Link href="/proof">
                  View all benchmarks
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="mb-4">Frequently asked questions</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.question}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-start gap-2">
                    <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground pl-7">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="mb-4 text-primary-foreground">Ready to scale your local presence?</h2>
            <p className="text-xl mb-8 text-primary-foreground/90">
              Predictable monthly deliverables. Clear quotas. Cancel anytime.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link href="/pricing">
                  View Plans
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
              >
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
