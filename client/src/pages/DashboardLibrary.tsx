import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { FolderOpen, FileText, Download, ExternalLink, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function DashboardLibrary() {
  const { isAuthenticated } = useAuth();

  const { data: deliverables, isLoading } = trpc.deliverables.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  return (
    <DashboardLayout>
      <div className="space-y-6" data-surface="app">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold mb-1">Content Library</h1>
          <p className="text-muted-foreground">
            Browse and download your completed deliverables.
          </p>
        </div>

        {/* Deliverables List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Completed Deliverables</CardTitle>
            <CardDescription>
              {deliverables?.length || 0} item{deliverables?.length !== 1 ? "s" : ""} in your library
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : deliverables && deliverables.length > 0 ? (
              <div className="space-y-3">
                {deliverables.map((deliverable) => (
                  <div
                    key={deliverable.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-md bg-muted">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {deliverable.title || deliverable.type.replace(/_/g, " ")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Delivered {new Date(deliverable.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="done">Delivered</Badge>
                      {deliverable.contentUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={deliverable.contentUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-medium mb-2">Your library is empty</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  Your delivered content will appear here once requests are completed. 
                  Each deliverable includes download links and live preview URLs when available.
                </p>
                <Link href="/request">
                  <Button variant="outline">
                    Submit a Request
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
