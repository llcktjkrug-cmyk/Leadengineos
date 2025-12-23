import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { BarChart3, Loader2, RefreshCw, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function DashboardQuota() {
  const { isAuthenticated } = useAuth();

  const { data: quota, isLoading: quotaLoading } = trpc.quota.getCurrent.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: subscription, isLoading: subLoading } = trpc.subscriptions.getMySubscription.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Get dynamic plan limits from backend
  const { data: limits, isLoading: limitsLoading } = trpc.subscriptions.getMyPlanLimits.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const isLoading = quotaLoading || subLoading || limitsLoading;

  const quotaItems = quota && limits ? [
    { label: "Landing Pages", used: quota.landingPagesUsed, limit: limits.landingPages },
    { label: "Blog Posts", used: quota.blogPostsUsed, limit: limits.blogPosts },
    { label: "SEO Improvements", used: quota.seoImprovementsUsed, limit: limits.seoImprovements },
    { label: "Internal Linking", used: quota.internalLinkingUsed, limit: limits.internalLinking },
    { label: "Local Presence", used: quota.localPresenceUsed, limit: limits.localPresence },
  ] : [];

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-primary";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" data-surface="app">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold mb-1">Usage & Quota</h1>
          <p className="text-muted-foreground">
            Track your monthly deliverable usage and plan limits.
          </p>
        </div>

        {/* Quota Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Monthly Usage</CardTitle>
                <CardDescription>
                  {quota ? (
                    <>
                      Period: {new Date(quota.periodStart).toLocaleDateString()} - {new Date(quota.periodEnd).toLocaleDateString()}
                    </>
                  ) : (
                    "Renews monthly"
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="w-4 h-4" />
                <span>Renews monthly</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : quota && limits ? (
              <div className="space-y-6">
                {quotaItems.map((item) => {
                  const percentage = item.limit > 0 ? (item.used / item.limit) * 100 : 0;
                  const isNearLimit = percentage >= 75;
                  return (
                    <div key={item.label} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.label}</span>
                        <span className={isNearLimit ? "text-yellow-600 font-medium" : "text-muted-foreground"}>
                          {item.used} / {item.limit} used
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(percentage, 100)} 
                        className="h-2"
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-medium mb-2">No usage data yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your quota usage will appear here once you start submitting requests.
                </p>
                <Link href="/request">
                  <Button variant="outline" size="sm">
                    Submit Your First Request
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plan Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium capitalize text-lg">
                  {subscription?.plan?.replace(/_/g, " ") || "Starter"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Quota resets at the start of each billing period.
                </p>
              </div>
              <Link href="/dashboard/billing">
                <Button variant="outline" size="sm">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Plan Limits Reference */}
        {limits && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Plan Limits</CardTitle>
              <CardDescription>
                Monthly deliverable limits based on your current plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-semibold">{limits.landingPages}</p>
                  <p className="text-xs text-muted-foreground">Landing Pages</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-semibold">{limits.blogPosts}</p>
                  <p className="text-xs text-muted-foreground">Blog Posts</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-semibold">{limits.seoImprovements}</p>
                  <p className="text-xs text-muted-foreground">SEO Improvements</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-semibold">{limits.internalLinking}</p>
                  <p className="text-xs text-muted-foreground">Internal Linking</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-semibold">{limits.localPresence}</p>
                  <p className="text-xs text-muted-foreground">Local Presence</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
