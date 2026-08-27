import { describe, expect, it } from "vitest";

import {
  fetchSnapshot,
  RECENT_POST_LIMIT,
  type GardenSource,
} from "../src/garden.js";
import { makeNow, makePost } from "./fixtures.js";

import type { Post } from "@myles-garden/sdk";

/** A stand-in garden serving one page of whatever the test hands it. */
function makeSource(posts: Post[]): GardenSource {
  return {
    getPostsPage: async () => ({ count: posts.length, result: posts }),
    getNow: async () => makeNow(),
  };
}

describe("fetchSnapshot", () => {
  it("keeps the posts in the order the garden served them", async () => {
    const posts = [
      makePost({ id: "first" }),
      makePost({ id: "second" }),
      makePost({ id: "third" }),
    ];

    const snapshot = await fetchSnapshot({ source: makeSource(posts) });

    expect(snapshot.posts.map((post) => post.id)).toEqual([
      "first",
      "second",
      "third",
    ]);
  });

  it("drops posts published to their own URL only", async () => {
    const posts = [
      makePost({ id: "global", visibility: "global" }),
      makePost({ id: "direct", visibility: "direct" }),
      makePost({ id: "stream", visibility: "stream" }),
    ];

    const snapshot = await fetchSnapshot({ source: makeSource(posts) });

    expect(snapshot.posts.map((post) => post.id)).toEqual(["global", "stream"]);
  });

  it("takes only the first few posts", async () => {
    const posts = Array.from({ length: 25 }, (_, index) =>
      makePost({ id: `post-${index}` }),
    );

    const snapshot = await fetchSnapshot({ source: makeSource(posts) });

    expect(snapshot.posts).toHaveLength(RECENT_POST_LIMIT);
  });

  it("honours a limit of its own", async () => {
    const posts = [makePost({ id: "first" }), makePost({ id: "second" })];

    const snapshot = await fetchSnapshot({
      source: makeSource(posts),
      limit: 1,
    });

    expect(snapshot.posts.map((post) => post.id)).toEqual(["first"]);
  });

  it("carries the now snapshot through untouched", async () => {
    const snapshot = await fetchSnapshot({ source: makeSource([]) });

    expect(snapshot.now).toEqual(makeNow());
  });
});
