import {
  GardenSdk,
  type GardenClient,
  type Now,
  type Post,
} from "@myles-garden/sdk";

/**
 * The data layer: everything that talks to myles.garden lives here, so the
 * sections above it only ever see plain records.
 */

/** How many posts the README carries. */
export const RECENT_POST_LIMIT = 5;

/** The slice of the Garden client this module uses, and all a test needs. */
export type GardenSource = Pick<GardenClient, "getPostsPage" | "getNow">;

/** Everything the README shows, fetched fresh. */
export interface GardenSnapshot {
  posts: Post[];
  now: Now;
}

export interface SnapshotOptions {
  source?: GardenSource;
  limit?: number;
}

/**
 * The newest posts worth surfacing, newest first.
 *
 * `direct` posts are dropped deliberately: the garden publishes those at
 * their own URL and nowhere else, so repeating them in a README would put
 * them somewhere they were never meant to appear. One page is plenty — it
 * carries 25 posts and the README shows a handful.
 */
async function fetchRecentPosts(
  source: GardenSource,
  limit: number,
): Promise<Post[]> {
  const page = await source.getPostsPage();

  return page.result
    .filter((post) => post.visibility !== "direct")
    .slice(0, limit);
}

/** Both sections at once, since neither depends on the other. */
export async function fetchSnapshot(
  options: SnapshotOptions = {},
): Promise<GardenSnapshot> {
  const { source = GardenSdk, limit = RECENT_POST_LIMIT } = options;

  const [posts, now] = await Promise.all([
    fetchRecentPosts(source, limit),
    source.getNow(),
  ]);

  return { posts, now };
}
