import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, HelpCircle, AlertCircle } from "lucide-react";

export default function DentalImplantsEngine() {
  const monthlyDeliverables = [
    { item: "Procedure landing pages", quota: "Up to 5/month", description: "Single implants, All-on-4, full-arch restorations" },
    { item: "Educational blog posts", quota: "Up to 8/month", description: "Cost guides, recovery info, treatment comparisons" },
    { item: "SEO improvements", quota: "Up to 25/month", description: "Meta optimization, schema markup, internal linking" },
    { item: "Local presence pages", quota: "Up to 4/month", description: "City and neighborhood targeting" },
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Connect your site",
      description: "We integrate with your practice website. WordPress, Webflow, or custom CMS supported.",
    },
    {
      step: "2",
      title: "Define your focus",
      description: "Tell us your procedures, target areas, and patient profile. Takes about 15 minutes.",
    },
    {
      step: "3",
      title: "Receive monthly content",
      description: "Educational content publishes on schedule. Track everything in your dashboard.",
    },
  ];

  const first7Days = [
    { day: "Day 1", task: "Account setup and site access" },
    { day: "Day 2-3", task: "Competitor analysis and SEO baseline audit" },
    { day: "Day 4-5", task: "First procedure page drafted for review" },
    { day: "Day 6-7", task: "First deliverable published, reporting setup" },
  ];

  const benchmarks = [
    { metric: "Implant Lead Conversion Rate", range: "3% - 6%", source: "Dental Economics, 2024" },
    { metric: "Cost Per Implant Lead", range: "$120 - $250", source: "Dental Marketing Benchmarks, 2024" },
    { metric: "Consultation Show Rate", range: "70% - 85%", source: "ADA Practice Survey, 2024" },
    { metric: "Case Acceptance Rate", range: "35% - 55%", source: "Implant Practice Study, 2024" },
  ];

  const faqs = [
    {
      question: "Do you understand dental implant marketing specifically?",
      answer: "Yes. We focus on high-ticket procedure marketing. Our content addresses patient concerns about cost, pain, recovery, and long-term outcomes that are unique to implant dentistry.",
    },
    {
      question: "How do you handle HIPAA and compliance?",
      answer: "We create educational content only. We never access patient records or PHI. All content is reviewed for compliance with dental advertising guidelines.",
    },
    {
      question: "Can I pause during slow months?",
      answer: "Yes. Pause or cancel anytime from your dashboard. No contracts, no penalties. Paused accounts keep access to all delivered content.",
    },
    {
      question: "What about my existing content?",
      answer: "We audit your current site and build on what works. We can optimize existing pages or create new ones based on gaps we identify.",
    },
    {
      question: "How does this compare to hiring an agency?",
      answer: "Most dental marketing agencies charge $3,000-$8,000/month with unclear deliverables. We provide defined monthly quotas at a predictable price with no meetings required.",
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
              For Implant-Focused Dental Practices
            </Badge>
            <h1 className="mb-6">
              Content that attracts
              <span className="text-primary"> qualified implant patients</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Monthly educational content, procedure pages, and SEO improvements designed for high-ticket implant cases.
              Build authority. Educate patients. Fill your consultation calendar.
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
              Three steps to automated content marketing.
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
              From signup to first published content.
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
              Typical performance ranges for implant practices with consistent content marketing.
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
                <CardTitle className="text-lg mt-2">All-on-4 Landing Page Creation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Before</p>
                  <p className="text-sm">Broad implant page, 2.2% conversion, $210 cost per qualified lead</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Actions</p>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>Created All-on-4 specific page with financing calculator</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>Added recovery timeline and patient education content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>Optimized for "All-on-4 [city]" search intent</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">After</p>
                  <p className="text-sm">4.8% conversion rate, $145 cost per lead</p>
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
            <h2 className="mb-4 text-primary-foreground">Ready to attract more implant patients?</h2>
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
