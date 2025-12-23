import { Router } from "express";
import { getDb } from "./db";
import { blogPosts, landingPages } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const sitemapRouter = Router();

// Generate XML sitemap
sitemapRouter.get("/sitemap.xml", async (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  
  try {
    const db = await getDb();
    
    // Static pages
    const staticPages = [
      { loc: "/", priority: "1.0", changefreq: "weekly" },
      { loc: "/solutions", priority: "0.9", changefreq: "monthly" },
      { loc: "/solutions/med-spa", priority: "0.8", changefreq: "monthly" },
      { loc: "/solutions/dental-implants", priority: "0.8", changefreq: "monthly" },
      { loc: "/solutions/multi-location", priority: "0.8", changefreq: "monthly" },
      { loc: "/pricing", priority: "0.9", changefreq: "weekly" },
      { loc: "/proof", priority: "0.7", changefreq: "monthly" },
      { loc: "/about", priority: "0.6", changefreq: "monthly" },
      { loc: "/contact", priority: "0.7", changefreq: "monthly" },
      { loc: "/blog", priority: "0.8", changefreq: "daily" },
      { loc: "/audit", priority: "0.7", changefreq: "monthly" },
    ];

    // Dynamic blog posts
    let blogUrls: { loc: string; lastmod: string; priority: string; changefreq: string }[] = [];
    if (db) {
      const posts = await db
        .select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt })
        .from(blogPosts)
        .where(eq(blogPosts.status, "published"));
      
      blogUrls = posts.map((post) => ({
        loc: `/blog/${post.slug}`,
        lastmod: post.updatedAt.toISOString().split("T")[0],
        priority: "0.6",
        changefreq: "monthly",
      }));
    }

    // Build XML
    const urls = [
      ...staticPages.map((page) => `
    <url>
      <loc>${baseUrl}${page.loc}</loc>
      <priority>${page.priority}</priority>
      <changefreq>${page.changefreq}</changefreq>
    </url>`),
      ...blogUrls.map((page) => `
    <url>
      <loc>${baseUrl}${page.loc}</loc>
      <lastmod>${page.lastmod}</lastmod>
      <priority>${page.priority}</priority>
      <changefreq>${page.changefreq}</changefreq>
    </url>`),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("")}
</urlset>`;

    res.set("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).send("Error generating sitemap");
  }
});

// Generate robots.txt
sitemapRouter.get("/robots.txt", (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  
  // Check if staging environment
  const isStaging = process.env.NODE_ENV !== "production" || 
                    req.get("host")?.includes("manus") ||
                    req.get("host")?.includes("localhost");
  
  let robotsTxt: string;
  
  if (isStaging) {
    // Staging: block all crawlers
    robotsTxt = `# Lead Engine OS - Staging Environment
# Blocking all crawlers until production launch

User-agent: *
Disallow: /

# Sitemap (for reference, not for crawling)
Sitemap: ${baseUrl}/sitemap.xml
`;
  } else {
    // Production: allow crawlers
    robotsTxt = `# Lead Engine OS
# https://leadengine.kiasufamilytrust.org

User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /admin
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;
  }
  
  res.set("Content-Type", "text/plain");
  res.send(robotsTxt);
});

export { sitemapRouter };
