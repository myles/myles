/**
 * Text and date helpers shared by the README's sections.
 *
 * Nothing here knows what a post or a book is — it turns values into the
 * fragments of Markdown a bullet is assembled from.
 */

/** Every stamp is in Myles' own timezone, never the CI runner's. */
const TIME_ZONE = "America/Toronto";

/** Fixed so a runner with a different default locale formats identically. */
const LOCALE = "en-US";

/** Entities the garden's rendered HTML actually contains. */
const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&apos;": "'",
  "&gt;": ">",
  "&lt;": "<",
  "&nbsp;": " ",
  "&quot;": '"',
  "&#39;": "'",
};

/**
 * A formatted date broken into its named parts, so a layout can be assembled
 * by hand.
 *
 * `Intl` cannot produce "24 Aug 2026" on its own: the locales that lead with
 * the day abbreviate September as "Sept", and the ones that say "Sep" lead
 * with the month.
 */
function dateParts(
  date: Date,
  options: Intl.DateTimeFormatOptions,
): Record<string, string> {
  const formatter = new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIME_ZONE,
    ...options,
  });

  const parts: Record<string, string> = {};
  for (const { type, value } of formatter.formatToParts(date)) {
    parts[type] = value;
  }

  return parts;
}

/** A post's timestamp, e.g. `24 Aug 2026, 3:30 PM`. */
export function formatPostDate(date: Date): string {
  const parts = dateParts(date, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const day = `${parts.day} ${parts.month} ${parts.year}`;
  const time = `${parts.hour}:${parts.minute} ${parts.dayPeriod}`;

  return `${day}, ${time}`;
}

/** The README's footer stamp, e.g. `24 August 2026`. */
export function formatStampDate(date: Date): string {
  const parts = dateParts(date, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `${parts.day} ${parts.month} ${parts.year}`;
}

/** Tags removed and entities decoded, collapsed onto a single line. */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(
      /&(?:amp|apos|gt|lt|nbsp|quot|#39);/g,
      (entity) => HTML_ENTITIES[entity] ?? entity,
    )
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * The plain text of the first paragraph of a rendered HTML fragment.
 *
 * The garden serves posts as HTML and a README bullet wants one line of
 * prose, so only the leading paragraph survives — a photo dump's caption is
 * the part worth surfacing, not its whole body. A fragment with no paragraph
 * at all is stripped as it stands.
 */
export function firstParagraph(html: string): string {
  const paragraph = /<p\b[^>]*>([\s\S]*?)<\/p>/i.exec(html);

  return stripHtml(paragraph?.[1] ?? html);
}

/** `["a", "b", "c"]` becomes `a, b and c`. */
export function joinWithAnd(items: string[]): string {
  if (items.length <= 1) {
    return items[0] ?? "";
  }

  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

/**
 * A Markdown link. Brackets in the label are escaped so a title that carries
 * its own — "Witch Hat Atelier [Special Edition]" — cannot close the link
 * early.
 */
export function link(label: string, url: string): string {
  return `[${label.replace(/([[\]])/g, "\\$1")}](${url})`;
}

/** A Markdown link in bold, which is how the `now` section names things. */
export function boldLink(label: string, url: string): string {
  return `**${link(label, url)}**`;
}
