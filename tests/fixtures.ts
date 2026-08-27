import type {
  Now,
  NowJam,
  NowNailPolish,
  NowReading,
  Post,
} from "@myles-garden/sdk";

/**
 * Builders for the SDK's records, so a test can state only the fields it
 * cares about and leave the rest at something plausible.
 */

const AUTHOR = {
  id: "myles",
  name: "Myles Braithwaite",
  url: "https://myles.garden/myles",
};

export function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: "2026/08/24/bubblegum-saint",
    type: "photo",
    url: "https://myles.garden/2026/08/24/bubblegum-saint",
    apiUrl: "https://myles.garden/api/v1/posts/2026/08/24/bubblegum-saint.json",
    emoji: "📷",
    content: "<p>st. audrey of the bubblegum, presiding over the alley</p>",
    author: AUTHOR,
    tags: [],
    visibility: "global",
    media: [],
    syndication: [],
    publishedAt: new Date("2026-08-24T19:30:00.000Z"),
    ...overrides,
  };
}

export function makeReading(overrides: Partial<NowReading> = {}): NowReading {
  return {
    id: "9780857308412",
    title: "Sunburn",
    authors: ["Chloe Michelle Howarth"],
    isbn: "9780857308412",
    url: "https://myles.garden/bookshelf/books/9780857308412",
    ...overrides,
  };
}

export function makeJam(overrides: Partial<NowJam> = {}): NowJam {
  return {
    track: "Real Life",
    artist: "ear",
    album: "The Most Dear and The Future",
    url: "https://myles.garden/2026/08/08/real-life",
    apiUrl: "https://myles.garden/api/v1/posts/2026/08/08/real-life.json",
    listenOnUrls: [],
    playingSince: new Date("2026-08-08T21:56:17.000Z"),
    staleAfter: new Date("2026-08-15T21:56:17.000Z"),
    ...overrides,
  };
}

const BARE_HAND = {
  thumb: null,
  index: null,
  middle: null,
  ring: null,
  little: null,
};

export function makeNailPolish(
  overrides: Partial<NowNailPolish> = {},
): NowNailPolish {
  return {
    name: "Painted Nails With Spread the Cherry",
    url: "https://myles.garden/2026/08/11/manicure",
    apiUrl: "https://myles.garden/api/v1/posts/2026/08/11/manicure.json",
    wornSince: new Date("2026-08-12T01:33:16.000Z"),
    staleAfter: new Date("2026-08-26T01:33:16.000Z"),
    polishes: [
      {
        id: "spreadTheCherry",
        label: "Spread the Cherry",
        colour: "#a1291c",
        url: "https://www.opi.com/products/nail-lacquer-spread-the-cherry",
      },
    ],
    hands: { left: BARE_HAND, right: BARE_HAND },
    ...overrides,
  };
}

export function makeNow(overrides: Partial<Now> = {}): Now {
  return {
    generatedAt: new Date("2026-08-25T00:19:02.000Z"),
    nailPolish: null,
    reading: [],
    jam: null,
    ...overrides,
  };
}
