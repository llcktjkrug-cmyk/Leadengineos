import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, Mail } from "lucide-react";

type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
  vertical: string;
};

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "med-spa-cold",
    name: "Med Spa Cold Outreach",
    vertical: "Med Spa",
    subject: "Quick question about {Business Name}'s content strategy",
    body: `Hi {First Name},

I came across {Business Name} while researching med spas in {City}. Your site looks solid, but I noticed a few quick wins that could help you rank higher for treatments like Botox, fillers, and body contouring in your area.

We run a done-for-you content subscription specifically for med spas. No contracts, no setup fees—just consistent landing pages, blog posts, and local SEO work delivered weekly.

Would it be worth a 10-minute call to see if we're a fit? I can also send over a free audit of your current site if that's helpful.

Best,
{Your Name}
Lead Engine OS

P.S. Here's what we typically automate for med spas: treatment pages, before/after galleries, seasonal promos, and Google Business optimization.`,
  },
  {
    id: "dental-cold",
    name: "Dental Implants Cold Outreach",
    vertical: "Dental Implants",
    subject: "Idea for {Business Name}'s implant patient acquisition",
    body: `Hi {First Name},

I've been looking at dental implant practices in {City}, and {Business Name} caught my attention. High-ticket procedures like full-arch and All-on-4 need a different marketing approach than general dentistry—and it looks like there's room to improve your local visibility.

We run a subscription service specifically for dental implant practices. We handle the content (landing pages, patient education articles, case studies) and local SEO so you can focus on consultations.

No long-term contracts. No setup fees. Just consistent, predictable output every month.

Would a quick 10-minute call make sense? I can also send a free audit of your current online presence if you'd prefer to start there.

Best,
{Your Name}
Lead Engine OS

P.S. Most implant practices we work with see the biggest gains from procedure-specific pages and Google Business Profile optimization.`,
  },
  {
    id: "multi-location-cold",
    name: "Multi-location Cold Outreach",
    vertical: "Multi-location",
    subject: "Scaling content across {Business Name}'s locations",
    body: `Hi {First Name},

Managing content and local SEO across multiple locations is tough—especially when each location needs unique pages, local citations, and Google Business Profile attention.

I noticed {Business Name} has {Number} locations in {Region}. We run a subscription service built specifically for multi-location service businesses. We create location-specific landing pages, blog content, and handle local presence management across all your locations.

The model is simple: fixed monthly fee, no contracts, predictable output. We scale with you as you add locations.

Would it be worth a brief call to see if this fits your growth plans? I can also send a free audit showing gaps across your current locations.

Best,
{Your Name}
Lead Engine OS

P.S. Multi-location businesses typically see the biggest ROI from consistent location pages and centralized content that gets localized for each market.`,
  },
];

export default function EmailTemplates() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string, type: "subject" | "body") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(`${id}-${type}`);
      toast.success(`${type === "subject" ? "Subject" : "Email body"} copied to clipboard`);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col" data-surface="app">
      <Navigation />

      <div className="pt-24 pb-16 flex-1">
        <div className="container max-w-4xl">
          <div className="mb-8">
            <Badge variant="outline" className="mb-4">
              Internal Use Only
            </Badge>
            <h1 className="mb-4">Outbound Email Templates</h1>
            <p className="text-xl text-muted-foreground">
              Cold outreach templates for manual prospecting. Copy, personalize, and send.
            </p>
          </div>

          <Card className="mb-8 border-dashed">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Before sending:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Replace all {"{placeholders}"} with actual values</li>
                    <li>Research the prospect's website for specific observations</li>
                    <li>Keep it short—busy owners skim</li>
                    <li>Follow up once after 3-5 days if no response</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="med-spa-cold" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="med-spa-cold">Med Spa</TabsTrigger>
              <TabsTrigger value="dental-cold">Dental Implants</TabsTrigger>
              <TabsTrigger value="multi-location-cold">Multi-location</TabsTrigger>
            </TabsList>

            {EMAIL_TEMPLATES.map((template) => (
              <TabsContent key={template.id} value={template.id} className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{template.name}</CardTitle>
                        <CardDescription>Cold outreach for {template.vertical} prospects</CardDescription>
                      </div>
                      <Badge variant="secondary">{template.vertical}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Subject Line */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Subject Line</label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(template.subject, template.id, "subject")}
                          className="h-8"
                        >
                          <Copy className="w-3 h-3 mr-2" />
                          {copiedId === `${template.id}-subject` ? "Copied!" : "Copy"}
                        </Button>
                      </div>
                      <div className="bg-muted p-3 rounded-md font-mono text-sm">
                        {template.subject}
                      </div>
                    </div>

                    {/* Email Body */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Email Body</label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(template.body, template.id, "body")}
                          className="h-8"
                        >
                          <Copy className="w-3 h-3 mr-2" />
                          {copiedId === `${template.id}-body` ? "Copied!" : "Copy"}
                        </Button>
                      </div>
                      <div className="bg-muted p-4 rounded-md">
                        <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                          {template.body}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              These templates are for internal team use only. Do not share externally.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
