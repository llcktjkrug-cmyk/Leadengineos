import axios from "axios";

/**
 * WordPress REST API Integration
 * 
 * Handles automated content publishing to WordPress sites.
 * Credentials are stored encrypted in the database per tenant.
 */

export interface WordPressCredentials {
  siteUrl: string;
  username: string;
  applicationPassword: string; // WordPress Application Password (not user password)
}

export interface WordPressPost {
  title: string;
  content: string;
  excerpt?: string;
  status: "draft" | "publish";
  categories?: number[];
  tags?: number[];
  featuredMedia?: number;
  meta?: Record<string, any>;
}

export interface WordPressPage {
  title: string;
  content: string;
  status: "draft" | "publish";
  parent?: number;
  template?: string;
  meta?: Record<string, any>;
}

/**
 * Test WordPress REST API connection
 */
export async function testWordPressConnection(credentials: WordPressCredentials): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = Buffer.from(`${credentials.username}:${credentials.applicationPassword}`).toString("base64");

    const response = await axios.get(`${credentials.siteUrl}/wp-json/wp/v2/users/me`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
      timeout: 10000,
    });

    if (response.status === 200) {
      return { success: true };
    }

    return { success: false, error: "Invalid response from WordPress" };
  } catch (error: any) {
    console.error("[WordPress] Connection test failed:", error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Connection failed",
    };
  }
}

/**
 * Create a WordPress post
 */
export async function createWordPressPost(
  credentials: WordPressCredentials,
  post: WordPressPost
): Promise<{ success: boolean; postId?: number; url?: string; error?: string }> {
  try {
    const auth = Buffer.from(`${credentials.username}:${credentials.applicationPassword}`).toString("base64");

    const response = await axios.post(
      `${credentials.siteUrl}/wp-json/wp/v2/posts`,
      {
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || "",
        status: post.status,
        categories: post.categories || [],
        tags: post.tags || [],
        featured_media: post.featuredMedia || 0,
        meta: post.meta || {},
      },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    if (response.status === 201) {
      return {
        success: true,
        postId: response.data.id,
        url: response.data.link,
      };
    }

    return { success: false, error: "Failed to create post" };
  } catch (error: any) {
    console.error("[WordPress] Post creation failed:", error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Post creation failed",
    };
  }
}

/**
 * Update a WordPress post
 */
export async function updateWordPressPost(
  credentials: WordPressCredentials,
  postId: number,
  updates: Partial<WordPressPost>
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = Buffer.from(`${credentials.username}:${credentials.applicationPassword}`).toString("base64");

    const response = await axios.post(
      `${credentials.siteUrl}/wp-json/wp/v2/posts/${postId}`,
      updates,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    if (response.status === 200) {
      return { success: true };
    }

    return { success: false, error: "Failed to update post" };
  } catch (error: any) {
    console.error("[WordPress] Post update failed:", error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Post update failed",
    };
  }
}

/**
 * Create a WordPress page
 */
export async function createWordPressPage(
  credentials: WordPressCredentials,
  page: WordPressPage
): Promise<{ success: boolean; pageId?: number; url?: string; error?: string }> {
  try {
    const auth = Buffer.from(`${credentials.username}:${credentials.applicationPassword}`).toString("base64");

    const response = await axios.post(
      `${credentials.siteUrl}/wp-json/wp/v2/pages`,
      {
        title: page.title,
        content: page.content,
        status: page.status,
        parent: page.parent || 0,
        template: page.template || "",
        meta: page.meta || {},
      },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    if (response.status === 201) {
      return {
        success: true,
        pageId: response.data.id,
        url: response.data.link,
      };
    }

    return { success: false, error: "Failed to create page" };
  } catch (error: any) {
    console.error("[WordPress] Page creation failed:", error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Page creation failed",
    };
  }
}

/**
 * Get WordPress categories
 */
export async function getWordPressCategories(credentials: WordPressCredentials): Promise<{ id: number; name: string }[]> {
  try {
    const auth = Buffer.from(`${credentials.username}:${credentials.applicationPassword}`).toString("base64");

    const response = await axios.get(`${credentials.siteUrl}/wp-json/wp/v2/categories?per_page=100`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
      timeout: 10000,
    });

    return response.data.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
    }));
  } catch (error: any) {
    console.error("[WordPress] Failed to fetch categories:", error.message);
    return [];
  }
}

/**
 * Upload media to WordPress
 */
export async function uploadWordPressMedia(
  credentials: WordPressCredentials,
  imageUrl: string,
  filename: string
): Promise<{ success: boolean; mediaId?: number; error?: string }> {
  try {
    const auth = Buffer.from(`${credentials.username}:${credentials.applicationPassword}`).toString("base64");

    // Download image
    const imageResponse = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
    });

    // Upload to WordPress
    const response = await axios.post(`${credentials.siteUrl}/wp-json/wp/v2/media`, imageResponse.data, {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": imageResponse.headers["content-type"],
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
      timeout: 60000,
    });

    if (response.status === 201) {
      return {
        success: true,
        mediaId: response.data.id,
      };
    }

    return { success: false, error: "Failed to upload media" };
  } catch (error: any) {
    console.error("[WordPress] Media upload failed:", error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Media upload failed",
    };
  }
}

/**
 * Sanitize content for WordPress
 * Removes automation footprints and ensures clean HTML
 */
export function sanitizeContentForWordPress(content: string): string {
  // Remove any AI generation markers
  let sanitized = content.replace(/<!-- Generated by .* -->/g, "");
  sanitized = sanitized.replace(/\[AI Generated\]/g, "");
  sanitized = sanitized.replace(/\[Auto-generated\]/g, "");

  // Ensure proper paragraph tags
  sanitized = sanitized.replace(/\n\n/g, "</p><p>");
  if (!sanitized.startsWith("<p>")) {
    sanitized = `<p>${sanitized}</p>`;
  }

  return sanitized;
}
