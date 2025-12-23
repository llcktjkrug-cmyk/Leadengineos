import axios from "axios";
import { nanoid } from "nanoid";
import { getDb } from "./db";
import { wordpressRollbackHistory } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { sanitizeErrorMessage } from "./encryption";
import type { WordPressCredentials, WordPressPost } from "./wordpress";

/**
 * WordPress Rollback Service
 * 
 * Provides batch update tracking and rollback/revert functionality
 * for WordPress content updates.
 */

export interface RollbackEntry {
  wordpressPostId: number;
  postType: "post" | "page";
  previousTitle?: string;
  previousContent?: string;
  previousExcerpt?: string;
  previousStatus?: string;
  previousMeta?: Record<string, any>;
  newTitle?: string;
  newContent?: string;
}

export interface BatchUpdateResult {
  batchId: string;
  success: boolean;
  updatedCount: number;
  errors: { postId: number; error: string }[];
}

/**
 * Fetch current post/page content from WordPress for rollback storage
 */
export async function fetchWordPressContent(
  credentials: WordPressCredentials,
  postId: number,
  postType: "post" | "page"
): Promise<{
  title: string;
  content: string;
  excerpt: string;
  status: string;
  meta: Record<string, any>;
} | null> {
  try {
    const auth = Buffer.from(`${credentials.username}:${credentials.applicationPassword}`).toString("base64");
    const endpoint = postType === "post" ? "posts" : "pages";

    const response = await axios.get(`${credentials.siteUrl}/wp-json/wp/v2/${endpoint}/${postId}`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
      timeout: 10000,
    });

    return {
      title: response.data.title?.rendered || "",
      content: response.data.content?.rendered || "",
      excerpt: response.data.excerpt?.rendered || "",
      status: response.data.status || "draft",
      meta: response.data.meta || {},
    };
  } catch (error) {
    console.error(`[WordPress Rollback] Failed to fetch ${postType} ${postId}:`, sanitizeErrorMessage(error));
    return null;
  }
}

/**
 * Store rollback entry before making an update
 */
export async function storeRollbackEntry(
  tenantId: number,
  batchId: string,
  entry: RollbackEntry,
  updatedBy?: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.error("[WordPress Rollback] Database not available");
    return false;
  }

  try {
    await db.insert(wordpressRollbackHistory).values({
      tenantId,
      batchId,
      wordpressPostId: entry.wordpressPostId,
      postType: entry.postType,
      previousTitle: entry.previousTitle,
      previousContent: entry.previousContent,
      previousExcerpt: entry.previousExcerpt,
      previousStatus: entry.previousStatus,
      previousMeta: entry.previousMeta ? JSON.stringify(entry.previousMeta) : null,
      newTitle: entry.newTitle,
      newContent: entry.newContent,
      updatedBy,
    });
    return true;
  } catch (error) {
    console.error("[WordPress Rollback] Failed to store rollback entry:", sanitizeErrorMessage(error));
    return false;
  }
}

/**
 * Perform batch update with rollback tracking
 */
export async function batchUpdateWithRollback(
  tenantId: number,
  credentials: WordPressCredentials,
  updates: { postId: number; postType: "post" | "page"; updates: Partial<WordPressPost> }[],
  updatedBy?: number
): Promise<BatchUpdateResult> {
  const batchId = nanoid(16);
  const errors: { postId: number; error: string }[] = [];
  let updatedCount = 0;

  const auth = Buffer.from(`${credentials.username}:${credentials.applicationPassword}`).toString("base64");

  for (const update of updates) {
    try {
      // 1. Fetch current content for rollback
      const currentContent = await fetchWordPressContent(credentials, update.postId, update.postType);
      
      if (!currentContent) {
        errors.push({ postId: update.postId, error: "Failed to fetch current content" });
        continue;
      }

      // 2. Store rollback entry
      const rollbackEntry: RollbackEntry = {
        wordpressPostId: update.postId,
        postType: update.postType,
        previousTitle: currentContent.title,
        previousContent: currentContent.content,
        previousExcerpt: currentContent.excerpt,
        previousStatus: currentContent.status,
        previousMeta: currentContent.meta,
        newTitle: update.updates.title,
        newContent: update.updates.content,
      };

      const stored = await storeRollbackEntry(tenantId, batchId, rollbackEntry, updatedBy);
      if (!stored) {
        errors.push({ postId: update.postId, error: "Failed to store rollback entry" });
        continue;
      }

      // 3. Perform the update
      const endpoint = update.postType === "post" ? "posts" : "pages";
      await axios.post(
        `${credentials.siteUrl}/wp-json/wp/v2/${endpoint}/${update.postId}`,
        update.updates,
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      updatedCount++;
    } catch (error) {
      errors.push({ postId: update.postId, error: sanitizeErrorMessage(error) });
    }
  }

  return {
    batchId,
    success: errors.length === 0,
    updatedCount,
    errors,
  };
}

/**
 * Revert a single item to its previous state
 */
export async function revertSingleItem(
  credentials: WordPressCredentials,
  rollbackId: number,
  revertedBy?: number
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, error: "Database not available" };
  }

  try {
    // Fetch rollback entry
    const [entry] = await db
      .select()
      .from(wordpressRollbackHistory)
      .where(eq(wordpressRollbackHistory.id, rollbackId))
      .limit(1);

    if (!entry) {
      return { success: false, error: "Rollback entry not found" };
    }

    if (entry.reverted) {
      return { success: false, error: "Item already reverted" };
    }

    // Perform revert
    const auth = Buffer.from(`${credentials.username}:${credentials.applicationPassword}`).toString("base64");
    const endpoint = entry.postType === "post" ? "posts" : "pages";

    await axios.post(
      `${credentials.siteUrl}/wp-json/wp/v2/${endpoint}/${entry.wordpressPostId}`,
      {
        title: entry.previousTitle,
        content: entry.previousContent,
        excerpt: entry.previousExcerpt,
        status: entry.previousStatus,
      },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    // Mark as reverted
    await db
      .update(wordpressRollbackHistory)
      .set({
        reverted: true,
        revertedAt: new Date(),
        revertedBy,
      })
      .where(eq(wordpressRollbackHistory.id, rollbackId));

    return { success: true };
  } catch (error) {
    return { success: false, error: sanitizeErrorMessage(error) };
  }
}

