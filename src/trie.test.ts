import { Trie } from './trie';

describe('Trie', () => {
  describe('addKeyword', () => {
    test('keyword and text are the same', () => {
      const trie = new Trie(['trie']);
      const matches = trie.getMatches('trie');
      expect(matches).toHaveLength(1);
      expect(matches[0]).toEqual({
        end: 3,
        start: 0,
        keyword: 'trie'
      });
    });

    test('no keywords provided should not throw an error', () => {
      const trie = new Trie();
      expect(trie).toEqual(new Trie());
    });

    test('keywords array of empty strings to throw an error', () => {
      expect(() => {
        const trie = new Trie(['', '']);
      }).toThrow('Provided string `keyword` is a null or empty string.');
    });
  });

  describe('getMatches', () => {
    test('should return empty array for empty text', () => {
      const trie = new Trie(['apple', 'banana']);
      const matches = trie.getMatches('');
      expect(matches).toHaveLength(0);
    });

    test('should find matches in the text', () => {
      const trie = new Trie(['apple', 'banana']);
      const matches = trie.getMatches('apple banana');
      expect(matches).toHaveLength(2);
      expect(matches).toEqual([
        { start: 0, end: 4, keyword: 'apple' },
        { start: 6, end: 11, keyword: 'banana' }
      ]);
    });

    test('should be case insensitive if options are set', () => {
      const trie = new Trie(['apple'], { caseSensitive: false });
      const matches = trie.getMatches('Apple');
      expect(matches).toHaveLength(1);
      expect(matches[0]).toEqual({
        start: 0,
        end: 4,
        keyword: 'apple'
      });
    });

    test('should remove white spaces if options are set', () => {
      const trie = new Trie(['apple'], { removeWhiteSpaces: true });
      const matches = trie.getMatches('  apple  ');
      expect(matches).toHaveLength(1);
      expect(matches[0]).toEqual({
        start: 2,
        end: 6,
        keyword: 'apple'
      });
    });

    test('should handle whole words option', () => {
      const trie = new Trie(['apple']);
      const matches = trie.getMatches('pineapple');
      expect(matches[0]).toEqual({
        start: 4,
        end: 8,
        keyword: 'apple'
      });

      const wholeWordsTrie = new Trie(['apple'], { wholeWords: true });
      const wholeWordsMatches = wholeWordsTrie.getMatches('pineapple');
      expect(wholeWordsMatches).toHaveLength(0);
    });

    test('should handle overlapping matches option', () => {
      const trie = new Trie(['ab', 'cba', 'ababc']);
      const matches = trie.getMatches('ababcbab');
      expect(matches).toHaveLength(5);

      const noOverlapTrie = new Trie(['ab', 'cba', 'ababc'], {
        allowOverlap: false
      });
      const noOverlapMatches = noOverlapTrie.getMatches('ababcbab');
      expect(noOverlapMatches).toHaveLength(2);
    });
  });

  describe('getNonMatches', () => {
    test('should return entire text if no matches', () => {
      const trie = new Trie(['cat', 'dog']);
      const nonMatches = trie.getNonMatches('bird');
      expect(nonMatches).toHaveLength(1);
      expect(nonMatches[0]).toEqual('bird');
    });

    test('should return non-matching substrings', () => {
      const trie = new Trie(['cat', 'dog']);
      const nonMatches = trie.getNonMatches('The cat and the dog');
      expect(nonMatches).toHaveLength(2);
      expect(nonMatches).toEqual(['The ', ' and the ']);
    });

    test('should handle case sensitivity and white spaces options', () => {
      const trie = new Trie(['apple'], {
        caseSensitive: false,
        removeWhiteSpaces: true
      });
      const nonMatches = trie.getNonMatches('An APPLE a day');
      expect(nonMatches).toHaveLength(2);
      expect(nonMatches).toEqual(['An ', ' a day']);
    });

    test('should return empty array for empty text', () => {
      const trie = new Trie(['cat', 'dog']);
      const nonMatches = trie.getNonMatches('');
      expect(nonMatches).toHaveLength(0);
    });

    test('should return empty array for empty matches', () => {
      const trie = new Trie([]);
      const nonMatches = trie.getNonMatches('Hello World');
      expect(nonMatches).toHaveLength(1);
      expect(nonMatches[0]).toEqual('Hello World');
    });
  });

  describe('getStringOccurrences', () => {
    test('should return empty array for empty text', () => {
      const trie = new Trie(['apple', 'banana']);
      const occurrences = trie.getStringOccurrences('');
      expect(occurrences).toHaveLength(0);
    });

    test('should count occurrences of matched words', () => {
      const trie = new Trie(['apple', 'banana']);
      const occurrences = trie.getStringOccurrences('apple banana apple');
      expect(occurrences).toHaveLength(2);
      expect(occurrences).toEqual([
        { keyword: 'apple', occurrences: 2 },
        { keyword: 'banana', occurrences: 1 }
      ]);
    });

    test('should be case insensitive if options are set', () => {
      const trie = new Trie(['apple'], { caseSensitive: false });
      const occurrences = trie.getStringOccurrences('Apple apple');
      expect(occurrences).toHaveLength(1);
      expect(occurrences).toEqual([{ keyword: 'apple', occurrences: 2 }]);
    });

    test('should remove white spaces if options are set', () => {
      const trie = new Trie(['apple'], { removeWhiteSpaces: true });
      const occurrences = trie.getStringOccurrences('apple  apple');
      expect(occurrences).toHaveLength(1);
      expect(occurrences).toEqual([{ keyword: 'apple', occurrences: 2 }]);
    });

    test('should handle whole words option', () => {
      const trie = new Trie(['apple']);
      const occurrences = trie.getStringOccurrences('pineapple apple');
      expect(occurrences).toHaveLength(1);
      expect(occurrences).toEqual([{ keyword: 'apple', occurrences: 2 }]);

      const wholeWordsTrie = new Trie(['apple'], { wholeWords: true });
      const wholeWordsOccurrences =
        wholeWordsTrie.getStringOccurrences('pineapple apple');
      expect(wholeWordsOccurrences).toHaveLength(1);
      expect(wholeWordsOccurrences).toEqual([
        { keyword: 'apple', occurrences: 1 }
      ]);
    });

    test('should handle overlapping matches option', () => {
      const trie = new Trie(['ab', 'cba', 'ababc']);
      const occurrences = trie.getStringOccurrences('ababcbab');
      expect(occurrences).toHaveLength(3);
      expect(occurrences).toEqual([
        { keyword: 'ab', occurrences: 3 },
        { keyword: 'ababc', occurrences: 1 },
        { keyword: 'cba', occurrences: 1 }
      ]);

      const noOverlapTrie = new Trie(['ab', 'cba', 'ababc'], {
        allowOverlap: false
      });
      const noOverlapOccurrences =
        noOverlapTrie.getStringOccurrences('ababcbab');
      expect(noOverlapOccurrences).toHaveLength(2);
      expect(noOverlapOccurrences).toEqual([
        { keyword: 'ababc', occurrences: 1 },
        { keyword: 'ab', occurrences: 1 }
      ]);
    });
  });
});
