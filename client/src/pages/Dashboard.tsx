import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, FileText, Search, Link as LinkIcon, MapPin, BarChart3, Clock, CalendarDays, CreditCard, Loader2, AlertCircle, Flag, Activity, ExternalLink, Sparkles } from "lucide-react";
import { Link } from "wouter";

// Manage Subscription Button - Opens RevenueCat Customer Portal
function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const createPortal = trpc.billing.createPortal.useMutation();

  const handleClick = async () => {
    setLoading(true);
    try {
      const { portalUrl } = await createPortal.mutateAsync();
      if (portalUrl) {
        window.open(portalUrl, "_blank");
      } else {
        toast.info("Subscription management coming soon. Contact support if you need assistance.");
      }
    } catch (error) {
      toast.error("Unable to open subscription portal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="default" 
      size="sm" 
      onClick={handleClick}
      disabled={loading}
      className="gradient-primary"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <ExternalLink className="w-4 h-4 mr-2" />
      )}
      Manage Subscription
    </Button>
  );
}

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [flagIssueOpen, setFlagIssueOpen] = useState(false);
  const [flagIssueMessage, setFlagIssueMessage] = useState("");
  const [flagIssueSubmitting, setFlagIssueSubmitting] = useState(false);

  const handleFlagIssue = async () => {
    if (!flagIssueMessage.trim()) {
      toast.error("Please describe the issue");
      return;
    }
    setFlagIssueSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("Issue flagged. A team member will review within 24 hours.");
    setFlagIssueMessage("");
    setFlagIssueOpen(false);
    setFlagIssueSubmitting(false);
  };

  const { data: subscription } = trpc.subscriptions.getMySubscription.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: requests } = trpc.deliverableRequests.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: deliverables } = trpc.deliverables.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: quota } = trpc.quota.getCurrent.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const getStatusBadge = (status: string) => {
    const validStatuses = ["requested", "needs_info", "queued", "running", "done", "failed", "paused", "active", "past_due", "canceled", "success"];
    const variant = validStatuses.includes(status) ? status : "secondary";
    const label = status.replace(/_/g, " ");
    return <Badge variant={variant as any}>{label}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      landing_page: FileText,
      blog_post: FileText,
      seo_improvement: Search,
      internal_linking: LinkIcon,
      local_presence: MapPin,
      weekly_report: BarChart3,
    };
    const Icon = icons[type] || FileText;
    return <Icon className="w-4 h-4" />;
  };

  // Calculate activity stats
  const activeRequests = requests?.filter(r => ["queued", "running", "requested"].includes(r.status)) || [];
  const completedThisWeek = requests?.filter(r => {
    if (r.status !== "done" || !r.completedAt) return false;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(r.completedAt) > weekAgo;
  }) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6" data-surface="app">
        {/* Header with System Status */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Welcome back, {user?.name || "there"}!</h1>
            <p className="text-muted-foreground">
              Manage your deliverables, track progress, and view your content library.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* System Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-muted-foreground">System Normal</span>
            </div>
            {/* Flag an Issue */}
            <Dialog open={flagIssueOpen} onOpenChange={setFlagIssueOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Flag className="w-4 h-4 mr-2" />
                  Flag an Issue
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Flag an Issue</DialogTitle>
                  <DialogDescription>
                    Describe the problem you're experiencing. A team member will review within 24 hours.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="issue">Issue Description</Label>
                    <Textarea
                      id="issue"
                      placeholder="Describe the issue..."
                      value={flagIssueMessage}
                      onChange={(e) => setFlagIssueMessage(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setFlagIssueOpen(false)}>Cancel</Button>
                  <Button onClick={handleFlagIssue} disabled={flagIssueSubmitting}>
                    {flagIssueSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Submit
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Activity Summary Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <CardTitle className="text-base">This week's activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {activeRequests.length > 0 || completedThisWeek.length > 0 ? (
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="font-medium text-primary">{completedThisWeek.length}</span>
                  <span className="text-muted-foreground ml-1">completed</span>
                </div>
                <div>
                  <span className="font-medium">{activeRequests.length}</span>
                  <span className="text-muted-foreground ml-1">in progress</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No activity yet. Submit your first request to get started!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
            <Link href="/dashboard/requests">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <FileText className="w-5 h-5 text-primary" />
                  <Badge variant="secondary">{requests?.length || 0}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-medium group-hover:text-primary transition-colors">Deliverable Requests</h3>
                <p className="text-sm text-muted-foreground mt-1">View and manage your requests</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
            <Link href="/dashboard/library">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <Badge variant="secondary">{deliverables?.length || 0}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-medium group-hover:text-primary transition-colors">Content Library</h3>
                <p className="text-sm text-muted-foreground mt-1">Browse completed deliverables</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
            <Link href="/dashboard/quota">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  {quota && (
                    <span className="text-sm text-muted-foreground">
                      {quota.landingPagesUsed + quota.blogPostsUsed}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-medium group-hover:text-primary transition-colors">Usage & Quota</h3>
                <p className="text-sm text-muted-foreground mt-1">Track your monthly usage</p>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Recent Requests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Requests</CardTitle>
              <Link href="/request">
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Request
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {requests && requests.length > 0 ? (
              <div className="space-y-3">
                {requests.slice(0, 5).map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(request.type)}
                      <div>
                        <p className="font-medium text-sm">{request.type.replace(/_/g, " ")}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
                <h3 className="font-medium mb-1">No requests yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Submit your first deliverable request to put your subscription to work.
                </p>
                <Link href="/request">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Request
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription Info */}
        {subscription && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Your Subscription</CardTitle>
                <ManageSubscriptionButton />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-medium capitalize">{subscription.plan?.replace(/_/g, " ") || "Free"}</p>
                  <p className="text-sm text-muted-foreground">
                    {subscription.status === "active" ? "Active" : subscription.status}
                  </p>
                </div>
                {subscription.currentPeriodEnd && (
                  <div className="text-sm text-muted-foreground">
                    Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Note */}
        <p className="text-xs text-muted-foreground text-center">
          Deliverables are processed in a shared queue. Turnaround times are estimates, not guarantees.
          Complex requests may consume more than one unit. We'll confirm scope before execution if unclear.
        </p>
      </div>
    </DashboardLayout>
  );
}
