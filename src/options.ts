export interface TrieOptions {
  allowOverlap: boolean;
  caseSensitive: boolean;
  removeWhiteSpaces: boolean;
  wholeWords: boolean;
}

export const defaultTrieOptions: TrieOptions = {
  allowOverlap: true,
  caseSensitive: false,
  removeWhiteSpaces: false,
  wholeWords: false
};
