import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  ArrowRight,
  HelpCircle,
  AlertCircle,
} from "lucide-react";

export default function MedSpaEngine() {
  const monthlyDeliverables = [
    { item: "Treatment landing pages", quota: "Up to 5/month", description: "Botox, fillers, laser, body contouring" },
    { item: "SEO blog posts", quota: "Up to 8/month", description: "Educational content targeting local searches" },
    { item: "SEO improvements", quota: "Up to 25/month", description: "Meta tags, schema, internal linking" },
    { item: "Local presence pages", quota: "Up to 4/month", description: "Neighborhood and city-specific pages" },
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Connect your site",
      description: "We integrate with your WordPress, Webflow, or custom site. Or we host a site for you.",
    },
    {
      step: "2",
      title: "Set your preferences",
      description: "Choose your services, target locations, and content priorities. Takes about 15 minutes.",
    },
    {
      step: "3",
      title: "Receive monthly deliverables",
      description: "Content publishes on schedule. Track progress in your dashboard. Request changes anytime.",
    },
  ];

  const first7Days = [
    { day: "Day 1", task: "Account setup and site connection" },
    { day: "Day 2-3", task: "Audit of existing content and SEO baseline" },
    { day: "Day 4-5", task: "First landing page drafted and reviewed" },
    { day: "Day 6-7", task: "First deliverable published, dashboard walkthrough" },
  ];

  const benchmarks = [
    { metric: "Website Conversion Rate", range: "2.5% - 4.5%", source: "American Med Spa Association, 2024" },
    { metric: "Cost Per Lead (Botox/Fillers)", range: "$45 - $95", source: "Aesthetic Practice Marketing Benchmarks" },
    { metric: "Consultation Show Rate", range: "65% - 80%", source: "Med Spa Growth Report, 2024" },
  ];

  const faqs = [
    {
      question: "What if I don't have time to review content?",
      answer: "All content follows your initial preferences. You can review before publishing or trust us to publish directly. Most clients choose auto-publish after the first month.",
    },
    {
      question: "Can I pause or cancel?",
      answer: "Yes. Pause or cancel anytime from your dashboard. No contracts, no penalties. Paused accounts retain access to delivered content.",
    },
    {
      question: "What if I need changes to delivered content?",
      answer: "Request changes through your dashboard. Minor revisions are included. Major rewrites count toward your monthly quota.",
    },
    {
      question: "How long until I see results?",
      answer: "SEO improvements compound over time. Most practices see measurable traffic increases within 3-4 months. Conversion improvements often appear sooner.",
    },
    {
      question: "Do you write content for specific treatments?",
      answer: "Yes. We cover Botox, fillers, laser treatments, CoolSculpting, microneedling, chemical peels, and other aesthetic services you offer.",
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
              For Med Spas and Aesthetic Clinics
            </Badge>
            <h1 className="mb-6">
              Consistent content that brings
              <span className="text-primary"> qualified consultations</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Monthly landing pages, blog posts, and SEO improvements built for aesthetic practices.
              Set your preferences once. Receive deliverables on schedule.
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
              Clear quotas. Predictable delivery. No surprises.
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
              Three steps to automated marketing fulfillment.
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
              From signup to first published deliverable.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="space-y-4">
              {first7Days.map((item, index) => (
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
              Typical performance ranges for med spas with consistent content marketing.
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
                <CardTitle className="text-lg mt-2">Botox Landing Page Optimization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Before</p>
                  <p className="text-sm">Generic service page, 1.8% conversion rate, $125 cost per lead</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Actions</p>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>Created treatment-specific landing page with FAQ section</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>Added clear pricing and booking CTA</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>Optimized for local search intent</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">After</p>
                  <p className="text-sm">3.5% conversion rate, $68 cost per lead</p>
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
            <h2 className="mb-4 text-primary-foreground">Ready to automate your med spa marketing?</h2>
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
