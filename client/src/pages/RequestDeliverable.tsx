import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, FileText, Globe, Link, MapPin, BarChart, Loader2, AlertCircle, Lightbulb } from "lucide-react";

type DeliverableType = "landing_page" | "blog_post" | "seo_improvement" | "internal_linking" | "local_presence" | "weekly_report";

interface RequestData {
  type: DeliverableType;
  // Blog post fields
  topic?: string;
  keywords?: string[];
  targetWordCount?: number;
  // Landing page fields
  service?: string;
  location?: string;
  targetAudience?: string;
  uniqueSellingPoints?: string[];
  // SEO improvement fields
  pageUrl?: string;
  targetKeywords?: string[];
  // General
  notes?: string;
}

const deliverableTypes = [
  {
    value: "blog_post" as const,
    label: "Blog Post",
    description: "SEO-optimized blog content (1200-1800 words)",
    icon: FileText,
  },
  {
    value: "landing_page" as const,
    label: "Landing Page",
    description: "Conversion-focused service or location page",
    icon: Globe,
  },
  {
    value: "seo_improvement" as const,
    label: "SEO Improvement",
    description: "On-page SEO analysis and recommendations",
    icon: BarChart,
  },
  {
    value: "internal_linking" as const,
    label: "Internal Linking",
    description: "Strategic internal link suggestions",
    icon: Link,
  },
  {
    value: "local_presence" as const,
    label: "Local Presence",
    description: "Location-specific content and optimization",
    icon: MapPin,
  },
];

