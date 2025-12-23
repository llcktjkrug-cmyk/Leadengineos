import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { Calendar, ArrowLeft } from "lucide-react";
import { Streamdown } from "streamdown";
import { useEffect } from "react";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug || "";

  const { data: post, isLoading } = trpc.blog.getBySlug.useQuery({ slug });

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatISODate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toISOString();
  };

  // SEO: Update document head with meta tags
  useEffect(() => {
    if (!post) return;

    // Title tag
    document.title = post.seoTitle || `${post.title} | Lead Engine OS Blog`;

    // Meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    const descriptionContent = post.seoMetaDescription || post.excerpt || `Read ${post.title} on the Lead Engine OS blog.`;
    if (metaDescription) {
      metaDescription.setAttribute("content", descriptionContent);
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = descriptionContent;
      document.head.appendChild(meta);
    }

    // Canonical URL
    const canonicalUrl = `${window.location.origin}/blog/${post.slug}`;
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonical) {
      canonical.href = canonicalUrl;
    } else {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      canonical.href = canonicalUrl;
      document.head.appendChild(canonical);
    }

    // Open Graph tags
    const ogTags = [
      { property: "og:title", content: post.seoTitle || post.title },
      { property: "og:description", content: descriptionContent },
      { property: "og:type", content: "article" },
      { property: "og:url", content: canonicalUrl },
      { property: "og:image", content: post.featuredImageUrl || `${window.location.origin}/og-default.png` },
      { property: "og:site_name", content: "Lead Engine OS" },
      { property: "article:published_time", content: formatISODate(post.publishedAt) },
    ];

    ogTags.forEach(({ property, content }) => {
      if (!content) return;
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (tag) {
        tag.setAttribute("content", content);
      } else {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        tag.setAttribute("content", content);
        document.head.appendChild(tag);
      }
    });

    // Twitter Card tags
    const twitterTags = [
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: post.seoTitle || post.title },
      { name: "twitter:description", content: descriptionContent },
      { name: "twitter:image", content: post.featuredImageUrl || `${window.location.origin}/og-default.png` },
    ];

    twitterTags.forEach(({ name, content }) => {
      if (!content) return;
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (tag) {
        tag.setAttribute("content", content);
      } else {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        tag.setAttribute("content", content);
        document.head.appendChild(tag);
      }
    });

    // JSON-LD Article schema
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: descriptionContent,
      image: post.featuredImageUrl || undefined,
      datePublished: formatISODate(post.publishedAt),
      dateModified: formatISODate(post.updatedAt),
      author: {
        "@type": "Organization",
        name: "Lead Engine OS",
        url: window.location.origin,
      },
      publisher: {
        "@type": "Organization",
        name: "Lead Engine OS",
        url: window.location.origin,
        logo: {
          "@type": "ImageObject",
          url: `${window.location.origin}/logo.png`,
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonicalUrl,
      },
    };

    let scriptTag = document.querySelector('script[type="application/ld+json"][data-blog-post]');
    if (scriptTag) {
      scriptTag.textContent = JSON.stringify(jsonLd);
    } else {
      scriptTag = document.createElement("script");
      scriptTag.setAttribute("type", "application/ld+json");
      scriptTag.setAttribute("data-blog-post", "true");
      scriptTag.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(scriptTag);
    }

    // Cleanup on unmount
    return () => {
      document.title = "Lead Engine OS";
      const blogScript = document.querySelector('script[type="application/ld+json"][data-blog-post]');
      if (blogScript) blogScript.remove();
    };
  }, [post]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col" data-surface="marketing">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col" data-surface="marketing">
        <Navigation />
        <div className="flex-1 flex items-center justify-center flex-col gap-4">
          <p className="text-muted-foreground">Post not found</p>
          <Link href="/blog">
            <Button variant="outline">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" data-surface="marketing">
      <Navigation />

      {/* Hero */}
      <article className="pt-32 pb-16 md:pt-40">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Back Link */}
            <Link href="/blog">
              <Button variant="ghost" size="sm" className="mb-8">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Blog
              </Button>
            </Link>

            {/* Category */}
            {post.category && (
              <div className="text-sm font-semibold text-accent mb-4 uppercase tracking-wide">
                {post.category.replace(/_/g, " ")}
              </div>
            )}

            {/* Title */}
            <h1 className="mb-6">{post.title}</h1>

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
            </div>

            {/* Featured Image */}
            {post.featuredImageUrl && (
              <div className="aspect-video bg-muted overflow-hidden rounded-lg mb-12">
                <img
                  src={post.featuredImageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <Streamdown>{post.content}</Streamdown>
            </div>

            {/* CTA */}
            <div className="mt-16 p-8 bg-muted/50 rounded-lg text-center">
              <h3 className="text-2xl font-semibold mb-4">Ready to Automate Your Marketing?</h3>
              <p className="text-muted-foreground mb-6">
                Get done-for-you landing pages, blog content, and SEO improvements delivered every month.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="gradient-primary">
                  <Link href="/pricing">
                    View Pricing
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/contact">
                    Talk to Us
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
