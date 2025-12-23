import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { CheckCircle2, ArrowRight, Check, Minus } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: 497,
      description: "Perfect for single-location practices getting started with automated marketing",
      features: [
        "1 location or site connection",
        "2 landing pages per month",
        "4 blog posts per month",
        "10 SEO improvements per month",
        "5 internal linking improvements per month",
        "1 local presence audit per month",
        "Weekly performance reports",
        "Email support",
      ],
      cta: "Start Starter Plan",
      popular: false,
    },
    {
      name: "Pro",
      price: 997,
      description: "For growing practices ready to scale content and dominate local search",
      features: [
        "Up to 5 locations or site connections",
        "5 landing pages per month",
        "8 blog posts per month",
        "25 SEO improvements per month",
        "15 internal linking improvements per month",
        "Weekly local presence operations",
        "Weekly performance reports",
        "Priority email support",
        "Quarterly strategy calls",
      ],
      cta: "Start Pro Plan",
      popular: true,
    },
    {
      name: "Scale",
      price: 1997,
      description: "For multi-location operations and franchises that need enterprise-level automation",
      features: [
        "Unlimited locations",
        "10 landing pages per month",
        "16 blog posts per month",
        "50 SEO improvements per month",
        "30 internal linking improvements per month",
        "Daily local presence operations",
        "Real-time performance dashboards",
        "Priority queue processing",
        "Dedicated success manager",
        "Monthly strategy calls",
        "Custom integrations available",
      ],
      cta: "Start Scale Plan",
      popular: false,
    },
  ];

  const addons = [
    {
      name: "Extra Location",
      price: 99,
      description: "Add another location to your existing plan",
    },
    {
      name: "Extra Landing Pages",
      price: 149,
      description: "5 additional landing pages per month",
    },
    {
      name: "Extra Blog Posts",
      price: 199,
      description: "8 additional blog posts per month",
    },
    {
      name: "WordPress Management",
      price: 299,
      description: "Full WordPress maintenance, updates, and security",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col" data-surface="marketing">
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            {/* Pilot Program Badge - Workstream D */}
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
              Currently accepting pilot clients
            </Badge>
            <h1 className="mb-6">Clear Monthly Pricing</h1>
            <p className="text-xl text-muted-foreground mb-4">
              No setup fees. No contracts. Each plan includes defined monthly deliverables and email support.
            </p>
            <p className="text-muted-foreground">
              Pause or cancel from your dashboard anytime. 14-day money-back guarantee on your first month.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-8 md:py-12">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-4 border-b border-border"></th>
                    <th className="text-center p-4 border-b border-border min-w-[140px]">
                      <div className="font-semibold text-lg">Starter</div>
                      <div className="text-2xl font-bold mt-1">$497<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                    </th>
                    <th className="text-center p-4 border-b border-border min-w-[140px] bg-primary/5 relative">
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="default">Most Popular</Badge>
                      <div className="font-semibold text-lg">Pro</div>
                      <div className="text-2xl font-bold mt-1">$997<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                    </th>
                    <th className="text-center p-4 border-b border-border min-w-[140px]">
                      <div className="font-semibold text-lg">Scale</div>
                      <div className="text-2xl font-bold mt-1">$1,997<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Best For */}
                  <tr className="bg-muted/30">
                    <td className="p-4 font-medium text-sm">Best for</td>
                    <td className="p-4 text-center text-sm text-muted-foreground">Single-location practices getting started</td>
                    <td className="p-4 text-center text-sm text-muted-foreground bg-primary/5">Growing practices ready to scale</td>
                    <td className="p-4 text-center text-sm text-muted-foreground">Multi-location & franchises</td>
                  </tr>
                  {/* Locations */}
                  <tr>
                    <td className="p-4 border-b border-border font-medium text-sm">Locations / Sites</td>
                    <td className="p-4 border-b border-border text-center">1</td>
                    <td className="p-4 border-b border-border text-center bg-primary/5">Up to 5</td>
                    <td className="p-4 border-b border-border text-center">Unlimited</td>
                  </tr>
                  {/* Landing Pages */}
                  <tr>
                    <td className="p-4 border-b border-border font-medium text-sm">Landing pages / month</td>
                    <td className="p-4 border-b border-border text-center">2</td>
                    <td className="p-4 border-b border-border text-center bg-primary/5">5</td>
                    <td className="p-4 border-b border-border text-center">10</td>
                  </tr>
                  {/* Blog Posts */}
                  <tr>
                    <td className="p-4 border-b border-border font-medium text-sm">Blog posts / month</td>
                    <td className="p-4 border-b border-border text-center">4</td>
                    <td className="p-4 border-b border-border text-center bg-primary/5">8</td>
                    <td className="p-4 border-b border-border text-center">16</td>
                  </tr>
                  {/* SEO Improvements */}
                  <tr>
                    <td className="p-4 border-b border-border font-medium text-sm">SEO improvements / month</td>
                    <td className="p-4 border-b border-border text-center">10</td>
                    <td className="p-4 border-b border-border text-center bg-primary/5">25</td>
                    <td className="p-4 border-b border-border text-center">50</td>
                  </tr>
                  {/* Internal Linking */}
                  <tr>
                    <td className="p-4 border-b border-border font-medium text-sm">Internal linking / month</td>
                    <td className="p-4 border-b border-border text-center">5</td>
                    <td className="p-4 border-b border-border text-center bg-primary/5">15</td>
                    <td className="p-4 border-b border-border text-center">30</td>
                  </tr>
                  {/* Local Presence */}
                  <tr>
                    <td className="p-4 border-b border-border font-medium text-sm">Local presence operations</td>
                    <td className="p-4 border-b border-border text-center text-sm text-muted-foreground">1 audit/mo</td>
                    <td className="p-4 border-b border-border text-center text-sm bg-primary/5">Weekly</td>
                    <td className="p-4 border-b border-border text-center text-sm">Daily</td>
                  </tr>
                  {/* Reporting */}
                  <tr>
                    <td className="p-4 border-b border-border font-medium text-sm">Performance reporting</td>
                    <td className="p-4 border-b border-border text-center text-sm">Weekly</td>
                    <td className="p-4 border-b border-border text-center text-sm bg-primary/5">Weekly</td>
                    <td className="p-4 border-b border-border text-center text-sm">Real-time dashboard</td>
                  </tr>
                  {/* Support */}
                  <tr>
                    <td className="p-4 border-b border-border font-medium text-sm">Support</td>
                    <td className="p-4 border-b border-border text-center text-sm">Email</td>
                    <td className="p-4 border-b border-border text-center text-sm bg-primary/5">Priority email</td>
                    <td className="p-4 border-b border-border text-center text-sm">Dedicated manager</td>
                  </tr>
                  {/* Strategy Calls */}
                  <tr>
                    <td className="p-4 border-b border-border font-medium text-sm">Strategy calls</td>
                    <td className="p-4 border-b border-border text-center">
                      <Minus className="w-4 h-4 text-muted-foreground mx-auto" />
                    </td>
                    <td className="p-4 border-b border-border text-center text-sm bg-primary/5">Quarterly</td>
                    <td className="p-4 border-b border-border text-center text-sm">Monthly</td>
                  </tr>
                  {/* Priority Queue */}
                  <tr>
                    <td className="p-4 border-b border-border font-medium text-sm">Priority queue</td>
                    <td className="p-4 border-b border-border text-center">
                      <Minus className="w-4 h-4 text-muted-foreground mx-auto" />
                    </td>
                    <td className="p-4 border-b border-border text-center bg-primary/5">
                      <Minus className="w-4 h-4 text-muted-foreground mx-auto" />
                    </td>
                    <td className="p-4 border-b border-border text-center">
                      <Check className="w-5 h-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  {/* CTA Row */}
                  <tr>
                    <td className="p-4"></td>
                    <td className="p-4 text-center">
                      <a href={getLoginUrl()}>
                        <Button variant="outline" size="sm" className="w-full max-w-[120px]">
                          Start Starter
                        </Button>
                      </a>
                    </td>
                    <td className="p-4 text-center bg-primary/5">
                      <a href={getLoginUrl()}>
                        <Button size="sm" className="w-full max-w-[120px] gradient-primary">
                          Start Pro
                        </Button>
                      </a>
                    </td>
                    <td className="p-4 text-center">
                      <a href={getLoginUrl()}>
                        <Button variant="outline" size="sm" className="w-full max-w-[120px]">
                          Start Scale
                        </Button>
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              All plans include email support and 14-day money-back guarantee. <Link href="/terms" className="text-primary hover:underline">See terms</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Plan Details */}
      <section className="section-padding bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="mb-4">Full Plan Details</h2>
            <p className="text-lg text-muted-foreground">
              Everything included in each plan
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${
                  plan.popular ? "border-primary border-2 shadow-xl" : "border-2"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-5xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a href={getLoginUrl()}>
                    <Button
                      className={`w-full ${plan.popular ? "gradient-primary" : ""}`}
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                    >
                      {plan.cta}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </a>
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    No setup fee. Cancel anytime. 14-day money-back guarantee.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="section-padding bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="mb-4">Add-ons</h2>
              <p className="text-xl text-muted-foreground">
                Extend your plan with additional capacity or services
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addons.map((addon) => (
                <Card key={addon.name}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{addon.name}</CardTitle>
                        <CardDescription>{addon.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">${addon.price}</div>
                        <div className="text-sm text-muted-foreground">/month</div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What Happens in the First 7 Days */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="mb-4">What happens in the first 7 days</h2>
              <p className="text-lg text-muted-foreground">
                Clear timeline from signup to first deliverables.
              </p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <div className="text-xs font-mono bg-primary/10 text-primary px-3 py-1 rounded shrink-0">Day 1</div>
                    <div>
                      <h3 className="font-semibold mb-1">Onboarding</h3>
                      <p className="text-sm text-muted-foreground">Dashboard access granted. Complete onboarding checklist: connect your website, select your vertical, set content preferences.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <div className="text-xs font-mono bg-primary/10 text-primary px-3 py-1 rounded shrink-0">Day 2-3</div>
                    <div>
                      <h3 className="font-semibold mb-1">Landing Pages Queued</h3>
                      <p className="text-sm text-muted-foreground">First landing pages enter the queue based on your priorities. You can review briefs before generation.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <div className="text-xs font-mono bg-primary/10 text-primary px-3 py-1 rounded shrink-0">Day 4-5</div>
                    <div>
                      <h3 className="font-semibold mb-1">Content Drafts</h3>
                      <p className="text-sm text-muted-foreground">First blog post drafts delivered. Review in your dashboard or have them auto-published to WordPress.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <div className="text-xs font-mono bg-primary/10 text-primary px-3 py-1 rounded shrink-0">Day 6-7</div>
                    <div>
                      <h3 className="font-semibold mb-1">SEO Baseline + First Report</h3>
                      <p className="text-sm text-muted-foreground">SEO improvements begin. First weekly report delivered with baseline metrics and initial recommendations.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-8">
              <Button asChild variant="outline">
                <Link href="/audit">
                  Not sure yet? Request a free audit first
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-2">Can I cancel anytime?</h3>
                <p className="text-muted-foreground">
                  Yes. There are no contracts or commitments. Cancel anytime from your account dashboard. You'll retain
                  access through the end of your billing period.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">What if I need to pause my subscription?</h3>
                <p className="text-muted-foreground">
                  You can pause your subscription for up to 3 months. Your plan and settings will be preserved, and you
                  can resume anytime.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Do you offer refunds?</h3>
                <p className="text-muted-foreground">
                  We offer a 14-day money-back guarantee on your first month. If you're not satisfied, we'll refund your
                  payment in full.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">How does billing work?</h3>
                <p className="text-muted-foreground">
                  All plans are billed monthly via credit card. Your billing cycle starts on the day you subscribe, and
                  you'll be charged on the same day each month.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Can I upgrade or downgrade my plan?</h3>
                <p className="text-muted-foreground">
                  Yes. You can change your plan anytime. Upgrades take effect immediately with prorated billing.
                  Downgrades take effect at the start of your next billing cycle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pilot Program Info - Workstream D */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Badge variant="outline" className="shrink-0 border-primary/30 text-primary">Pilot Program</Badge>
                  <div>
                    <p className="font-medium mb-2">Why join as a pilot client?</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>Help shape the product with direct feedback</li>
                      <li>Receive white-glove attention during onboarding</li>
                      <li>Lock in early pricing as we scale</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-3 italic">
                      No fake scarcity. We're genuinely early and value your input.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="mb-4 text-primary-foreground">Ready to automate your marketing fulfillment?</h2>
            <p className="text-xl mb-4 text-primary-foreground/90">
              Choose your plan and start receiving monthly deliverables.
            </p>
            <p className="text-sm mb-8 text-primary-foreground/70">
              No setup fee. Cancel anytime. 14-day money-back guarantee.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8">
                <a href={getLoginUrl()}>
                  Choose a Plan
                  <ArrowRight className="ml-2 w-5 h-5" />
                </a>
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
