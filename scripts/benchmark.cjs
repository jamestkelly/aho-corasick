const { Trie } = require('..');
const { performance } = require('node:perf_hooks');
const keys = ['a', 'aa', 'aaa', 'aaaa'];
const dense = 'a'.repeat(4000);
const wide = Array.from({ length: 12000 }, (_, i) => `item-${i}`);
const trie = new Trie(keys);
const filtered = new Trie(keys, { allowOverlap: false });
const misses = 'x'.repeat(100000);
console.log(process.version, process.platform, process.arch);
for (const [label, run] of [
  ['cold 12k keys + first search', () => new Trie(wide).getMatches('item-1234').length],
  ['warm miss 100k', () => trie.getMatches('x'.repeat(100000)).length],
  ...[['early', `a${misses}`], ['late', `${misses}a`], ['miss', misses]].map(
    ([label, text]) => [`hasMatch ${label}`, () => trie.hasMatch(text)]
  ),
  ['dense matches', () => trie.getMatches(dense).length],
  ['dense counts', () => trie.getStringOccurrences(dense).length],
  ['dense no overlap', () => filtered.getMatches(dense).length]
]) {
  const result = run();
  const times = Array.from({ length: 7 }, () => {
    const start = performance.now();
    if (run() !== result) throw Error('Unstable result');
    return performance.now() - start;
  }).sort((a, b) => a - b);
  console.log(`${label}: ${times[3].toFixed(2)} ms (result: ${result})`);
}
