// Run in a fresh process: node --expose-gc scripts/bench-suffixes.cjs
const { Trie } = require('..');
const assert = require('node:assert/strict');
const keys = Array.from({ length: 1000 }, (_, i) => 'a'.repeat(i + 1));
const text = keys[keys.length - 1];
global.gc();
const before = process.memoryUsage().heapUsed;
const trie = new Trie(keys, { caseSensitive: true });
trie.hasMatch('!'); // include compiled failure links in retained heap
global.gc();
const bytes = process.memoryUsage().heapUsed - before;
const run = () =>
  trie.getStringOccurrences(text).reduce((n, m) => n + m.occurrences, 0);
assert.equal(run(), 500500);
const times = Array.from({ length: 7 }, () => {
  const start = performance.now();
  assert.equal(run(), 500500);
  return performance.now() - start;
});
console.log(
  `${(bytes / 1048576).toFixed(2)} MiB retained; ${times.sort((a, b) => a - b)[3].toFixed(2)} ms/count`
);
