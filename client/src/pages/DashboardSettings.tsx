import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { User, LogOut, Globe, Loader2, Plus, CheckCircle2, XCircle, RefreshCw, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function DashboardSettings() {
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation();
  const utils = trpc.useUtils();

  // WordPress connections
  const { data: connections, isLoading: connectionsLoading } = trpc.wordpress.listConnections.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createConnectionMutation = trpc.wordpress.createConnection.useMutation({
    onSuccess: () => {
      utils.wordpress.listConnections.invalidate();
      toast.success("WordPress site connected successfully!");
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to connect WordPress site");
    },
  });

  const testConnectionMutation = trpc.wordpress.testConnection.useMutation({
    onSuccess: (result) => {
      utils.wordpress.listConnections.invalidate();
      if (result.success) {
        toast.success("Connection test passed!");
      } else {
        toast.error(`Connection test failed: ${result.error}`);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to test connection");
    },
  });

  const deleteConnectionMutation = trpc.wordpress.deleteConnection.useMutation({
    onSuccess: () => {
      utils.wordpress.listConnections.invalidate();
      toast.success("Connection removed");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove connection");
    },
  });

  const updateConnectionMutation = trpc.wordpress.updateConnection.useMutation({
    onSuccess: () => {
      utils.wordpress.listConnections.invalidate();
      toast.success("Settings updated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update settings");
    },
  });

  // Form state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [siteUrl, setSiteUrl] = useState("");
  const [username, setUsername] = useState("");
  const [applicationPassword, setApplicationPassword] = useState("");
  const [autoPublish, setAutoPublish] = useState(false);

  const resetForm = () => {
    setSiteUrl("");
    setUsername("");
    setApplicationPassword("");
    setAutoPublish(false);
  };

  const handleAddConnection = () => {
    if (!siteUrl || !username || !applicationPassword) {
      toast.error("Please fill in all required fields");
      return;
    }
    createConnectionMutation.mutate({
      siteUrl,
      username,
      applicationPassword,
      autoPublish,
    });
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      window.location.href = "/";
    } catch (error) {
      toast.error("Failed to log out. Please try again.");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" data-surface="app">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold mb-1">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and website connections.
          </p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={undefined} alt={user?.name || undefined} />
                <AvatarFallback className="text-lg">
                  {user?.name ? getInitials(user.name) : <User className="w-6 h-6" />}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-lg">{user?.name || "User"}</p>
                <p className="text-sm text-muted-foreground">{user?.email || "No email"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Website Connections */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Connected Websites</CardTitle>
              <CardDescription>
                WordPress sites connected for automatic content delivery
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Website
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Connect WordPress Site</DialogTitle>
                  <DialogDescription>
                    Enter your WordPress site details. We'll test the connection before saving.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteUrl">Site URL *</Label>
                    <Input
                      id="siteUrl"
                      placeholder="https://yoursite.com"
                      value={siteUrl}
                      onChange={(e) => setSiteUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Must use HTTPS. Include the full URL without trailing slash.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">WordPress Username *</Label>
                    <Input
                      id="username"
                      placeholder="admin"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appPassword">Application Password *</Label>
                    <Input
                      id="appPassword"
                      type="password"
                      placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                      value={applicationPassword}
                      onChange={(e) => setApplicationPassword(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Generate in WordPress: Users → Profile → Application Passwords.{" "}
                      <a
                        href="https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Learn more <ExternalLink className="w-3 h-3" />
                      </a>
                    </p>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoPublish">Auto-publish content</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically publish content when ready (otherwise saves as draft)
                      </p>
                    </div>
                    <Switch
                      id="autoPublish"
                      checked={autoPublish}
                      onCheckedChange={setAutoPublish}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddConnection}
                    disabled={createConnectionMutation.isPending}
                  >
                    {createConnectionMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      "Connect Site"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {connectionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : connections && connections.length > 0 ? (
              <div className="space-y-3">
                {connections.map((connection) => (
                  <div
                    key={connection.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{connection.siteUrl}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {connection.lastTestStatus === "success" ? (
                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Connected
                            </Badge>
                          ) : connection.lastTestStatus === "failed" ? (
                            <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                              <XCircle className="w-3 h-3 mr-1" />
                              Failed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-600">
                              Not tested
                            </Badge>
                          )}
                          {connection.autoPublish && (
                            <Badge variant="secondary" className="text-xs">
                              Auto-publish
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => testConnectionMutation.mutate({ connectionId: connection.id })}
                        disabled={testConnectionMutation.isPending}
                      >
                        {testConnectionMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Connection</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove this WordPress connection? This will not affect any content already published to the site.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteConnectionMutation.mutate({ connectionId: connection.id })}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Globe className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground mb-4">
                  No websites connected yet. Connect your WordPress site to enable automatic content delivery.
                </p>
                <Button variant="outline" size="sm" onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Website
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sign Out</p>
                <p className="text-sm text-muted-foreground">
                  Log out of your account on this device
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4 mr-2" />
                )}
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
