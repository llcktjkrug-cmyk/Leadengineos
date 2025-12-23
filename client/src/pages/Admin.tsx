import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Plus, Users, Building2, CreditCard, FileText, Activity, AlertTriangle, TrendingDown, Gauge, BarChart3, Mail, ArrowUpRight, ArrowDownRight, Target } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTenant, setNewTenant] = useState({ name: "", slug: "", vertical: "" });

  const utils = trpc.useUtils();

  const { data: tenants } = trpc.tenants.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: users } = trpc.users.listAll.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: subscriptions } = trpc.subscriptions.listAll.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: blogPosts } = trpc.blog.listAllPosts.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: workflows } = trpc.workflows.listAllRuns.useQuery(
    { limit: 50 },
    {
      enabled: isAuthenticated && user?.role === "admin",
    }
  );

  const createTenant = trpc.tenants.create.useMutation({
    onSuccess: (data) => {
      toast.success(`Tenant created! API Key: ${data.apiKey}`);
      setCreateDialogOpen(false);
      setNewTenant({ name: "", slug: "", vertical: "" });
      utils.tenants.list.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to create tenant");
      console.error(error);
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col" data-surface="app">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>Admin access required</CardDescription>
            </CardHeader>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const handleCreateTenant = () => {
    if (!newTenant.name || !newTenant.slug) {
      toast.error("Name and slug are required");
      return;
    }

    createTenant.mutate({
      name: newTenant.name,
      slug: newTenant.slug,
      vertical: newTenant.vertical as any,
    });
  };

  return (
    <div className="min-h-screen flex flex-col" data-surface="app">
      <Navigation />

      <div className="pt-24 pb-16 flex-1">
        <div className="container">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="mb-2">Admin Portal</h1>
              <p className="text-muted-foreground">Manage tenants, content, subscriptions, and workflows.</p>
            </div>
            <Link href="/admin/blog">
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Manage Blog
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Tenants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{tenants?.length || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{users?.length || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {subscriptions?.filter((s) => s.status === "active").length || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Published Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {blogPosts?.filter((p) => p.status === "published").length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="tenants" className="space-y-6">
            <TabsList>
              <TabsTrigger value="distribution">Distribution</TabsTrigger>
              <TabsTrigger value="tenants">Tenants</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="workflows">Workflows</TabsTrigger>
            </TabsList>

            {/* Distribution Dashboard - Workstream G */}
            <TabsContent value="distribution" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Distribution Dashboard</h2>
                  <p className="text-sm text-muted-foreground">Track audit funnel performance and lead quality</p>
                </div>
                <Link href="/admin/templates">
                  <Button variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Templates
                  </Button>
                </Link>
              </div>

              {/* Funnel Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Audit Requests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">24</div>
                    <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <ArrowUpRight className="w-4 h-4 text-[var(--status-green)]" />
                      Qualified (50+)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">18</div>
                    <p className="text-xs text-muted-foreground mt-1">75% qualification rate</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <ArrowDownRight className="w-4 h-4 text-muted-foreground" />
                      Disqualified
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">6</div>
                    <p className="text-xs text-muted-foreground mt-1">Soft rejection sent</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      Converted
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">5</div>
                    <p className="text-xs text-muted-foreground mt-1">28% of qualified</p>
                  </CardContent>
                </Card>
              </div>

              {/* Lead Score Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lead Score Distribution</CardTitle>
                  <CardDescription>Breakdown of audit requests by qualification score</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="w-24 text-sm text-muted-foreground">80-100 pts</span>
                      <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                        <div className="h-full bg-[var(--status-green)]" style={{ width: "40%" }}></div>
                      </div>
                      <span className="w-12 text-sm font-medium text-right">10</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="w-24 text-sm text-muted-foreground">50-79 pts</span>
                      <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: "32%" }}></div>
                      </div>
                      <span className="w-12 text-sm font-medium text-right">8</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="w-24 text-sm text-muted-foreground">0-49 pts</span>
                      <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                        <div className="h-full bg-muted-foreground/50" style={{ width: "24%" }}></div>
                      </div>
                      <span className="w-12 text-sm font-medium text-right">6</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Audit Requests */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Audit Requests</CardTitle>
                  <CardDescription>Latest submissions from the audit funnel</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { business: "Glow Med Spa", type: "med_spa", score: 80, status: "qualified", date: "Dec 15" },
                      { business: "Bright Smile Implants", type: "dental_implants", score: 70, status: "qualified", date: "Dec 14" },
                      { business: "Metro Clinics", type: "multi_location", score: 85, status: "converted", date: "Dec 13" },
                      { business: "Joe's Barbershop", type: "other", score: 30, status: "disqualified", date: "Dec 12" },
                      { business: "Elite Aesthetics", type: "med_spa", score: 90, status: "qualified", date: "Dec 11" },
                    ].map((request, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{request.business}</p>
                            <p className="text-xs text-muted-foreground">{request.type.replace("_", " ")} • {request.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono">{request.score} pts</span>
                          <Badge
                            variant={
                              request.status === "converted"
                                ? "default"
                                : request.status === "qualified"
                                ? "secondary"
                                : "outline"
                            }
                            className={request.status === "converted" ? "bg-[var(--status-green)]" : ""}
                          >
                            {request.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Outbound Activity */}
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-lg">Outbound Activity</CardTitle>
                  <CardDescription>Manual outreach tracking (update manually)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">12</p>
                      <p className="text-xs text-muted-foreground">Emails Sent</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">4</p>
                      <p className="text-xs text-muted-foreground">Replies</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">1</p>
                      <p className="text-xs text-muted-foreground">Meetings Booked</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tenants */}
            <TabsContent value="tenants" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Tenants</h2>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gradient-primary">
                      <Plus className="mr-2 w-4 h-4" />
                      New Tenant
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Tenant</DialogTitle>
                      <DialogDescription>Add a new tenant to the system</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={newTenant.name}
                          onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                          placeholder="Acme Med Spa"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                          id="slug"
                          value={newTenant.slug}
                          onChange={(e) => setNewTenant({ ...newTenant, slug: e.target.value })}
                          placeholder="acme-med-spa"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vertical">Vertical (Optional)</Label>
                        <Input
                          id="vertical"
                          value={newTenant.vertical}
                          onChange={(e) => setNewTenant({ ...newTenant, vertical: e.target.value })}
                          placeholder="med_spa, dental_implants, multi_location"
                        />
                      </div>
                      <Button onClick={handleCreateTenant} className="w-full" disabled={createTenant.isPending}>
                        {createTenant.isPending ? "Creating..." : "Create Tenant"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tenants?.map((tenant) => (
                  <Card key={tenant.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base">{tenant.name}</CardTitle>
                            <CardDescription className="text-xs">{tenant.slug}</CardDescription>
                          </div>
                        </div>
                        <Badge variant={tenant.status === "active" ? "default" : "secondary"}>
                          {tenant.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {tenant.vertical && (
                          <div>
                            <span className="text-muted-foreground">Vertical:</span>{" "}
                            <span className="font-medium">{tenant.vertical}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Created:</span>{" "}
                          <span>{new Date(tenant.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Users */}
            <TabsContent value="users" className="space-y-6">
              <h2 className="text-2xl font-semibold">Users</h2>

              <div className="space-y-4">
                {users?.map((user) => (
                  <Card key={user.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5 text-accent" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{user.name || "Unnamed User"}</CardTitle>
                            <CardDescription>{user.email || "No email"}</CardDescription>
                          </div>
                        </div>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Subscriptions */}
            <TabsContent value="subscriptions" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Subscriptions</h2>
                {/* Profit Protection Summary - Workstream G */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-[var(--status-amber)]">
                    <Gauge className="w-4 h-4" />
                    <span>Near Quota: {subscriptions?.filter((_, i) => i % 3 === 0).length || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[var(--status-red)]">
                    <AlertTriangle className="w-4 h-4" />
                    <span>High Scope: {subscriptions?.filter((_, i) => i % 5 === 0).length || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <TrendingDown className="w-4 h-4" />
                    <span>Low Util: {subscriptions?.filter((_, i) => i % 4 === 0).length || 0}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {subscriptions?.map((sub, index) => {
                  // Mock profit protection flags (in production, calculate from actual quota data)
                  const isNearQuota = index % 3 === 0;
                  const isHighScope = index % 5 === 0;
                  const isLowUtil = index % 4 === 0 && !isNearQuota;

                  return (
                    <Card key={sub.id} className={isHighScope ? "border-[var(--status-red)]/30" : isNearQuota ? "border-[var(--status-amber)]/30" : ""}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <CreditCard className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-base flex items-center gap-2">
                                Tenant ID: {sub.tenantId}
                                {/* Profit Protection Flags - Workstream G */}
                                {isNearQuota && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-[var(--status-amber)]/10 text-[var(--status-amber)] rounded">
                                    <Gauge className="w-3 h-3" />
                                    Near Quota
                                  </span>
                                )}
                                {isHighScope && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-[var(--status-red)]/10 text-[var(--status-red)] rounded">
                                    <AlertTriangle className="w-3 h-3" />
                                    High Scope
                                  </span>
                                )}
                                {isLowUtil && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-muted text-muted-foreground rounded">
                                    <TrendingDown className="w-3 h-3" />
                                    Low Util
                                  </span>
                                )}
                              </CardTitle>
                              <CardDescription>
                                Customer: {sub.revenuecatCustomerId || "N/A"}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge
                            variant={
                              sub.status === "active"
                                ? "default"
                                : sub.status === "past_due"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {sub.status}
                          </Badge>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Content */}
            <TabsContent value="content" className="space-y-6">
              <h2 className="text-2xl font-semibold">Blog Posts</h2>

              <div className="space-y-4">
                {blogPosts?.map((post) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-accent" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-base line-clamp-1">{post.title}</CardTitle>
                            <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
                          </div>
                        </div>
                        <Badge variant={post.status === "published" ? "default" : "secondary"}>
                          {post.status}
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Workflows */}
            <TabsContent value="workflows" className="space-y-6">
              <h2 className="text-2xl font-semibold">Workflow Runs</h2>

              <div className="space-y-4">
                {workflows?.map((run) => (
                  <Card key={run.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Activity className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{run.workflowName}</CardTitle>
                            <CardDescription>
                              Tenant ID: {run.tenantId} • {new Date(run.startedAt).toLocaleString()}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant={
                            run.status === "success"
                              ? "default"
                              : run.status === "failed"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {run.status}
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}
