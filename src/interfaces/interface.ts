/**
 * @description
 * Options for configuring the behavior of a Trie.
 */
export interface TrieOptions {
  allowOverlap: boolean; // Whether overlapping matches are allowed in the Trie.
  caseSensitive: boolean; // Whether the Trie is case-sensitive in matching.
  removeWhiteSpaces: boolean; // Whether to trim whitespaces from strings on build the Trie and matching strings.
  wholeWords: boolean; // Whether to match whole words only in the Trie.
}

/**
 * @description
 * Enum utilised for identifying path direction, e.g., left or right in the tree.
 */
export enum Direction {
  LEFT = 'Left',
  RIGHT = 'Right'
}

/**
 * @description
 * Basic interface for storing of the number of times a given keyword is matched.
 */
export interface WordCount {
  keyword: string;
  occurrences: number;
}
