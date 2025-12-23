import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { CreditCard, Loader2, ExternalLink, Calendar, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function DashboardBilling() {
  const { isAuthenticated } = useAuth();
  const [portalLoading, setPortalLoading] = useState(false);

  const { data: subscription, isLoading } = trpc.subscriptions.getMySubscription.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createPortal = trpc.billing.createPortal.useMutation();

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { portalUrl } = await createPortal.mutateAsync();
      if (portalUrl) {
        window.open(portalUrl, "_blank");
      } else {
        toast.info("Billing portal is being configured. Please check back soon.");
      }
    } catch (error) {
      toast.error("Unable to open billing portal. Please try again.");
    } finally {
      setPortalLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: "active",
      canceled: "canceled",
      past_due: "past_due",
      expired: "failed",
      trialing: "queued",
    };
    return <Badge variant={(variants[status] || "secondary") as any}>{status.replace(/_/g, " ")}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" data-surface="app">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold mb-1">Billing</h1>
          <p className="text-muted-foreground">
            Manage your subscription and billing details.
          </p>
        </div>

        {/* Subscription Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Current Subscription</CardTitle>
                <CardDescription>Your plan and billing status</CardDescription>
              </div>
              <Button
                onClick={handleManageSubscription}
                disabled={portalLoading}
              >
                {portalLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4 mr-2" />
                )}
                Manage Subscription
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : subscription ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-muted">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium capitalize">
                      {subscription.plan?.replace(/_/g, " ") || "Free Plan"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(subscription.status)}
                    </div>
                  </div>
                </div>

                {subscription.currentPeriodEnd && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {subscription.cancelAtPeriodEnd
                        ? `Cancels on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                        : `Next billing: ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-medium mb-2">Billing setup in progress</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Your billing portal is being configured. Please check back soon or contact support if you need immediate assistance.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              For billing questions or to request plan changes, contact us at{" "}
              <a href="mailto:support@leadengineos.com" className="text-primary hover:underline">
                support@leadengineos.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
