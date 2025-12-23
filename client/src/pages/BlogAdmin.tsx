import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Plus, Edit, Trash2, Eye, Loader2 } from "lucide-react";

export default function BlogAdmin() {
  const [, setLocation] = useLocation();
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "med_spa_growth" as const,
    seoTitle: "",
    seoDescription: "",
    status: "draft" as const,
  });

  const { data: posts, isLoading, refetch } = trpc.blog.listAllPosts.useQuery();
  
  const createPost = trpc.blog.createPost.useMutation({
    onSuccess: () => {
      toast.success("Blog post created successfully!");
      resetForm();
      setView("list");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create post");
    },
  });

  const updatePost = trpc.blog.updatePost.useMutation({
    onSuccess: () => {
      toast.success("Blog post updated successfully!");
      resetForm();
      setView("list");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update post");
    },
  });

  const deletePost = trpc.blog.deletePost.useMutation({
    onSuccess: () => {
      toast.success("Blog post deleted successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete post");
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      category: "med_spa_growth",
      seoTitle: "",
      seoDescription: "",
      status: "draft",
    });
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.content) {
      toast.error("Title and content are required");
      return;
    }

    // Auto-generate slug if empty
    const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    if (editingId) {
      updatePost.mutate({
        id: editingId,
        ...formData,
        slug,
      });
    } else {
      createPost.mutate({
        ...formData,
        slug,
      });
    }
  };

  const handleEdit = (post: any) => {
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      content: post.content,
      category: post.category,
      seoTitle: post.seoTitle ?? "",
      seoDescription: post.seoMetaDescription ?? "",
      status: post.status,
    });
    setEditingId(post.id);
    setView("edit");
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this post?")) {
      deletePost.mutate({ id });
    }
  };

  const getCategoryLabel = (category: string | null) => {
    if (!category) return "Uncategorized";
    const labels: Record<string, string> = {
      med_spa_growth: "Med Spa Growth",
      dental_implant_growth: "Dental Implant Growth",
      multi_location_local_presence: "Multi-location Local Presence",
      conversion_playbooks: "Conversion Playbooks",
      experiments: "Experiments",
    };
    return labels[category] || category;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
      <div className="container max-w-6xl">
        <Button variant="ghost" onClick={() => (view === "list" ? setLocation("/admin") : setView("list"))} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {view === "list" && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Blog Posts</h1>
                <p className="text-slate-600">Manage your blog content</p>
              </div>
              <Button onClick={() => setView("create")}>
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </div>

            {!posts || posts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">No blog posts yet</p>
                  <Button onClick={() => setView("create")}>Create Your First Post</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-lg">{post.title}</CardTitle>
                            <Badge variant={post.status === "published" ? "default" : "secondary"}>
                              {post.status}
                            </Badge>
                            {post.category && <Badge variant="outline">{getCategoryLabel(post.category)}</Badge>}
                          </div>
                          <CardDescription>
                            {post.excerpt ?? "No excerpt"}
                          </CardDescription>
                          <p className="text-xs text-muted-foreground mt-2">
                            Created {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => window.open(`/blog/${post.slug}`, "_blank")}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(post)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {(view === "create" || view === "edit") && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">{view === "create" ? "Create" : "Edit"} Blog Post</h1>
              <p className="text-slate-600">Fill in the details below</p>
            </div>

            <Card>
              <CardContent className="pt-6 space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., 5 Ways Med Spas Can Increase Booked Consultations"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug (leave empty to auto-generate)</Label>
                  <Input
                    id="slug"
                    placeholder="e.g., 5-ways-med-spas-increase-consultations"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="med_spa_growth">Med Spa Growth</SelectItem>
                      <SelectItem value="dental_implant_growth">Dental Implant Growth</SelectItem>
                      <SelectItem value="multi_location_local_presence">Multi-location Local Presence</SelectItem>
                      <SelectItem value="conversion_playbooks">Conversion Playbooks</SelectItem>
                      <SelectItem value="experiments">Experiments</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Excerpt */}
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    placeholder="Brief summary for listings and SEO..."
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={3}
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">Content * (Markdown supported)</Label>
                  <Textarea
                    id="content"
                    placeholder="Write your blog post content here..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={15}
                    className="font-mono text-sm"
                  />
                </div>

                {/* SEO Title */}
                <div className="space-y-2">
                  <Label htmlFor="seoTitle">SEO Title (optional)</Label>
                  <Input
                    id="seoTitle"
                    placeholder="Leave empty to use post title"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  />
                </div>

                {/* SEO Description */}
                <div className="space-y-2">
                  <Label htmlFor="seoDescription">SEO Meta Description (optional)</Label>
                  <Textarea
                    id="seoDescription"
                    placeholder="Leave empty to use excerpt"
                    value={formData.seoDescription}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                    rows={2}
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => { resetForm(); setView("list"); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={createPost.isPending || updatePost.isPending}>
                    {(createPost.isPending || updatePost.isPending) ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      view === "create" ? "Create Post" : "Update Post"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
