import { TrieOptions } from "../interfaces/interface";

/**
 * Default Trie options used when creating a Trie without specifying custom options.
 */
export const defaultTrieOptions: TrieOptions = {
  allowOverlap: true, // Overlapping matches are allowed by default.
  caseSensitive: false, // Case-insensitive matching by default.
  invertedMatch: false, // Regular matching (not inverted) by default.
  removeWhiteSpaces: false, // Do not trim white spaces from strings prior to matching by default.
  wholeWords: false, // Partial word matching is allowed by default.
  wordCount: false // Do not count word occurrences by default.
};
