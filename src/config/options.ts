/**
 * Options for configuring the behavior of a Trie.
 */
export interface TrieOptions {
  allowOverlap: boolean; // Whether overlapping matches are allowed in the Trie.
  caseSensitive: boolean; // Whether the Trie is case-sensitive in matching.
  invertedMatch: boolean; // Whether to perform inverted matching (exclude matching strings).
  wholeWords: boolean; // Whether to match whole words only in the Trie.
  wordCount: boolean; // Whether to count the occurrences of each word in the Trie.
}

/**
 * Default Trie options used when creating a Trie without specifying custom options.
 */
export const defaultTrieOptions: TrieOptions = {
  allowOverlap: true, // Overlapping matches are allowed by default.
  caseSensitive: false, // Case-insensitive matching by default.
  invertedMatch: false, // Regular matching (not inverted) by default.
  wholeWords: false, // Partial word matching is allowed by default.
  wordCount: false // Do not count word occurrences by default.
};
