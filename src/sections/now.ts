import type { Now, NowJam, NowNailPolish, NowReading } from "@myles-garden/sdk";

import { boldLink, joinWithAnd } from "../format.js";

const READING_EMOJI = "📚";
const JAM_EMOJI = "🎧";
const NAIL_POLISH_EMOJI = "💅";

function formatReading(book: NowReading): string {
  const title = boldLink(book.title, book.url);
  const authors = joinWithAnd(book.authors);

  if (!authors) {
    return `- ${READING_EMOJI} I'm currently reading ${title}`;
  }

  return `- ${READING_EMOJI} I'm currently reading ${title} by ${authors}`;
}

function formatJam(jam: NowJam): string {
  const track = boldLink(jam.track, jam.url);

  return `- ${JAM_EMOJI} I'm currently listening to ${track} by ${jam.artist}`;
}

/**
 * A manicure is usually one bottle across all ten nails, but nothing stops it
 * being several, so every bottle in the snapshot is named.
 *
 * The whole label links to the manicure post rather than to the bottles: the
 * post is the thing worth reading, and several bottles would otherwise
 * scatter the line across as many vendor sites. The polish's own name stands
 * in when a snapshot somehow lists no bottles.
 */
function formatNailPolish(polish: NowNailPolish): string {
  const labels = polish.polishes.map((bottle) => bottle.label);
  const worn = joinWithAnd(labels) || polish.name;

  return `- ${NAIL_POLISH_EMOJI} I'm currently wearing ${boldLink(worn, polish.url)}`;
}

/**
 * The whole `now` block — a line per facet, and nothing at all for the ones
 * the garden reports as empty.
 */
export function buildNowSection(now: Now): string {
  const lines = now.reading.map(formatReading);

  if (now.jam) {
    lines.push(formatJam(now.jam));
  }

  if (now.nailPolish) {
    lines.push(formatNailPolish(now.nailPolish));
  }

  return lines.join("\n");
}