export default function RequestDeliverable() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [requestData, setRequestData] = useState<RequestData>({
    type: "blog_post",
  });

  const { data: quota, isLoading: quotaLoading } = trpc.quota.getCurrent.useQuery();
  const createRequest = trpc.deliverableRequests.create.useMutation({
    onSuccess: () => {
      toast.success("Request submitted. You can track its progress in your Dashboard.");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit request. Please try again.");
    },
  });

  const handleTypeSelect = (type: DeliverableType) => {
    setRequestData({ type });
    setStep(2);
  };

  const handleSubmit = () => {
    // Validate required fields based on type
    if (requestData.type === "blog_post") {
      if (!requestData.topic || !requestData.keywords || requestData.keywords.length === 0) {
        toast.error("Please provide topic and keywords");
        return;
      }
    } else if (requestData.type === "landing_page") {
      if (!requestData.service || !requestData.targetAudience) {
        toast.error("Please provide service and target audience");
        return;
      }
    } else if (requestData.type === "seo_improvement") {
      if (!requestData.pageUrl) {
        toast.error("Please provide page URL");
        return;
      }
    }

    // Check quota
    if (quota) {
      const quotaKey = `${requestData.type}sUsed` as keyof typeof quota;
      const quotaLimit = `max${requestData.type.charAt(0).toUpperCase() + requestData.type.slice(1)}s` as keyof typeof quota;
      
      // @ts-ignore - quota types are dynamic
      if (quota[quotaKey] >= quota[quotaLimit]) {
        toast.error("Monthly quota exceeded for this deliverable type");
        return;
      }
    }

    createRequest.mutate({
      type: requestData.type,
      requestData: JSON.stringify(requestData),
    });
  };

  if (quotaLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Helper to get remaining quota for a type
  const getRemainingQuota = (type: string) => {
    if (!quota) return null;
    const quotaMap: Record<string, { used: number; max: number }> = {
      blog_post: { used: quota.blogPostsUsed || 0, max: 8 },
      landing_page: { used: quota.landingPagesUsed || 0, max: 5 },
      seo_improvement: { used: quota.seoImprovementsUsed || 0, max: 25 },
      internal_linking: { used: quota.internalLinkingUsed || 0, max: 15 },
      local_presence: { used: quota.localPresenceUsed || 0, max: 4 },
    };
    return quotaMap[type] || null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background py-12 px-4">
      <div className="container max-w-4xl">
        <Button variant="ghost" onClick={() => (step === 1 ? setLocation("/dashboard") : setStep(1))} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Request Deliverable</h1>
          <p className="text-muted-foreground">Choose a deliverable type and provide details for your request</p>
        </div>

        {/* Quota Summary */}
        {quota && step === 1 && (
          <Card className="mb-6 bg-muted/50">
            <CardContent className="py-4">
              <div className="text-sm font-medium mb-2">Your remaining quota this month:</div>
              <div className="flex flex-wrap gap-4 text-sm">
                <span>Landing Pages: <strong>{5 - (quota.landingPagesUsed || 0)}</strong> of 5</span>
                <span>Blog Posts: <strong>{8 - (quota.blogPostsUsed || 0)}</strong> of 8</span>
                <span>SEO: <strong>{25 - (quota.seoImprovementsUsed || 0)}</strong> of 25</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scope Guidance - Workstream C */}
        {step === 1 && (
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Card className="bg-[var(--status-green)]/5 border-[var(--status-green)]/20">
              <CardContent className="py-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-[var(--status-green)]" />
                  <span className="text-sm font-medium">Good request examples</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>"Blog post about Botox recovery timeline"</li>
                  <li>"Landing page for All-on-4 implants in Dallas"</li>
                  <li>"SEO improvements for our homepage"</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-[var(--status-amber)]/5 border-[var(--status-amber)]/20">
              <CardContent className="py-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-[var(--status-amber)]" />
                  <span className="text-sm font-medium">May use multiple units</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Multi-page content series</li>
                  <li>Complete site-wide SEO audit</li>
                  <li>Complex landing pages with forms</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8 gap-2">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {step > 1 ? <Check className="h-4 w-4" /> : "1"}
          </div>
          <div className={`h-1 w-16 ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {step > 2 ? <Check className="h-4 w-4" /> : "2"}
          </div>
          <div className={`h-1 w-16 ${step >= 3 ? "bg-primary" : "bg-muted"}`} />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>3</div>
        </div>

        {/* Step 1: Choose deliverable type */}
        {step === 1 && (
          <div className="grid md:grid-cols-2 gap-4">
            {deliverableTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card
                  key={type.value}
                  className="cursor-pointer hover:border-primary hover:shadow-lg transition-all"
                  onClick={() => handleTypeSelect(type.value)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>{type.label}</CardTitle>
                        <CardDescription>{type.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        )}

        {/* Step 2: Provide details */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>{deliverableTypes.find((t) => t.value === requestData.type)?.label} Details</CardTitle>
              <CardDescription>Provide information for your {requestData.type.replace("_", " ")} request</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {requestData.type === "blog_post" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="topic">Blog Post Topic *</Label>
                    <Input
                      id="topic"
                      placeholder="e.g., 5 Ways Med Spas Can Increase Booked Consultations"
                      value={requestData.topic || ""}
                      onChange={(e) => setRequestData({ ...requestData, topic: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="keywords">Target Keywords * (comma-separated)</Label>
                    <Input
                      id="keywords"
                      placeholder="e.g., med spa marketing, booked consultations, aesthetic clinic"
                      value={requestData.keywords?.join(", ") || ""}
                      onChange={(e) =>
                        setRequestData({
                          ...requestData,
                          keywords: e.target.value.split(",").map((k) => k.trim()),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wordCount">Target Word Count</Label>
                    <Select
                      value={requestData.targetWordCount?.toString() || "1500"}
                      onValueChange={(value) => setRequestData({ ...requestData, targetWordCount: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1200">1200 words (Quick read)</SelectItem>
                        <SelectItem value="1500">1500 words (Standard)</SelectItem>
                        <SelectItem value="1800">1800 words (In-depth)</SelectItem>
                        <SelectItem value="2500">2500 words (Comprehensive)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {requestData.type === "landing_page" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="service">Service Name *</Label>
                    <Input
                      id="service"
                      placeholder="e.g., Botox, Dental Implants, Local SEO"
                      value={requestData.service || ""}
                      onChange={(e) => setRequestData({ ...requestData, service: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location (optional)</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Beverly Hills, CA"
                      value={requestData.location || ""}
                      onChange={(e) => setRequestData({ ...requestData, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">Target Audience *</Label>
                    <Input
                      id="targetAudience"
                      placeholder="e.g., Women 35-55 seeking anti-aging treatments"
                      value={requestData.targetAudience || ""}
                      onChange={(e) => setRequestData({ ...requestData, targetAudience: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="usps">Unique Selling Points (comma-separated)</Label>
                    <Textarea
                      id="usps"
                      placeholder="e.g., Board-certified doctors, 15+ years experience, Free consultations"
                      value={requestData.uniqueSellingPoints?.join(", ") || ""}
                      onChange={(e) =>
                        setRequestData({
                          ...requestData,
                          uniqueSellingPoints: e.target.value.split(",").map((u) => u.trim()),
                        })
                      }
                    />
                  </div>
                </>
              )}

              {requestData.type === "seo_improvement" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="pageUrl">Page URL *</Label>
                    <Input
                      id="pageUrl"
                      placeholder="https://yoursite.com/page-to-improve"
                      value={requestData.pageUrl || ""}
                      onChange={(e) => setRequestData({ ...requestData, pageUrl: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetKeywords">Target Keywords (comma-separated)</Label>
                    <Input
                      id="targetKeywords"
                      placeholder="e.g., botox near me, best med spa"
                      value={requestData.targetKeywords?.join(", ") || ""}
                      onChange={(e) =>
                        setRequestData({
                          ...requestData,
                          targetKeywords: e.target.value.split(",").map((k) => k.trim()),
                        })
                      }
                    />
                  </div>
                </>
              )}

              {(requestData.type === "internal_linking" || requestData.type === "local_presence") && (
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Information</Label>
                  <Textarea
                    id="notes"
                    placeholder="Provide any additional context or requirements..."
                    value={requestData.notes || ""}
                    onChange={(e) => setRequestData({ ...requestData, notes: e.target.value })}
                    rows={4}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="general-notes">Additional Notes (optional)</Label>
                <Textarea
                  id="general-notes"
                  placeholder="Any specific requirements, tone preferences, or topics to avoid..."
                  value={requestData.notes || ""}
                  onChange={(e) => setRequestData({ ...requestData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)}>
                  Review Request
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review and submit */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Review Your Request</CardTitle>
              <CardDescription>Please review the details before submitting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Deliverable Type</p>
                  <p className="text-lg font-semibold">{deliverableTypes.find((t) => t.value === requestData.type)?.label}</p>
                </div>

                {requestData.type === "blog_post" && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Topic</p>
                      <p>{requestData.topic}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Keywords</p>
                      <p>{requestData.keywords?.join(", ")}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Word Count</p>
                      <p>{requestData.targetWordCount || 1500} words</p>
                    </div>
                  </>
                )}

                {requestData.type === "landing_page" && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Service</p>
                      <p>{requestData.service}</p>
                    </div>
                    {requestData.location && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Location</p>
                        <p>{requestData.location}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Target Audience</p>
                      <p>{requestData.targetAudience}</p>
                    </div>
                    {requestData.uniqueSellingPoints && requestData.uniqueSellingPoints.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Unique Selling Points</p>
                        <ul className="list-disc list-inside">
                          {requestData.uniqueSellingPoints.map((usp, i) => (
                            <li key={i}>{usp}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}

                {requestData.type === "seo_improvement" && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Page URL</p>
                      <p className="break-all">{requestData.pageUrl}</p>
                    </div>
                    {requestData.targetKeywords && requestData.targetKeywords.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Target Keywords</p>
                        <p>{requestData.targetKeywords.join(", ")}</p>
                      </div>
                    )}
                  </>
                )}

                {requestData.notes && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Additional Notes</p>
                    <p className="whitespace-pre-wrap">{requestData.notes}</p>
                  </div>
                )}
              </div>

              {/* What happens next */}
              <div className="bg-muted/50 border border-border p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">What happens next</p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Your request enters our processing queue</li>
                  <li>Work begins within 24-48 business hours</li>
                  <li>You will receive an email when complete</li>
                  <li>Deliverable appears in your Content Library</li>
                </ol>
              </div>

              {quota && (
                <div className="bg-[var(--status-blue)]/10 border border-[var(--status-blue)]/20 p-4 rounded-lg">
                  <p className="text-sm font-medium text-[var(--status-blue-foreground)]">Quota Status</p>
                  <p className="text-sm text-[var(--status-blue-foreground)]/80">
                    This request will count toward your monthly {requestData.type.replace(/_/g, " ")} quota.
                  </p>
                </div>
              )}

              {/* Scope Confirmation - Workstream C */}
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>
                  If scope exceeds your remaining quota, we'll confirm before proceeding.
                  Complex requests may consume more than one unit.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Edit Details
                </Button>
                <Button onClick={handleSubmit} disabled={createRequest.isPending}>
                  {createRequest.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
