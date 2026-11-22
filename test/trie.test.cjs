const test = require('node:test');
const assert = require('node:assert/strict');
const { Trie, Match, defaultTrieOptions } = require('..');

test('mutable dictionary rebuilds suffix outputs without accumulating them', () => {
  const trie = new Trie(['she', 'he']);
  const words = () => trie.getMatches('shex').map(m => m.keyword);
  assert.deepEqual(words(), ['she', 'he']);
  trie.addKeyword('ex');
  assert.deepEqual(words(), ['she', 'he', 'ex']);
  trie.addKeyword('e');
  assert.deepEqual(words(), ['she', 'he', 'e', 'ex']);
});

test('constructor and later insertion share trimming and case options', () => {
  for (const trim of [true, false]) {
    const options = { removeWhiteSpaces: trim, caseSensitive: true };
    const added = new Trie([], options);
    added.addKeyword(' Cat ');
    for (const trie of [added, new Trie([' Cat '], options)]) {
      assert.deepEqual(trie.getMatches(' cat '), []);
      assert.deepEqual(trie.getMatches(' Cat '), [trim ? new Match(1, 3, 'Cat') : new Match(0, 4, ' Cat ')]);
    }
  }
  assert.throws(() => new Trie([' ']), /null or empty/);
  assert.throws(() => new Trie().addKeyword(''), /null or empty/);
});

test('whole words, inclusive bounds, inverse spans and occurrence order', () => {
  const trie = new Trie(['cat', 'at'], { wholeWords: true });
  assert.deepEqual(trie.getMatches('cat! bobcat at'), [new Match(0, 2, 'cat'), new Match(12, 13, 'at')]);
  assert.deepEqual(trie.getStringOccurrences('CAT cat at!'), [
    { keyword: 'cat', occurrences: 2 }, { keyword: 'at', occurrences: 1 }
  ]);
  assert.deepEqual(new Trie(['abcd', 'bc']).getNonMatches('~abcd!'), ['~', '!']);
  assert.deepEqual(new Trie().getNonMatches('text'), ['text']);
  assert.deepEqual(new Trie().getNonMatches(''), []);
  const match = new Match(2, 4, 'abc');
  assert.equal(match.size(), 3);
  assert.ok(match.isEqual(new Match(2, 4, 'xyz')));
  assert.equal(defaultTrieOptions.allowOverlap, true);
});

// Independent oracle: enumerate substrings, then greedily keep longest first.
test('all short binary texts agree with a naive matcher, including duplicates and ties', () => {
  const keys = ['ab', 'a', 'aba', 'ba', 'b', 'ab'];
  for (const allowOverlap of [true, false]) {
    const trie = new Trie(keys, { allowOverlap });
    for (let bits = 1; bits < 256; bits++) {
      const text = bits.toString(2).slice(1).replaceAll('0', 'a').replaceAll('1', 'b');
      let expected = [];
      for (let end = 1; end <= text.length; end++) {
        for (const k of keys.slice().sort((a, b) => b.length - a.length)) {
          if (text.endsWith(k, end)) expected.push(new Match(end - k.length, end - 1, k));
        }
      }
      if (!allowOverlap) {
        const keep = [];
        for (const m of expected.sort((a, b) => b.size() - a.size())) {
          if (!keep.some(n => !m.isEqual(n) && n.end >= m.start && n.start <= m.end)) keep.push(m);
        }
        expected = keep.sort((a, b) => a.start - b.start);
      }
      assert.deepEqual(trie.getMatches(text), expected, text);
      const counts = new Map();
      for (const m of expected) counts.set(m.keyword, (counts.get(m.keyword) ?? 0) + 1);
      assert.deepEqual(trie.getStringOccurrences(text), Array.from(counts, ([keyword, occurrences]) => ({ keyword, occurrences })));
    }
  }
});
