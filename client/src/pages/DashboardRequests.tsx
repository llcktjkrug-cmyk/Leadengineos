import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Plus, FileText, Search, Link as LinkIcon, MapPin, BarChart3, Loader2, Filter } from "lucide-react";
import { Link } from "wouter";

export default function DashboardRequests() {
  const { isAuthenticated } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: requests, isLoading } = trpc.deliverableRequests.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const getStatusBadge = (status: string) => {
    const validStatuses = ["requested", "needs_info", "queued", "running", "done", "failed", "paused"];
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

  const filteredRequests = requests?.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (typeFilter !== "all" && r.type !== typeFilter) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6" data-surface="app">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Deliverable Requests</h1>
            <p className="text-muted-foreground">
              Track and manage your content requests.
            </p>
          </div>
          <Link href="/request">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter:</span>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="requested">Requested</SelectItem>
              <SelectItem value="queued">Queued</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="landing_page">Landing Page</SelectItem>
              <SelectItem value="blog_post">Blog Post</SelectItem>
              <SelectItem value="seo_improvement">SEO Improvement</SelectItem>
              <SelectItem value="internal_linking">Internal Linking</SelectItem>
              <SelectItem value="local_presence">Local Presence</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Request List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Requests</CardTitle>
            <CardDescription>
              {filteredRequests?.length || 0} request{filteredRequests?.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredRequests && filteredRequests.length > 0 ? (
              <div className="space-y-3">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-md bg-muted">
                        {getTypeIcon(request.type)}
                      </div>
                      <div>
                        <p className="font-medium">
                          {request.type.replace(/_/g, " ")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Created {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(request.status)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-medium mb-2">No requests yet</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  A deliverable request is how you tell us what content you need. 
                  Submit a request for landing pages, blog posts, SEO improvements, 
                  or local presence content.
                </p>
                <Link href="/request">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Request
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
