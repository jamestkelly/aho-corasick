const assert = require('node:assert/strict');
const { performance } = require('node:perf_hooks');
const { Trie } = require('..');

function median(run) {
  run();
  const times = Array.from({ length: 9 }, () => {
    const start = performance.now();
    run();
    return performance.now() - start;
  });
  return times.sort((a, b) => a - b)[4].toFixed(3);
}

// Report counts in dictionary order for both methods. Include overlapping hits.
function byIndex(keys, text) {
  return keys.map(key => {
    let count = 0;
    for (let at = text.indexOf(key); at !== -1; at = text.indexOf(key, at + 1)) count++;
    return count;
  });
}

console.log(process.version, process.platform, process.arch, '(median ms)');
for (const size of [4, 1024]) {
  const keys = ['a', 'aa', 'cold brew', 'espresso', ...Array.from({length: size - 4}, (_, i) => `product-${i};`)];
  for (const [kind, text] of [
    ['prose', 'One espresso and a cold brew at the station. '.repeat(500)],
    ['dense', 'a'.repeat(12000)]
  ]) {
    const build = () => {
      const trie = new Trie(keys, { caseSensitive: true });
      trie.getMatches('!'); // Compilation is lazy.
      return trie;
    };
    const trie = build();
    const scan = () => {
      const counts = new Map(trie.getStringOccurrences(text).map(x => [x.keyword, x.occurrences]));
      return keys.map(key => counts.get(key) ?? 0);
    };
    assert.deepEqual(scan(), byIndex(keys, text));
    console.log(`${size} ${kind}: build ${median(build)}, warm trie ${median(scan)}, indexOf ${median(() => byIndex(keys, text))}`);
  }
}
