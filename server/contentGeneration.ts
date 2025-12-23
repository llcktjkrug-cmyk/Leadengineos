import { invokeLLM } from "./_core/llm";
import { generateImage } from "./_core/imageGeneration";

interface BlogPostBrief {
  vertical: "med_spa" | "dental_implants" | "multi_location";
  topic: string;
  keywords: string[];
  targetWordCount: number;
  includeInternalLinks?: boolean;
}

interface LandingPageBrief {
  vertical: "med_spa" | "dental_implants" | "multi_location";
  service: string;
  location?: string;
  targetAudience: string;
  uniqueSellingPoints: string[];
}

interface GeneratedBlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  seoTitle: string;
  seoMetaDescription: string;
  category: string;
  featuredImagePrompt: string;
}

interface GeneratedLandingPage {
  title: string;
  slug: string;
  headline: string;
  subheadline: string;
  heroContent: string;
  benefitsSection: string;
  ctaSection: string;
  faqSection: string;
  seoTitle: string;
  seoMetaDescription: string;
  featuredImagePrompt: string;
}

const VERTICAL_CONTEXTS = {
  med_spa: {
    industry: "medical aesthetics and cosmetic treatments",
    services: "Botox, dermal fillers, laser treatments, body contouring, skin rejuvenation",
    audience: "individuals seeking aesthetic enhancements and anti-aging treatments",
    tone: "professional yet approachable, emphasizing safety and natural-looking results",
  },
  dental_implants: {
    industry: "dental implant and restorative dentistry",
    services: "single implants, multiple implants, All-on-4, full-arch restoration, bone grafting",
    audience: "patients with missing teeth seeking permanent tooth replacement solutions",
    tone: "professional and reassuring, emphasizing expertise and long-term outcomes",
  },
  multi_location: {
    industry: "multi-location service businesses",
    services: "local presence management, review management, location-specific marketing",
    audience: "multi-location practice owners and operators",
    tone: "strategic and results-focused, emphasizing scalability and efficiency",
  },
};

export async function generateBlogPost(brief: BlogPostBrief): Promise<GeneratedBlogPost> {
  const context = VERTICAL_CONTEXTS[brief.vertical];

  const systemPrompt = `You are an expert content writer specializing in ${context.industry}. Your writing is ${context.tone}. You create high-quality, SEO-optimized blog content that educates and converts.`;

  const userPrompt = `Write a comprehensive blog post for ${context.audience} about: ${brief.topic}

Requirements:
- Target word count: ${brief.targetWordCount} words
- Keywords to naturally incorporate: ${brief.keywords.join(", ")}
- Structure: Introduction, 3-5 main sections with H2 headings, conclusion with CTA
- Tone: ${context.tone}
- Include actionable insights and avoid generic advice
- End with a clear CTA encouraging readers to take the next step

Return a JSON object with:
{
  "title": "Compelling title (60-70 characters)",
  "slug": "url-friendly-slug",
  "excerpt": "Engaging summary (150-160 characters)",
  "content": "Full markdown content with H2/H3 headings, paragraphs, lists",
  "seoTitle": "SEO-optimized title (50-60 characters)",
  "seoMetaDescription": "Meta description (150-160 characters)",
  "category": "appropriate category from: med_spa_growth, dental_implant_growth, multi_location_presence, conversion_playbooks, experiments",
  "featuredImagePrompt": "Detailed prompt for generating a non-face, abstract featured image that represents the topic"
}`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "blog_post",
        strict: true,
        schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            slug: { type: "string" },
            excerpt: { type: "string" },
            content: { type: "string" },
            seoTitle: { type: "string" },
            seoMetaDescription: { type: "string" },
            category: { type: "string" },
            featuredImagePrompt: { type: "string" },
          },
          required: [
            "title",
            "slug",
            "excerpt",
            "content",
            "seoTitle",
            "seoMetaDescription",
            "category",
            "featuredImagePrompt",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("Failed to generate blog post content");
  }

  return JSON.parse(content);
}

