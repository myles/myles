import type { KnownPostType, Post } from "@myles-garden/sdk";

import { firstParagraph, formatPostDate, link } from "../format.js";

/**
 * Fallback emoji per post type, for the rare record that does not carry its
 * own.
 *
 * The literal is checked against the SDK's known types, so a type added
 * upstream surfaces here as a compile error rather than as a blank bullet.
 * Lookups still go through a `Map` keyed by plain strings, because the garden
 * is free to serve a type this build has never heard of.
 */
const TYPE_EMOJI = new Map<string, string>(
  Object.entries({
    article: "📝",
    bookmark: "🔖",
    listen: "🎧",
    manicure: "💅",
    note: "💬",
    photo: "📷",
    read: "📚",
    rsvp: "📅",
    travel: "✈️",
    watch: "🎬",
  } satisfies Record<KnownPostType, string>),
);

/** A post reduced to the four things a README bullet needs. */
export interface PostSummary {
  url: string;
  emoji: string;
  content: string;
  published: string;
}

/**
 * The line of prose that stands in for a post.
 *
 * A title wins when there is one, since long-form posts lead with it. A photo
 * or a read usually has none, so its caption is used instead, and the summary
 * is the last resort.
 */
function postText(post: Post): string {
  const title = post.name?.trim();
  if (title) {
    return title;
  }

  const caption = firstParagraph(post.content ?? "");
  if (caption) {
    return caption;
  }

  return post.summary?.trim() ?? "";
}

/** The emoji the post carries, or the one its type implies. */
function postEmoji(post: Post): string {
  return post.emoji ?? TYPE_EMOJI.get(post.type) ?? "";
}

export function summarisePost(post: Post): PostSummary {
  return {
    url: post.url,
    emoji: postEmoji(post),
    content: postText(post),
    published: formatPostDate(post.publishedAt),
  };
}

/**
 * One bullet: `- [📷 caption](url) — 24 Aug 2026, 3:30 PM`.
 *
 * A post with neither an emoji nor any text would leave the link with an
 * empty label, so its URL is shown instead of nothing at all.
 */
export function formatPost(post: PostSummary): string {
  const label = [post.emoji, post.content].filter(Boolean).join(" ");

  return `- ${link(label || post.url, post.url)} — ${post.published}`;
}

/** The whole posts block, in the order the garden served them. */
export function buildPostsSection(posts: Post[]): string {
  return posts.map((post) => formatPost(summarisePost(post))).join("\n");
}
