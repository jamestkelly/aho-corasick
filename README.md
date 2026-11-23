# @jimtkelly/aho-corasick

Find many literal keywords in a string in one pass. This JavaScript and TypeScript
library uses [Aho–Corasick](https://en.wikipedia.org/wiki/Aho%E2%80%93Corasick_algorithm)
to return match positions and occurrence counts with zero runtime dependencies.

```sh
npm install @jimtkelly/aho-corasick
```

```ts
import { Trie } from '@jimtkelly/aho-corasick';

const trie = new Trie(['she', 'he']);
trie.getMatches('She!');           // she [0, 2], he [1, 2]
trie.getNonMatches('She!');        // ['!']
trie.getStringOccurrences('he');   // [{ keyword: 'he', occurrences: 1 }]
trie.addKeyword('hers');           // the next search rebuilds the failure links
```

## When should I use this?

Use `String.includes` for one or two literals and regular expressions for patterns.
Use a trie when you repeatedly search documents for a dictionary of fixed terms and
need all matches, including overlaps. Build the dictionary once and reuse it:

```ts
const products = new Trie(['espresso', 'cold brew'], { wholeWords: true });
for (const review of ['Cold brew on tap', 'Espresso, espresso!']) {
  console.log(products.getStringOccurrences(review));
}
// [{ keyword: 'cold brew', occurrences: 1 }]
// [{ keyword: 'espresso', occurrences: 2 }]
```

For a reproducible comparison, run `pnpm build && node scripts/compare-search.cjs`.
Both methods return identical overlapping counts. On Node 24.21 (macOS arm64),
these were median milliseconds across nine runs of a reused, case-sensitive dictionary:

| Keywords | Text | Build trie | Scan with trie | Loop over `indexOf` |
|---:|---|---:|---:|---:|
| 4 | Repeated prose | 0.005 | 0.488 | 0.065 |
| 4 | Dense repeats | 0.003 | 0.334 | 0.207 |
| 1,024 | Repeated prose | 0.340 | 0.262 | 6.519 |
| 1,024 | Dense repeats | 0.243 | 0.404 | 0.435 |

The small dictionary favored `indexOf`; the biggest difference was scanning prose
with many absent keywords. Benchmark your own dictionary before choosing.

The supported import is the package root (CommonJS `require` also works).
`Match.start` and `Match.end` are **inclusive UTF-16 indices in the original text**:
use `text.slice(match.start, match.end + 1)`. `match.size()` is the span length;
`match.isEqual(other)` compares endpoints. Empty or whitespace-only keywords throw.

| Constructor option | Default | Behavior |
|---|---|---|
| `caseSensitive` | `false` | By default keywords and text are lowercased using JavaScript casing, with Greek sigma forms matched equivalently. `Match.keyword` is the lowercased keyword. There is no accent removal, locale-specific casing, or Unicode normalization. |
| `removeWhiteSpaces` | `false` | Trim leading and trailing whitespace from **keywords**, never from the text. |
| `wholeWords` | `false` | Require both neighbors to be absent or outside ASCII `A–Z`, `a–z`, `0–9`. An underscore or non-ASCII letter is a boundary. |
| `allowOverlap` | `true` | Emit by end position, longest suffix first. When disabled, longer original spans win, ties favor earlier emission, and accepted results are returned by start position. |

Repeated keyword insertions produce repeated matches, even for identical spans with
overlap disabled. Counts reflect the same filtered matches, in first-result order.
See the [runnable example on GitHub](https://github.com/jamestkelly/aho-corasick/blob/main/doc/example.cjs).

## Development

Use Node 24 and the pnpm version pinned in `package.json`. Run
`pnpm install --frozen-lockfile`, then `pnpm validate` to type-check the tests,
run Vitest, and test a clean TypeScript consumer install. Use `pnpm test:watch`
while editing the matcher. `pnpm bench` reports local medians for build, scan,
count, and overlap workloads. The library ships CommonJS JavaScript using ES2015
syntax; Node 24 is the development toolchain rather than a consumer requirement.

## Releases

After a squash merge to `main`, CI validates the library and semantic-release
uses conventional commits to publish npm versions and GitHub release notes.
CI then installs the exact version from npm and checks a TypeScript consumer.
Before enabling publishing, configure the npm trusted publisher for
`@jimtkelly/aho-corasick`: GitHub owner `jamestkelly`, repository `aho-corasick`,
workflow `release.yml`, no environment. The release uses OIDC, not an npm token.

## Credits and license

Based on [Aho and Corasick's algorithm](https://doi.org/10.1145/360825.360855)
and inspired by [tanishiking/aho-corasick-js](https://github.com/tanishiking/aho-corasick-js),
[robert-bor/aho-corasick](https://github.com/robert-bor/aho-corasick), and
[hankcs/aho-corasick](https://github.com/hankcs/aho-corasick).
Released under the [MIT license](LICENSE).
