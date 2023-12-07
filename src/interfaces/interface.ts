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
 * Enum utilised for identifying path direction, e.g., left or right in the tree.
 */
export enum Direction {
  LEFT = 'Left',
  RIGHT = 'Right'
}
