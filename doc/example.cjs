// Run from a checkout after `pnpm build`. In an installed project use
// require('@jimtkelly/aho-corasick') instead.
const { Trie } = require('..');
const trie = new Trie(['cat', 'at'], { wholeWords: true });
console.log(trie.getMatches('cat! bobcat')); // cat [0, 2]
console.log(trie.getNonMatches('cat! bobcat')); // ['! bobcat']
console.log(trie.getStringOccurrences('CAT cat')); // cat: 2
