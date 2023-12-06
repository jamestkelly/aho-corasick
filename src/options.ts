/**
 * 
 */
export interface TrieOptions {
    allowOverlap: boolean;
    caseSensitive: boolean;
    invertedMatch: boolean;
    wholeWords: boolean;
}

/**
 * 
 */
export const defaultTrieOptions: TrieOptions = {
    allowOverlap: true,
    caseSensitive: false,
    invertedMatch: false,
    wholeWords: false,
}
