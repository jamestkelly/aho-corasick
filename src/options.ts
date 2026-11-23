/** Dictionary normalization and search-result policy for a trie. */
export interface TrieOptions {
  /** Emit intersecting spans. When false, longer spans win; identical spans survive together. */
  allowOverlap: boolean;
  /** Compare original code units instead of lowercasing keywords and text. */
  caseSensitive: boolean;
  /** Trim the ends of keywords, never the input text. */
  removeWhiteSpaces: boolean;
  /** Require both neighboring code units to be absent or outside ASCII letters and digits. */
  wholeWords: boolean;
}

/** Case-insensitive substring matching with overlaps and untrimmed keywords. */
export const defaultTrieOptions: TrieOptions = {
  allowOverlap: true,
  caseSensitive: false,
  removeWhiteSpaces: false,
  wholeWords: false,
};
