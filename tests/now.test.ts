import { describe, expect, it } from "vitest";

import { buildNowSection } from "../src/sections/now.js";
import { makeJam, makeNailPolish, makeNow, makeReading } from "./fixtures.js";

describe("buildNowSection", () => {
  it("names a book and its author", () => {
    const now = makeNow({ reading: [makeReading()] });

    expect(buildNowSection(now)).toBe(
      "- 📚 I'm currently reading **[Sunburn](https://myles.garden/bookshelf/books/9780857308412)** by Chloe Michelle Howarth",
    );
  });

  it("joins several authors", () => {
    const now = makeNow({
      reading: [
        makeReading({
          title: "Witch Hat Atelier, Volume 1",
          url: "https://myles.garden/bookshelf/books/9781632367709",
          authors: ["Kamome Shirahama", "Stephen Kohler"],
        }),
      ],
    });

    expect(buildNowSection(now)).toContain(
      "by Kamome Shirahama and Stephen Kohler",
    );
  });

  it("omits the byline for a book with no listed author", () => {
    const now = makeNow({ reading: [makeReading({ authors: [] })] });

    expect(buildNowSection(now)).toBe(
      "- 📚 I'm currently reading **[Sunburn](https://myles.garden/bookshelf/books/9780857308412)**",
    );
  });

  it("gives every book on the go its own line", () => {
    const now = makeNow({
      reading: [
        makeReading(),
        makeReading({ title: "Second", url: "https://myles.garden/second" }),
      ],
    });

    expect(buildNowSection(now).split("\n")).toHaveLength(2);
  });

  it("names the current jam", () => {
    const now = makeNow({ jam: makeJam() });

    expect(buildNowSection(now)).toBe(
      "- 🎧 I'm currently listening to **[Real Life](https://myles.garden/2026/08/08/real-life)** by ear",
    );
  });

  it("names the polish, not the manicure post", () => {
    const now = makeNow({ nailPolish: makeNailPolish() });

    expect(buildNowSection(now)).toBe(
      "- 💅 I'm currently wearing **[Spread the Cherry](https://www.opi.com/products/nail-lacquer-spread-the-cherry)**",
    );
  });

  it("joins a manicure worn in several polishes", () => {
    const polish = makeNailPolish({
      polishes: [
        {
          id: "one",
          label: "One",
          colour: "#000000",
          url: "https://example.com/one",
        },
        {
          id: "two",
          label: "Two",
          colour: "#ffffff",
          url: "https://example.com/two",
        },
      ],
    });

    expect(buildNowSection(makeNow({ nailPolish: polish }))).toContain(
      "**[One](https://example.com/one)** and **[Two](https://example.com/two)**",
    );
  });

  it("falls back to the manicure post when no bottle is listed", () => {
    const polish = makeNailPolish({ polishes: [] });

    expect(buildNowSection(makeNow({ nailPolish: polish }))).toBe(
      "- 💅 I'm currently wearing **[Painted Nails With Spread the Cherry](https://myles.garden/2026/08/11/manicure)**",
    );
  });

  it("orders the facets: reading, then jam, then nails", () => {
    const now = makeNow({
      reading: [makeReading()],
      jam: makeJam(),
      nailPolish: makeNailPolish(),
    });

    expect(
      buildNowSection(now)
        .split("\n")
        .map((line) => line.slice(2, 4)),
    ).toEqual(["📚", "🎧", "💅"]);
  });

  it("is empty when nothing is going on", () => {
    expect(buildNowSection(makeNow())).toBe("");
  });
});
