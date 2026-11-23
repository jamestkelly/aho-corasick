/** Compare equivalent overlapping counts with and without a compiled dictionary. */
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { Trie } from "../dist/trie.js";

/** Warm once, then report the median of nine samples in milliseconds. */
function median(run: () => unknown) {
  run();
  const times = Array.from({ length: 9 }, () => {
    const start = performance.now();
    run();
    return performance.now() - start;
  });
  return times.sort((a, b) => a - b)[4].toFixed(3);
}

/** Count overlapping occurrences per key in dictionary order for the reference result. */
function byIndex(keys: string[], text: string) {
  return keys.map((key) => {
    let count = 0;
    for (let at = text.indexOf(key); at !== -1; at = text.indexOf(key, at + 1)) count++;
    return count;
  });
}

console.log(process.version, process.platform, process.arch, "(median ms)");
for (const size of [4, 1024]) {
  const keys = [
    "a",
    "aa",
    "cold brew",
    "espresso",
    ...Array.from({ length: size - 4 }, (_, i) => `product-${i};`),
  ];
  for (const [kind, text] of [
    ["prose", "One espresso and a cold brew at the station. ".repeat(500)],
    ["dense", "a".repeat(12000)],
  ]) {
    /** Include lazy failure-link construction in build time. */
    const build = () => {
      const trie = new Trie(keys, { caseSensitive: true });
      trie.getMatches("!"); // Compilation is lazy.
      return trie;
    };
    const trie = build();
    /** Include missing keywords as zero counts, matching the reference result. */
    const scan = () => {
      const counts = new Map(
        trie.getStringOccurrences(text).map((x) => [x.keyword, x.occurrences]),
      );
      return keys.map((key) => counts.get(key) ?? 0);
    };
    assert.deepEqual(scan(), byIndex(keys, text));
    console.log(
      `${size} ${kind}: build ${median(build)}, warm trie ${median(scan)}, indexOf ${median(() => byIndex(keys, text))}`,
    );
  }
}
