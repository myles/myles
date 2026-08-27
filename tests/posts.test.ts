import { describe, expect, it } from "vitest";

import {
  buildPostsSection,
  formatPost,
  summarisePost,
} from "../src/sections/posts.js";
import { makePost } from "./fixtures.js";

describe("summarisePost", () => {
  it("prefers the post's title", () => {
    const post = makePost({
      name: "weekend dump",
      content: "<p>a weekend, roughly.</p>",
    });

    expect(summarisePost(post).content).toBe("weekend dump");
  });

  it("falls back to the caption when there is no title", () => {
    const post = makePost({
      content: "<p>I finished watching <em>My Old Ass</em>.</p>",
    });

    expect(summarisePost(post).content).toBe("I finished watching My Old Ass.");
  });

  it("falls back to the summary when there is no content", () => {
    const post = makePost({ content: undefined, summary: "A summary." });

    expect(summarisePost(post).content).toBe("A summary.");
  });

  it("is content-free when the post carries nothing to say", () => {
    const post = makePost({ content: undefined, summary: undefined });

    expect(summarisePost(post).content).toBe("");
  });

  it("ignores a title that is only whitespace", () => {
    const post = makePost({ name: "   ", content: "<p>Caption.</p>" });

    expect(summarisePost(post).content).toBe("Caption.");
  });

  it("keeps the post's own emoji", () => {
    expect(summarisePost(makePost({ emoji: "🎬" })).emoji).toBe("🎬");
  });

  it("falls back to the emoji its type implies", () => {
    const post = makePost({ type: "read", emoji: undefined });

    expect(summarisePost(post).emoji).toBe("📚");
  });

  it("has no emoji for a type the SDK gained after this map", () => {
    const post = makePost({ type: "brand-new-type", emoji: undefined });

    expect(summarisePost(post).emoji).toBe("");
  });

  it("stamps the published date in Toronto time", () => {
    expect(summarisePost(makePost()).published).toBe("24 Aug 2026, 3:30 PM");
  });
});

describe("formatPost", () => {
  it("builds a bullet", () => {
    const result = formatPost({
      url: "https://example.com/post/",
      emoji: "📝",
      content: "I Am A Blog Post Title",
      published: "1 Jan 2023, 1:01 AM",
    });

    expect(result).toBe(
      "- [📝 I Am A Blog Post Title](https://example.com/post/) — 1 Jan 2023, 1:01 AM",
    );
  });

  it("drops the space when a photograph has no caption", () => {
    const result = formatPost({
      url: "https://example.com/photo/",
      emoji: "📷",
      content: "",
      published: "1 Jan 2023, 1:01 AM",
    });

    expect(result).toBe(
      "- [📷](https://example.com/photo/) — 1 Jan 2023, 1:01 AM",
    );
  });

  it("labels with the URL when there is nothing else to show", () => {
    const result = formatPost({
      url: "https://example.com/bare/",
      emoji: "",
      content: "",
      published: "1 Jan 2023, 1:01 AM",
    });

    expect(result).toBe(
      "- [https://example.com/bare/](https://example.com/bare/) — 1 Jan 2023, 1:01 AM",
    );
  });
});

describe("buildPostsSection", () => {
  it("renders a bullet per post, in the order given", () => {
    const posts = [
      makePost({ url: "https://myles.garden/one", content: "<p>One.</p>" }),
      makePost({ url: "https://myles.garden/two", content: "<p>Two.</p>" }),
    ];

    expect(buildPostsSection(posts)).toBe(
      [
        "- [📷 One.](https://myles.garden/one) — 24 Aug 2026, 3:30 PM",
        "- [📷 Two.](https://myles.garden/two) — 24 Aug 2026, 3:30 PM",
      ].join("\n"),
    );
  });

  it("is empty when there are no posts", () => {
    expect(buildPostsSection([])).toBe("");
  });
});
