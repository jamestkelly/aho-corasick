import { Trie } from '../../src/trie';

// Example 1: addKeyword
const trie1 = new Trie();
trie1.addKeyword('apple');
trie1.addKeyword('banana');

// Example 2: getMatches
const trie2 = new Trie(['apple', 'banana']);
const matches2 = trie2.getMatches('apple banana');
console.log('Example 2:', matches2);
// Output: [{ start: 0, end: 4, keyword: 'apple' }, { start: 6, end: 11, keyword: 'banana' }]

// Example 3: getNonMatches
const trie3 = new Trie(['cat', 'dog']);
const nonMatches3 = trie3.getNonMatches('The cat and the dog');
console.log('Example 3:', nonMatches3);
// Output: ['The ', ' and the ']

// Example 4: getStringOccurrences
const trie4 = new Trie(['apple', 'banana']);
const occurrences4 = trie4.getStringOccurrences('apple banana apple');
console.log('Example 4:', occurrences4);
// Output: [{ keyword: 'apple', occurrences: 2 }, { keyword: 'banana', occurrences: 1 }]

// Additional Examples:

// Example 5: Case-insensitive matching
const trie5 = new Trie(['apple'], { caseSensitive: false });
const matches5 = trie5.getMatches('Apple');
console.log('Example 5:', matches5);
// Output: [{ start: 0, end: 4, keyword: 'apple' }]

// Example 6: Removing white spaces
const trie6 = new Trie(['apple'], { removeWhiteSpaces: true });
const matches6 = trie6.getMatches('  apple  ');
console.log('Example 6:', matches6);
// Output: [{ start: 2, end: 6, keyword: 'apple' }]

// Example 7: Whole words option
const trie7 = new Trie(['apple']);
const matches7 = trie7.getMatches('pineapple');
console.log('Example 7:', matches7);
// Output: [{ start: 4, end: 8, keyword: 'apple' }]

// Example 8: Overlapping matches option
const trie8 = new Trie(['ab', 'cba', 'ababc']);
const matches8 = trie8.getMatches('ababcbab');
console.log('Example 8:', matches8);
// Output: 5 matches based on overlapping segments

// Example 9: Custom options for getStringOccurrences
const trie9 = new Trie(['apple', 'banana'], { wholeWords: true });
const occurrences9 = trie9.getStringOccurrences('pineapple apple');
console.log('Example 9:', occurrences9);
// Output: [{ keyword: 'apple', occurrences: 1 }]