export async function generateLandingPage(brief: LandingPageBrief): Promise<GeneratedLandingPage> {
  const context = VERTICAL_CONTEXTS[brief.vertical];

  const systemPrompt = `You are an expert conversion copywriter specializing in ${context.industry}. Your writing is ${context.tone}. You create high-converting landing pages that drive bookings and consultations.`;

  const locationContext = brief.location ? ` in ${brief.location}` : "";

  const userPrompt = `Write a high-converting landing page for ${brief.service}${locationContext}.

Target audience: ${brief.targetAudience}
Unique selling points: ${brief.uniqueSellingPoints.join(", ")}

Requirements:
- Hero section: Compelling headline, subheadline, and opening paragraph
- Benefits section: 3-5 key benefits with clear value propositions
- CTA section: Strong call-to-action with urgency and social proof
- FAQ section: 5-7 common questions with concise answers
- Tone: ${context.tone}
- Focus on outcomes, not features
- Include trust signals and credibility markers

Return a JSON object with:
{
  "title": "Page title",
  "slug": "url-friendly-slug",
  "headline": "Compelling hero headline (8-12 words)",
  "subheadline": "Supporting subheadline (15-25 words)",
  "heroContent": "Opening paragraph (2-3 sentences)",
  "benefitsSection": "Markdown content for benefits section with H2/H3 headings",
  "ctaSection": "Markdown content for CTA section",
  "faqSection": "Markdown content for FAQ section with questions and answers",
  "seoTitle": "SEO-optimized title (50-60 characters)",
  "seoMetaDescription": "Meta description (150-160 characters)",
  "featuredImagePrompt": "Detailed prompt for generating a hero image that represents the service"
}`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "landing_page",
        strict: true,
        schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            slug: { type: "string" },
            headline: { type: "string" },
            subheadline: { type: "string" },
            heroContent: { type: "string" },
            benefitsSection: { type: "string" },
            ctaSection: { type: "string" },
            faqSection: { type: "string" },
            seoTitle: { type: "string" },
            seoMetaDescription: { type: "string" },
            featuredImagePrompt: { type: "string" },
          },
          required: [
            "title",
            "slug",
            "headline",
            "subheadline",
            "heroContent",
            "benefitsSection",
            "ctaSection",
            "faqSection",
            "seoTitle",
            "seoMetaDescription",
            "featuredImagePrompt",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("Failed to generate landing page content");
  }

  return JSON.parse(content);
}

export async function generateFeaturedImage(prompt: string): Promise<string> {
  const enhancedPrompt = `${prompt}. Professional, modern, clean aesthetic. No text, no faces, no people. Abstract or conceptual representation. High quality, suitable for web use.`;

  const result = await generateImage({
    prompt: enhancedPrompt,
  });

  if (!result.url) {
    throw new Error("Failed to generate featured image");
  }

  return result.url;
}

export async function generateSEOImprovements(pageContent: string, targetKeywords: string[]): Promise<string[]> {
  const systemPrompt = `You are an SEO expert specializing in on-page optimization. You provide specific, actionable recommendations.`;

  const userPrompt = `Analyze this page content and provide SEO improvement recommendations:

Content:
${pageContent.substring(0, 2000)}...

Target keywords: ${targetKeywords.join(", ")}

Provide 5-10 specific, actionable SEO improvements. Focus on:
- Keyword optimization (natural placement, density)
- Content structure (headings, paragraphs, lists)
- Internal linking opportunities
- Meta tag optimization
- User experience improvements

Return a JSON array of strings, each being a specific recommendation.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "seo_improvements",
        strict: true,
        schema: {
          type: "object",
          properties: {
            improvements: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["improvements"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("Failed to generate SEO improvements");
  }

  const parsed = JSON.parse(content);
  return parsed.improvements;
}

export async function generateInternalLinkSuggestions(
  pageContent: string,
  availablePages: Array<{ title: string; url: string; excerpt: string }>
): Promise<Array<{ anchorText: string; targetUrl: string; reason: string }>> {
  const systemPrompt = `You are an internal linking strategist. You identify natural opportunities to link between related content.`;

  const userPrompt = `Analyze this page content and suggest internal links to related pages:

Current page content:
${pageContent.substring(0, 2000)}...

Available pages to link to:
${availablePages.map((p) => `- ${p.title} (${p.url}): ${p.excerpt}`).join("\n")}

Provide 3-5 internal linking suggestions. Each suggestion should:
- Use natural anchor text that fits the content flow
- Link to a highly relevant page
- Provide clear value to the reader

Return a JSON array of objects with:
{
  "anchorText": "Natural anchor text from the content",
  "targetUrl": "URL of the page to link to",
  "reason": "Why this link adds value"
}`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "internal_links",
        strict: true,
        schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  anchorText: { type: "string" },
                  targetUrl: { type: "string" },
                  reason: { type: "string" },
                },
                required: ["anchorText", "targetUrl", "reason"],
                additionalProperties: false,
              },
            },
          },
          required: ["suggestions"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("Failed to generate internal link suggestions");
  }

  const parsed = JSON.parse(content);
  return parsed.suggestions;
}
