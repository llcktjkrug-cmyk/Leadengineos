import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Target, Zap, Users, ArrowRight, CheckCircle2, XCircle } from "lucide-react";

export default function About() {
  const principles = [
    { title: "Clarity over hype" },
    { title: "Process over promises" },
    { title: "Consistency over intensity" },
    { title: "Systems over heroics" },
  ];

  const whatWeDo = [
    "Build and improve conversion-focused landing pages",
    "Produce blog content aligned to high-intent search",
    "Implement on-page SEO improvements in controlled batches",
    "Maintain internal linking toward money pages",
    "Provide reporting that explains what was done and what happens next",
  ];

  const whatWeDoNot = [
    "We do not sell fake proof or fabricated outcomes",
    "We do not guarantee revenue results",
    "We do not run deceptive marketing tactics",
  ];

  const howItWorks = [
    { step: "1", title: "Choose a plan", description: "Pick the plan that matches your volume needs" },
    { step: "2", title: "Connect your site", description: "Or use our hosted pages if you prefer" },
    { step: "3", title: "Submit requests", description: "Use the portal to request deliverables" },
    { step: "4", title: "Receive work", description: "Get deliverables on schedule with transparent status updates" },
  ];

  return (
    <div className="min-h-screen flex flex-col" data-surface="marketing">
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="mb-6">Built for operators</h1>
            <p className="text-xl text-muted-foreground mb-4">
              Lead Engine OS is a subscription fulfillment system for growth work.
              We deliver predictable monthly output: landing pages, blog content, SEO improvements, and reporting.
            </p>
            <p className="text-lg text-muted-foreground">
              This is not a traditional agency model.
              No endless meetings. No vague timelines. No mystery retainers.
              You get clear quotas, a clear request process, and clear status visibility.
            </p>
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="section-padding">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="mb-8 text-center">What we do</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {whatWeDo.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What we do NOT do */}
      <section className="section-padding bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="mb-8 text-center">What we do not do</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {whatWeDoNot.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-background border border-border">
                  <XCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-padding">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="mb-12 text-center">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {howItWorks.map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 font-semibold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="section-padding bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="mb-4">Principles</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {principles.map((principle) => (
              <Card key={principle.title} className="text-center">
                <CardContent className="pt-6">
                  <h3 className="font-semibold">{principle.title}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
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
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-lg px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
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
