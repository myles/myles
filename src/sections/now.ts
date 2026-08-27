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
 * being several, so every bottle in the snapshot is named. The manicure post
 * itself stands in when a snapshot somehow lists none.
 */
function formatNailPolish(polish: NowNailPolish): string {
  const bottles = polish.polishes.map((bottle) =>
    boldLink(bottle.label, bottle.url),
  );

  const worn = joinWithAnd(bottles) || boldLink(polish.name, polish.url);

  return `- ${NAIL_POLISH_EMOJI} I'm currently wearing ${worn}`;
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
