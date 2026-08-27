#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";

import { fetchSnapshot } from "./garden.js";
import { buildReadme, WriteMode } from "./readme.js";

/** The README sits one level above the compiled `dist/` this runs from. */
const README_URL = new URL("../README.md", import.meta.url);

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      force: { type: "boolean", short: "f", default: false },
    },
  });

  const content = await readFile(README_URL, "utf8");
  const snapshot = await fetchSnapshot();

  const result = buildReadme(content, snapshot, {
    mode: values.force ? WriteMode.Always : WriteMode.WhenChanged,
  });

  if (!result.changed) {
    console.log("No new changes to the README file.");
    return;
  }

  await writeFile(README_URL, result.content, "utf8");
  console.log("Updated the README file.");
}

await main();
