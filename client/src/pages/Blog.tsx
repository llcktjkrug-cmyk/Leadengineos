import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Calendar } from "lucide-react";
import { useState } from "react";

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  
  const { data: posts, isLoading } = trpc.blog.listPublic.useQuery({
    category: selectedCategory,
  });

  const categories = [
    { value: undefined, label: "All Posts" },
    { value: "med_spa_growth", label: "Med Spa Growth" },
    { value: "dental_implant_growth", label: "Dental Implant Growth" },
    { value: "multi_location_presence", label: "Multi-location Local Presence" },
    { value: "conversion_playbooks", label: "Conversion Playbooks" },
    { value: "experiments", label: "Experiments" },
  ];

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen flex flex-col" data-surface="marketing">
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="mb-6">The operator's playbook</h1>
            <p className="text-xl text-muted-foreground mb-4">
              This blog focuses on execution.
            </p>
            <p className="text-lg text-muted-foreground">
              Expect practical guidance on conversion, follow-up, local presence, and SEO structure.
              If you want fluff, there are plenty of other blogs.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 border-b border-border bg-background sticky top-16 z-40">
        <div className="container">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category.label}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="section-padding">
        <div className="container">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading posts...</p>
            </div>
          ) : !posts || posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts found. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {posts.map((post) => (
                <Card key={post.id} className="flex flex-col hover:shadow-lg transition-shadow">
                  {post.featuredImageUrl && (
                    <div className="aspect-video bg-muted overflow-hidden rounded-t-lg">
                      <img
                        src={post.featuredImageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <CardHeader>
                    {post.category && (
                      <div className="text-xs font-semibold text-accent mb-2 uppercase tracking-wide">
                        {post.category.replace(/_/g, " ")}
                      </div>
                    )}
                    <CardTitle className="text-xl line-clamp-2">{post.title}</CardTitle>
                    <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(post.publishedAt)}</span>
                      </div>
                      <Link href={`/blog/${post.slug}`}>
                        <Button variant="ghost" size="sm">
                          Read More
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
