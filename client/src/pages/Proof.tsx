import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ArrowRight, TrendingUp, Users, Target, Info, AlertTriangle } from "lucide-react";

export default function Proof() {
  const benchmarks = {
    medSpa: {
      icon: Target,
      vertical: "Med Spa & Aesthetic Medicine",
      metrics: [
        {
          metric: "Website Conversion Rate",
          range: "2.5% - 4.5%",
          source: "AmSpa 2024 Medical Spa State of the Industry Report",
          url: "https://www.americanmedspa.org/page/med-spa-state-of-the-industry-report",
        },
        {
          metric: "Cost Per Lead (Botox/Fillers)",
          range: "$45 - $95",
          source: "AmSpa 2024 Industry Report",
          url: "https://www.americanmedspa.org/page/med-spa-state-of-the-industry-report",
        },
        {
          metric: "Consultation Show Rate",
          range: "65% - 80%",
          source: "AmSpa member survey data",
          url: "https://www.americanmedspa.org/",
        },
        {
          metric: "Consultation to Treatment Rate",
          range: "40% - 60%",
          source: "AmSpa 2024 Industry Report",
          url: "https://www.americanmedspa.org/page/med-spa-state-of-the-industry-report",
        },
      ],
    },
    dental: {
      icon: Users,
      vertical: "Dental Implants & Restorative",
      metrics: [
        {
          metric: "Implant Lead Conversion Rate",
          range: "3% - 6%",
          source: "Dental Economics / Levin Group 2024",
          url: "https://www.dentaleconomics.com/",
        },
        {
          metric: "Cost Per Implant Lead",
          range: "$120 - $250",
          source: "Dental Economics benchmarks",
          url: "https://www.dentaleconomics.com/",
        },
        {
          metric: "Consultation Show Rate",
          range: "70% - 85%",
          source: "ADA Health Policy Institute",
          url: "https://www.ada.org/resources/research/health-policy-institute",
        },
        {
          metric: "Case Acceptance Rate",
          range: "35% - 55%",
          source: "Levin Group research",
          url: "https://levingroup.com/",
        },
      ],
    },
    multiLocation: {
      icon: TrendingUp,
      vertical: "Multi-location Operations",
      metrics: [
        {
          metric: "Local Pack Ranking (Top 3)",
          range: "60% - 85% of locations",
          source: "Whitespark Local Search Ranking Factors",
          url: "https://whitespark.ca/local-search-ranking-factors/",
        },
        {
          metric: "Review Acquisition Rate",
          range: "8 - 15 reviews/month per location",
          source: "BrightLocal Consumer Review Survey 2024",
          url: "https://www.brightlocal.com/research/local-consumer-review-survey/",
        },
        {
          metric: "Average Review Rating",
          range: "4.3 - 4.7 stars",
          source: "BrightLocal Consumer Review Survey 2024",
          url: "https://www.brightlocal.com/research/local-consumer-review-survey/",
        },
        {
          metric: "Organic Traffic Growth (Year 1)",
          range: "120% - 200%",
          source: "Whitespark/BrightLocal benchmarks",
          url: "https://whitespark.ca/",
        },
      ],
    },
  };

  const illustrativeExamples = [
    {
      title: "Med Spa: Botox Landing Page Optimization",
      tag: "Modeled Scenario",
      scenario: {
        before: "Generic service page with conversion rate in the 1.5% - 2.0% range",
        actions: [
          "Created treatment-specific landing page with before/after gallery",
          "Added FAQ section addressing common concerns",
          "Implemented clear pricing and booking CTA",
          "Optimized for local search intent",
        ],
        afterRange: "Conversion rate improvement to 3.0% - 4.0% range, CPL reduction of 30% - 45%",
      },
      disclaimer: "Modeled from industry benchmarks. Not a guarantee. Results vary by market, competition, ad spend, and follow-up speed.",
    },
    {
      title: "Dental: All-on-4 Implant Lead Generation",
      tag: "Modeled Scenario",
      scenario: {
        before: "Broad implant page with conversion rate in the 2.0% - 2.5% range",
        actions: [
          "Created All-on-4 specific landing page with patient education content",
          "Added financing calculator and case studies",
          "Optimized for high-intent keywords",
          "Implemented retargeting for non-converters",
        ],
        afterRange: "Conversion rate improvement to 4.0% - 5.5% range, 2x - 3x more qualified consultations",
      },
      disclaimer: "Modeled from industry benchmarks. Not a guarantee. Results vary by market, competition, ad spend, and follow-up speed.",
    },
  ];

  const modelAssumptions = [
    {
      assumption: "Traffic volume",
      detail: "Scenarios assume 500 - 2,000 monthly visitors to service pages. Lower traffic extends timeline to see results.",
    },
    {
      assumption: "Ad spend",
      detail: "CPL benchmarks assume $2,000 - $10,000/month in paid media. Organic-only strategies have different economics.",
    },
    {
      assumption: "Follow-up speed",
      detail: "Conversion rates assume leads are contacted within 5 minutes. Slower follow-up reduces show rates by 30% - 50%.",
    },
    {
      assumption: "Market competition",
      detail: "Benchmarks are averages across markets. High-competition metros may see CPL 20% - 40% higher.",
    },
    {
      assumption: "Content quality",
      detail: "Results assume professionally written, medically accurate content. Low-quality content underperforms.",
    },
    {
      assumption: "Timeline",
      detail: "SEO improvements compound over 3 - 6 months. Paid campaigns can show results in 2 - 4 weeks.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col" data-surface="marketing">
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-12 md:pt-40 md:pb-16 bg-gradient-to-b from-muted/30 to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="mb-6">Proof, without fiction</h1>
            <p className="text-xl text-muted-foreground mb-4">
              We use two kinds of proof: benchmarks from publicly available industry research, 
              and illustrative scenarios based on those benchmarks with stated assumptions.
            </p>
            <p className="text-lg text-muted-foreground">
              These are not promises of results. Actual performance varies by market, offer quality, 
              follow-up speed, and operational execution.
            </p>
          </div>
        </div>
      </section>

      {/* How to Read This Page */}
      <section className="py-8 border-b border-border">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-start gap-4 p-6 bg-muted/50 rounded-lg border border-border">
              <Info className="w-6 h-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">How to read this page</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Ranges are normal. Single-number claims are usually marketing.</li>
                  <li>• Modeled outcomes are not guarantees.</li>
                  <li>• Your results depend heavily on response time and follow-up discipline.</li>
                  <li>• Each benchmark links to its source. If a source is not linkable, we do not cite it.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benchmark Library */}
      <section className="section-padding">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="mb-4">Industry Benchmarks</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Performance ranges from published industry research. Click any source to verify.
            </p>
          </div>

          <Tabs defaultValue="medSpa" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="medSpa">Med Spa</TabsTrigger>
              <TabsTrigger value="dental">Dental Implants</TabsTrigger>
              <TabsTrigger value="multiLocation">Multi-location</TabsTrigger>
            </TabsList>

            {Object.entries(benchmarks).map(([key, data]) => (
              <TabsContent key={key} value={key} className="mt-8">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <data.icon className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle>{data.vertical}</CardTitle>
                    </div>
                    <CardDescription>
                      Typical performance ranges from industry research
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.metrics.map((metric) => (
                        <div key={metric.metric} className="flex items-start justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                          <div className="flex-1">
                            <div className="font-semibold mb-1">{metric.metric}</div>
                            <a 
                              href={metric.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline"
                            >
                              {metric.source} →
                            </a>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-primary">{metric.range}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Model Assumptions Accordion */}
      <section className="section-padding bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-semibold">Model Assumptions</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              The scenarios below are modeled using these assumptions. If your situation differs, adjust expectations accordingly.
            </p>
            <Accordion type="single" collapsible className="w-full">
              {modelAssumptions.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {item.assumption}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">{item.detail}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Illustrative Examples */}
      <section className="section-padding">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="mb-4">Modeled Scenarios</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hypothetical examples based on benchmark data. These are not real client results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {illustrativeExamples.map((example) => (
              <Card key={example.title} className="border-2">
                <CardHeader>
                  <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full mb-3">
                    {example.tag}
                  </div>
                  <CardTitle className="text-lg">{example.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm font-semibold text-muted-foreground mb-1">Starting Point (Typical)</div>
                    <p className="text-sm">{example.scenario.before}</p>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-muted-foreground mb-2">Actions Modeled</div>
                    <ul className="space-y-1">
                      {example.scenario.actions.map((action, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className="text-primary shrink-0">→</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-muted-foreground mb-1">Potential Outcome Range</div>
                    <p className="text-sm font-semibold text-primary">{example.scenario.afterRange}</p>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground italic">{example.disclaimer}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pilot Program */}
      <section className="section-padding bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="mb-4">Pilot Program</h2>
            <p className="text-lg text-muted-foreground mb-8">
              We're accepting a limited number of practices into our pilot program to build real case studies. 
              Pilot participants receive discounted pricing in exchange for data sharing and testimonials.
            </p>
            <Button size="lg" className="gradient-primary" asChild>
              <Link href="/contact">
                Apply for Pilot Program
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Sources */}
      <section className="section-padding">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-center mb-8">Sources</h2>
            <p className="text-muted-foreground mb-8 text-center">
              All benchmarks are sourced from publicly available industry reports. Click to verify.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Med Spa Industry</CardTitle>
                </CardHeader>
                <CardContent>
                  <a 
                    href="https://www.americanmedspa.org/page/med-spa-state-of-the-industry-report" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline block"
                  >
                    AmSpa 2024 State of the Industry Report →
                  </a>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Dental Industry</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <a 
                    href="https://www.dentaleconomics.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline block"
                  >
                    Dental Economics →
                  </a>
                  <a 
                    href="https://www.ada.org/resources/research/health-policy-institute" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline block"
                  >
                    ADA Health Policy Institute →
                  </a>
                  <a 
                    href="https://levingroup.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline block"
                  >
                    Levin Group →
                  </a>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Local SEO & Reviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <a 
                    href="https://www.brightlocal.com/research/local-consumer-review-survey/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline block"
                  >
                    BrightLocal Consumer Review Survey →
                  </a>
                  <a 
                    href="https://whitespark.ca/local-search-ranking-factors/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline block"
                  >
                    Whitespark Ranking Factors →
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
