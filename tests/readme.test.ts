import { describe, expect, it } from "vitest";

import type { GardenSnapshot } from "../src/garden.js";
import {
  buildReadme,
  formatLastUpdatedAt,
  Marker,
  replaceChunk,
  WriteMode,
} from "../src/readme.js";
import { makeJam, makeNow, makePost } from "./fixtures.js";

const TIMESTAMP = new Date("2026-08-24T19:30:00.000Z");

const TEMPLATE = [
  "# Test",
  "<!-- START: POSTS -->",
  "<!-- END: POSTS -->",
  "<!-- START: NOW -->",
  "<!-- END: NOW -->",
  "<!-- START: LAST_UPDATED_AT -->",
  "<!-- END: LAST_UPDATED_AT -->",
].join("\n");

function makeSnapshot(overrides: Partial<GardenSnapshot> = {}): GardenSnapshot {
  return { posts: [], now: makeNow(), ...overrides };
}

describe("replaceChunk", () => {
  it("fills an empty marker pair", () => {
    const content = "# Test\n<!-- START: POSTS -->\n<!-- END: POSTS -->";

    expect(replaceChunk(content, Marker.Posts, "Hello, World!")).toBe(
      [
        "# Test",
        "<!-- START: POSTS -->",
        "",
        "Hello, World!",
        "",
        "<!-- END: POSTS -->",
      ].join("\n"),
    );
  });

  it("replaces whatever was between the markers", () => {
    const content = [
      "<!-- START: NOW -->",
      "",
      "I'm the old contents.",
      "",
      "<!-- END: NOW -->",
    ].join("\n");

    expect(replaceChunk(content, Marker.Now, "I'm the new contents.")).toBe(
      [
        "<!-- START: NOW -->",
        "",
        "I'm the new contents.",
        "",
        "<!-- END: NOW -->",
      ].join("\n"),
    );
  });

  it("closes the markers up when there is nothing to say", () => {
    const content = [
      "<!-- START: NOW -->",
      "",
      "I'm the old contents.",
      "",
      "<!-- END: NOW -->",
    ].join("\n");

    expect(replaceChunk(content, Marker.Now, "")).toBe(
      "<!-- START: NOW -->\n<!-- END: NOW -->",
    );
  });

  it("leaves the other markers alone", () => {
    const result = replaceChunk(TEMPLATE, Marker.Posts, "Posts.");

    expect(result).toContain("<!-- START: NOW -->\n<!-- END: NOW -->");
  });

  it("does not read replacement patterns in the chunk", () => {
    const content = "<!-- START: NOW -->\n<!-- END: NOW -->";

    expect(replaceChunk(content, Marker.Now, "costs $5 & $&")).toContain(
      "costs $5 & $&",
    );
  });

  it("leaves content with no such markers untouched", () => {
    expect(replaceChunk("# Test", Marker.Posts, "Posts.")).toBe("# Test");
  });
});

describe("formatLastUpdatedAt", () => {
  it("stamps the Toronto date", () => {
    expect(formatLastUpdatedAt(TIMESTAMP)).toBe(
      "Last updated on: 24 August 2026",
    );
  });
});

describe("buildReadme", () => {
  it("fills every section", () => {
    const snapshot = makeSnapshot({
      posts: [makePost()],
      now: makeNow({ jam: makeJam() }),
    });

    const result = buildReadme(TEMPLATE, snapshot, { timestamp: TIMESTAMP });

    expect(result.changed).toBe(true);
    expect(result.content).toContain("- [📷 st. audrey of the bubblegum");
    expect(result.content).toContain("- 🎧 I'm currently listening to");
    expect(result.content).toContain("Last updated on: 24 August 2026");
  });

  it("leaves the file alone when no section moved", () => {
    const snapshot = makeSnapshot({ posts: [makePost()] });
    const built = buildReadme(TEMPLATE, snapshot, {
      timestamp: TIMESTAMP,
    }).content;

    const rerun = buildReadme(built, snapshot, {
      timestamp: new Date("2027-01-01T12:00:00.000Z"),
    });

    expect(rerun.changed).toBe(false);
    expect(rerun.content).toBe(built);
    expect(rerun.content).toContain("Last updated on: 24 August 2026");
  });

  it("restamps an unchanged file when forced", () => {
    const snapshot = makeSnapshot({ posts: [makePost()] });
    const built = buildReadme(TEMPLATE, snapshot, {
      timestamp: TIMESTAMP,
    }).content;

    const rerun = buildReadme(built, snapshot, {
      mode: WriteMode.Always,
      timestamp: new Date("2027-01-01T12:00:00.000Z"),
    });

    expect(rerun.changed).toBe(true);
    expect(rerun.content).toContain("Last updated on: 1 January 2027");
  });

  it("reports no change when forcing on the day it was last stamped", () => {
    const snapshot = makeSnapshot({ posts: [makePost()] });
    const built = buildReadme(TEMPLATE, snapshot, {
      timestamp: TIMESTAMP,
    }).content;

    const rerun = buildReadme(built, snapshot, {
      mode: WriteMode.Always,
      timestamp: TIMESTAMP,
    });

    expect(rerun.changed).toBe(false);
  });

  it("restamps when only the now section moved", () => {
    const built = buildReadme(TEMPLATE, makeSnapshot(), {
      timestamp: TIMESTAMP,
    }).content;

    const rerun = buildReadme(
      built,
      makeSnapshot({ now: makeNow({ jam: makeJam() }) }),
      {
        timestamp: new Date("2027-01-01T12:00:00.000Z"),
      },
    );

    expect(rerun.changed).toBe(true);
    expect(rerun.content).toContain("Last updated on: 1 January 2027");
  });
});
