import { expect, test } from 'vitest';
import { Trie, Match, defaultTrieOptions } from '../src/trie';

test('long suffix chains preserve duplicates and order after rebuilding', () => {
  const keys = Array.from({ length: 70 }, (_, i) => 'a'.repeat(i + 1));
  const trie = new Trie(keys);
  const text = 'a'.repeat(70);
  const ending = () =>
    trie
      .getMatches(text)
      .filter((m) => m.end === 69)
      .map((m) => m.keyword);
  expect(ending()).toEqual(keys.slice().reverse());
  trie.addKeyword(keys[32]);
  expect(ending()).toEqual(
    [...keys, keys[32]].sort((a, b) => b.length - a.length)
  );
  const inherited = new Trie([...keys, 'b' + text + '!']);
  expect(
    inherited
      .getMatches('b' + text)
      .filter((m) => m.end === 70)
      .map((m) => m.keyword)
  ).toEqual(keys.slice().reverse());
});

test('hasMatch agrees with filtered matches across options and updates', () => {
  for (const wholeWords of [false, true]) {
    for (const allowOverlap of [false, true]) {
      for (const caseSensitive of [false, true]) {
        const trie = new Trie([' cat ', 'İ'], {
          wholeWords,
          allowOverlap,
          caseSensitive,
          removeWhiteSpaces: true
        });
        for (const text of ['', 'bobcat', 'CAT!', 'only İ', 'İx', 'none']) {
          expect(trie.hasMatch(text)).toBe(trie.getMatches(text).length > 0);
        }
        trie.addKeyword('new');
        expect(trie.hasMatch('new')).toBe(true);
      }
    }
  }
});

test('Unicode casing preserves original UTF-16 spans and whole source characters', () => {
  const trie = new Trie(['İ', 'ΟΣ', '𐐀', 'i', 'x']);
  expect(trie.getMatches('İΟσ𐐨X')).toStrictEqual([
    new Match(0, 0, 'i\u0307'),
    new Match(1, 2, 'ος'),
    new Match(3, 4, '𐐨'),
    new Match(5, 5, 'x')
  ]);
  expect(trie.getNonMatches('!İΟΣ?')).toStrictEqual(['!', '?']);
  expect(
    new Trie(['İ'], { caseSensitive: true }).getMatches('i\u0307')
  ).toStrictEqual([]);
  expect(
    new Trie(['İ'], { wholeWords: true }).getMatches('xİ İ!')
  ).toStrictEqual([new Match(3, 3, 'i\u0307')]);
});

test('mutable dictionary rebuilds suffix outputs without accumulating them', () => {
  const trie = new Trie(['she', 'he']);
  const words = () => trie.getMatches('shex').map((m) => m.keyword);
  expect(words()).toStrictEqual(['she', 'he']);
  trie.addKeyword('ex');
  expect(words()).toStrictEqual(['she', 'he', 'ex']);
  trie.addKeyword('e');
  expect(words()).toStrictEqual(['she', 'he', 'e', 'ex']);
});

test('constructor and later insertion share trimming and case options', () => {
  for (const trim of [true, false]) {
    const options = { removeWhiteSpaces: trim, caseSensitive: true };
    const added = new Trie([], options);
    added.addKeyword(' Cat ');
    for (const trie of [added, new Trie([' Cat '], options)]) {
      expect(trie.getMatches(' cat ')).toStrictEqual([]);
      expect(trie.getMatches(' Cat ')).toStrictEqual([
        trim ? new Match(1, 3, 'Cat') : new Match(0, 4, ' Cat ')
      ]);
    }
  }
  expect(() => new Trie([' '])).toThrow(/null or empty/);
  expect(() => new Trie().addKeyword('')).toThrow(/null or empty/);
});

test('whole words, inclusive bounds, inverse spans and occurrence order', () => {
  const trie = new Trie(['cat', 'at'], { wholeWords: true });
  expect(trie.getMatches('cat! bobcat at')).toStrictEqual([
    new Match(0, 2, 'cat'),
    new Match(12, 13, 'at')
  ]);
  expect(trie.getStringOccurrences('CAT cat at!')).toStrictEqual([
    { keyword: 'cat', occurrences: 2 },
    { keyword: 'at', occurrences: 1 }
  ]);
  expect(new Trie(['abcd', 'bc']).getNonMatches('~abcd!')).toStrictEqual([
    '~',
    '!'
  ]);
  expect(new Trie().getNonMatches('text')).toStrictEqual(['text']);
  expect(new Trie().getNonMatches('')).toStrictEqual([]);
  const match = new Match(2, 4, 'abc');
  expect(match.size()).toBe(3);
  expect(match.isEqual(new Match(2, 4, 'xyz'))).toBeTruthy();
  expect(defaultTrieOptions.allowOverlap).toBe(true);
});

// Independent oracle: enumerate substrings, then greedily keep longest first.
test('all short binary texts agree with a naive matcher, including duplicates and ties', () => {
  const keys = ['ab', 'a', 'aba', 'ba', 'b', 'ab'];
  for (const allowOverlap of [true, false]) {
    const trie = new Trie(keys, { allowOverlap });
    for (let bits = 1; bits < 256; bits++) {
      const text = bits
        .toString(2)
        .slice(1)
        .replaceAll('0', 'a')
        .replaceAll('1', 'b');
      let expected: Match[] = [];
      for (let end = 1; end <= text.length; end++) {
        for (const k of keys.slice().sort((a, b) => b.length - a.length)) {
          if (text.endsWith(k, end))
            expected.push(new Match(end - k.length, end - 1, k));
        }
      }
      if (!allowOverlap) {
        const keep: Match[] = [];
        for (const m of expected.sort((a, b) => b.size() - a.size())) {
          if (
            !keep.some(
              (n) => !m.isEqual(n) && n.end >= m.start && n.start <= m.end
            )
          )
            keep.push(m);
        }
        expected = keep.sort((a, b) => a.start - b.start);
      }
      expect(trie.getMatches(text), text).toStrictEqual(expected);
      const counts = new Map<string, number>();
      for (const m of expected)
        counts.set(m.keyword, (counts.get(m.keyword) ?? 0) + 1);
      expect(trie.getStringOccurrences(text)).toStrictEqual(
        Array.from(counts, ([keyword, occurrences]) => ({
          keyword,
          occurrences
        }))
      );
    }
  }
});
