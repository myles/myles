import { describe, expect, it } from "vitest";

import {
  boldLink,
  firstParagraph,
  formatPostDate,
  formatStampDate,
  joinWithAnd,
  link,
  stripHtml,
} from "../src/format.js";

describe("formatPostDate", () => {
  it.each([
    ["2026-08-24T19:30:00.000Z", "24 Aug 2026, 3:30 PM"],
    ["2026-09-14T00:46:00.000Z", "13 Sep 2026, 8:46 PM"],
    ["2026-01-01T05:00:00.000Z", "1 Jan 2026, 12:00 AM"],
  ])("formats %s in Toronto time", (iso, expected) => {
    expect(formatPostDate(new Date(iso))).toBe(expected);
  });

  it("abbreviates September as Sep, not Sept", () => {
    expect(formatPostDate(new Date("2026-09-14T16:00:00.000Z"))).toContain(
      "14 Sep 2026",
    );
  });
});

describe("formatStampDate", () => {
  it("spells the month out", () => {
    expect(formatStampDate(new Date("2026-08-24T19:30:00.000Z"))).toBe(
      "24 August 2026",
    );
  });

  it("uses the Toronto date, not UTC's", () => {
    // Just before midnight in Toronto is already the next day in UTC.
    expect(formatStampDate(new Date("2026-08-25T03:30:00.000Z"))).toBe(
      "24 August 2026",
    );
  });
});

describe("stripHtml", () => {
  it.each([
    ["<em>My Old Ass</em>", "My Old Ass"],
    ["a &amp; b", "a & b"],
    ["&lt;p&gt;", "<p>"],
    ["Myles&#39; garden", "Myles' garden"],
    ["spaced\n   out", "spaced out"],
    ["  trimmed  ", "trimmed"],
  ])("turns %s into %s", (html, expected) => {
    expect(stripHtml(html)).toBe(expected);
  });

  it("decodes each entity once", () => {
    expect(stripHtml("&amp;lt;")).toBe("&lt;");
  });
});

describe("firstParagraph", () => {
  it("keeps only the leading paragraph", () => {
    const html = "<p>First one.</p>\n<p>Second one.</p>";
    expect(firstParagraph(html)).toBe("First one.");
  });

  it("reads through the tags inside it", () => {
    const html = "<p>I finished watching <em>My Old Ass</em>.</p>";
    expect(firstParagraph(html)).toBe("I finished watching My Old Ass.");
  });

  it("keeps paragraphs that carry attributes", () => {
    expect(firstParagraph('<p class="lede">Lede.</p>')).toBe("Lede.");
  });

  it("falls back to the whole fragment when there is no paragraph", () => {
    expect(firstParagraph("<div>Bare div.</div>")).toBe("Bare div.");
  });

  it("is empty for empty input", () => {
    expect(firstParagraph("")).toBe("");
  });
});

describe("joinWithAnd", () => {
  it.each([
    [[], ""],
    [["a"], "a"],
    [["a", "b"], "a and b"],
    [["a", "b", "c"], "a, b and c"],
  ])("joins %j into %s", (items, expected) => {
    expect(joinWithAnd(items)).toBe(expected);
  });
});

describe("link", () => {
  it("builds a Markdown link", () => {
    expect(link("Sunburn", "https://example.com/")).toBe(
      "[Sunburn](https://example.com/)",
    );
  });

  it("escapes brackets so a label cannot close the link", () => {
    expect(link("Atelier [Special]", "https://example.com/")).toBe(
      "[Atelier \\[Special\\]](https://example.com/)",
    );
  });
});

describe("boldLink", () => {
  it("wraps the link in bold", () => {
    expect(boldLink("Sunburn", "https://example.com/")).toBe(
      "**[Sunburn](https://example.com/)**",
    );
  });
});
