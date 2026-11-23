/** Run after `pnpm build`; installed consumers import from `@jimtkelly/aho-corasick`. */
import { Trie } from '../dist/trie.js';
const trie = new Trie(['cat', 'at'], { wholeWords: true });
console.log(trie.getMatches('cat! bobcat')); // cat [0, 2]
console.log(trie.getNonMatches('cat! bobcat')); // ['! bobcat']
console.log(trie.getStringOccurrences('CAT cat')); // cat: 2
