import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, Loader2, ClipboardCheck, Clock, FileSearch, MessageSquare } from "lucide-react";

type AuditFormData = {
  businessName: string;
  websiteUrl: string;
  businessType: string;
  locationCount: string;
  primaryGoal: string;
  email: string;
  additionalNotes: string;
};

// Lead scoring function - Workstream B
function calculateLeadScore(data: AuditFormData): number {
  let score = 0;

  // Business type scoring
  if (data.businessType === "med_spa" || data.businessType === "dental_implants") {
    score += 30; // High-ticket services
  } else if (data.businessType === "multi_location") {
    score += 25;
  } else {
    score += 10;
  }

  // Location count scoring
  const locations = parseInt(data.locationCount) || 1;
  if (locations >= 5) {
    score += 30; // Multi-location bonus
  } else if (locations >= 2) {
    score += 20;
  } else {
    score += 10;
  }

  // Website presence scoring
  if (data.websiteUrl && data.websiteUrl.includes(".")) {
    score += 20; // Has existing website
  }

  // Goal scoring
  if (data.primaryGoal === "bookings" || data.primaryGoal === "leads") {
    score += 20;
  } else {
    score += 10;
  }

  return score;
}

const QUALIFICATION_THRESHOLD = 50;

export default function Audit() {
  const [step, setStep] = useState<"form" | "qualification" | "confirmed">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadScore, setLeadScore] = useState(0);
  const [formData, setFormData] = useState<AuditFormData>({
    businessName: "",
    websiteUrl: "",
    businessType: "",
    locationCount: "1",
    primaryGoal: "",
    email: "",
    additionalNotes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.businessName || !formData.email || !formData.businessType) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    // Calculate lead score - Workstream B
    const score = calculateLeadScore(formData);
    setLeadScore(score);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);

    if (score < QUALIFICATION_THRESHOLD) {
      setStep("qualification");
    } else {
      setStep("confirmed");
      toast.success("Audit request submitted successfully");
    }
  };

  const updateField = (field: keyof AuditFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col" data-surface="marketing">
      <Navigation />

      <div className="pt-24 pb-16 flex-1">
        <div className="container max-w-3xl">
          {/* Form Step */}
          {step === "form" && (
            <>
              <div className="text-center mb-12">
                <h1 className="mb-4">Free Growth & Fulfillment Audit</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  See what we'd automate first in your business.
                </p>
                <p className="text-muted-foreground mt-2">
                  We'll review your current site, content, and local presence. You'll receive a concrete plan, not a pitch.
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Tell us about your business</CardTitle>
                  <CardDescription>
                    This information helps us provide a relevant, actionable audit.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name *</Label>
                        <Input
                          id="businessName"
                          placeholder="Acme Med Spa"
                          value={formData.businessName}
                          onChange={(e) => updateField("businessName", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={(e) => updateField("email", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="websiteUrl">Website URL</Label>
                      <Input
                        id="websiteUrl"
                        placeholder="https://yoursite.com"
                        value={formData.websiteUrl}
                        onChange={(e) => updateField("websiteUrl", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        If you don't have a website yet, leave this blank.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type *</Label>
                      <Select
                        value={formData.businessType}
                        onValueChange={(value) => updateField("businessType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your business type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="med_spa">Med Spa / Aesthetic Clinic</SelectItem>
                          <SelectItem value="dental_implants">Dental Implant Practice</SelectItem>
                          <SelectItem value="multi_location">Multi-location Service Business</SelectItem>
                          <SelectItem value="other">Other Service Business</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Number of Locations</Label>
                      <RadioGroup
                        value={formData.locationCount}
                        onValueChange={(value) => updateField("locationCount", value)}
                        className="flex flex-wrap gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="1" id="loc-1" />
                          <Label htmlFor="loc-1" className="font-normal">1 location</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="2" id="loc-2" />
                          <Label htmlFor="loc-2" className="font-normal">2-4 locations</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="5" id="loc-5" />
                          <Label htmlFor="loc-5" className="font-normal">5+ locations</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label>Primary Goal *</Label>
                      <RadioGroup
                        value={formData.primaryGoal}
                        onValueChange={(value) => updateField("primaryGoal", value)}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="leads" id="goal-leads" />
                          <Label htmlFor="goal-leads" className="font-normal">Generate more qualified leads</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="bookings" id="goal-bookings" />
                          <Label htmlFor="goal-bookings" className="font-normal">Increase booked consultations</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="visibility" id="goal-visibility" />
                          <Label htmlFor="goal-visibility" className="font-normal">Improve local visibility / SEO</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="content" id="goal-content" />
                          <Label htmlFor="goal-content" className="font-normal">Consistent content marketing</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes (optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any specific challenges, goals, or context we should know about..."
                        value={formData.additionalNotes}
                        onChange={(e) => updateField("additionalNotes", e.target.value)}
                        rows={3}
                      />
                    </div>

                    <Button type="submit" className="w-full gradient-primary" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Request Audit
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      We'll respond within 24-48 hours. No spam, no aggressive follow-up.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </>
          )}

          {/* Qualification Step - Workstream B (Low Score) */}
          {step === "qualification" && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <h1 className="mb-4">Thanks for your interest</h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
                Based on your responses, we may not be the right fit right now.
              </p>

              <Card className="max-w-lg mx-auto text-left">
                <CardHeader>
                  <CardTitle className="text-lg">What we recommend instead</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Start with a simple website</p>
                      <p className="text-sm text-muted-foreground">
                        If you don't have a website yet, start there first. We can help later.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Focus on service delivery</p>
                      <p className="text-sm text-muted-foreground">
                        Marketing automation works best when your core service is solid.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Check back when you're ready to scale</p>
                      <p className="text-sm text-muted-foreground">
                        We work best with businesses ready for consistent, predictable marketing.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-8 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Still think we might be a fit? <a href="mailto:support@leadengine.kiasufamilytrust.org" className="text-primary hover:underline">Email us directly</a>.
                </p>
                <Button variant="outline" onClick={() => setStep("form")}>
                  Start Over
                </Button>
              </div>
            </div>
          )}

          {/* Confirmed Step */}
          {step === "confirmed" && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--status-green)]/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-[var(--status-green)]" />
              </div>
              <h1 className="mb-4">Audit Request Received</h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
                We'll review your business and send a personalized audit within 24-48 hours.
              </p>

              <Card className="max-w-lg mx-auto text-left mb-8">
                <CardHeader>
                  <CardTitle className="text-lg">What we'll review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <FileSearch className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Website & content analysis</p>
                      <p className="text-sm text-muted-foreground">
                        Current pages, SEO health, conversion opportunities
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ClipboardCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Local presence audit</p>
                      <p className="text-sm text-muted-foreground">
                        Google Business Profile, citations, local rankings
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Prioritized action plan</p>
                      <p className="text-sm text-muted-foreground">
                        What we'd automate first and expected impact
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* What happens after you subscribe - Workstream C */}
              <Card className="max-w-lg mx-auto text-left mb-8 border-dashed">
                <CardHeader>
                  <CardTitle className="text-lg">If it's a fit, here's what happens next</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">Day 0</span>
                      <span className="text-muted-foreground">Access granted + onboarding checklist sent</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">Day 1-2</span>
                      <span className="text-muted-foreground">First deliverables queued based on audit</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">Week 1</span>
                      <span className="text-muted-foreground">Initial outputs delivered + dashboard access</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">Ongoing</span>
                      <span className="text-muted-foreground">Weekly reporting + monthly quota fulfillment</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <p className="text-sm text-muted-foreground mb-4">
                Check your email at <strong>{formData.email}</strong> for updates.
              </p>
              <Button variant="outline" asChild>
                <a href="/pricing">View Plans While You Wait</a>
              </Button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