/**
 * Revert an entire batch to previous state
 */
export async function revertBatch(
  tenantId: number,
  credentials: WordPressCredentials,
  batchId: string,
  revertedBy?: number
): Promise<{ success: boolean; revertedCount: number; errors: { postId: number; error: string }[] }> {
  const db = await getDb();
  if (!db) {
    return { success: false, revertedCount: 0, errors: [{ postId: 0, error: "Database not available" }] };
  }

  const errors: { postId: number; error: string }[] = [];
  let revertedCount = 0;

  try {
    // Fetch all entries for this batch
    const entries = await db
      .select()
      .from(wordpressRollbackHistory)
      .where(
        and(
          eq(wordpressRollbackHistory.tenantId, tenantId),
          eq(wordpressRollbackHistory.batchId, batchId),
          eq(wordpressRollbackHistory.reverted, false)
        )
      );

    if (entries.length === 0) {
      return { success: false, revertedCount: 0, errors: [{ postId: 0, error: "No entries found for batch" }] };
    }

    const auth = Buffer.from(`${credentials.username}:${credentials.applicationPassword}`).toString("base64");

    for (const entry of entries) {
      try {
        const endpoint = entry.postType === "post" ? "posts" : "pages";

        await axios.post(
          `${credentials.siteUrl}/wp-json/wp/v2/${endpoint}/${entry.wordpressPostId}`,
          {
            title: entry.previousTitle,
            content: entry.previousContent,
            excerpt: entry.previousExcerpt,
            status: entry.previousStatus,
          },
          {
            headers: {
              Authorization: `Basic ${auth}`,
              "Content-Type": "application/json",
            },
            timeout: 30000,
          }
        );

        // Mark as reverted
        await db
          .update(wordpressRollbackHistory)
          .set({
            reverted: true,
            revertedAt: new Date(),
            revertedBy,
          })
          .where(eq(wordpressRollbackHistory.id, entry.id));

        revertedCount++;
      } catch (error) {
        errors.push({ postId: entry.wordpressPostId, error: sanitizeErrorMessage(error) });
      }
    }

    return {
      success: errors.length === 0,
      revertedCount,
      errors,
    };
  } catch (error) {
    return { success: false, revertedCount: 0, errors: [{ postId: 0, error: sanitizeErrorMessage(error) }] };
  }
}

/**
 * Get rollback history for a tenant
 */
export async function getRollbackHistory(
  tenantId: number,
  limit: number = 50
): Promise<{
  batchId: string;
  postCount: number;
  createdAt: Date;
  reverted: boolean;
}[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const entries = await db
      .select()
      .from(wordpressRollbackHistory)
      .where(eq(wordpressRollbackHistory.tenantId, tenantId))
      .orderBy(desc(wordpressRollbackHistory.createdAt))
      .limit(limit * 10); // Fetch more to group by batch

    // Group by batchId
    const batches = new Map<string, { postCount: number; createdAt: Date; reverted: boolean }>();
    
    for (const entry of entries) {
      const existing = batches.get(entry.batchId);
      if (existing) {
        existing.postCount++;
        existing.reverted = existing.reverted && (entry.reverted ?? false);
      } else {
        batches.set(entry.batchId, {
          postCount: 1,
          createdAt: entry.createdAt,
          reverted: entry.reverted ?? false,
        });
      }
    }

    return Array.from(batches.entries())
      .map(([batchId, data]) => ({ batchId, ...data }))
      .slice(0, limit);
  } catch (error) {
    console.error("[WordPress Rollback] Failed to get history:", sanitizeErrorMessage(error));
    return [];
  }
}
