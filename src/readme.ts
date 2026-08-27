import { formatStampDate } from "./format.js";
import type { GardenSnapshot } from "./garden.js";
import { buildNowSection } from "./sections/now.js";
import { buildPostsSection } from "./sections/posts.js";

/** The marker pairs the builder writes between. */
export const Marker = {
  Posts: "POSTS",
  Now: "NOW",
  LastUpdatedAt: "LAST_UPDATED_AT",
} as const;

export type Marker = (typeof Marker)[keyof typeof Marker];

/** Whether a run that found nothing new should still stamp the README. */
export const WriteMode = {
  /** Stamp regardless, which is what `--force` asks for. */
  Always: "always",
  /** Stamp only when a section actually moved. */
  WhenChanged: "when-changed",
} as const;

export type WriteMode = (typeof WriteMode)[keyof typeof WriteMode];

export interface BuildOptions {
  mode?: WriteMode;
  /** Injectable clock, so the stamp is fixed under test. */
  timestamp?: Date;
}

export interface BuildResult {
  content: string;
  /** False when the rebuilt README is byte-identical to the old one. */
  changed: boolean;
}

/**
 * Replaces the content between a marker pair.
 *
 * Adapted from Simon Willison's `replace_chunk` function:
 * https://github.com/simonw/simonw/blob/04ebf2d/build_readme.py#L16
 */
export function replaceChunk(
  content: string,
  marker: Marker,
  chunk: string,
): string {
  const start = `<!-- START: ${marker} -->`;
  const end = `<!-- END: ${marker} -->`;
  const pattern = new RegExp(`${start}[\\s\\S]*?${end}`);

  // Markdown reads a marker and the lines under it as one run of HTML unless
  // a blank line separates them, so a filled chunk is spaced out. An empty
  // one closes the markers up instead, which is how Prettier leaves them.
  const body = chunk ? `\n\n${chunk}\n\n` : "\n";

  return content.replace(pattern, () => `${start}${body}${end}`);
}

/** The README's footer stamp. */
export function formatLastUpdatedAt(date: Date): string {
  return `Last updated on: ${formatStampDate(date)}`;
}

/**
 * Rebuilds the README's generated sections.
 *
 * The stamp goes on last and, by default, only when something else moved: a
 * run that finds no new posts then leaves the file byte-identical and CI has
 * nothing to commit.
 */
export function buildReadme(
  content: string,
  snapshot: GardenSnapshot,
  options: BuildOptions = {},
): BuildResult {
  const { mode = WriteMode.WhenChanged, timestamp = new Date() } = options;

  let updated = replaceChunk(
    content,
    Marker.Posts,
    buildPostsSection(snapshot.posts),
  );
  updated = replaceChunk(updated, Marker.Now, buildNowSection(snapshot.now));

  if (updated === content && mode === WriteMode.WhenChanged) {
    return { content, changed: false };
  }

  updated = replaceChunk(
    updated,
    Marker.LastUpdatedAt,
    formatLastUpdatedAt(timestamp),
  );

  return { content: updated, changed: updated !== content };
}
