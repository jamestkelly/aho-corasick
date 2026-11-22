# @jimtkelly/aho-corasick

Search text for many keywords in one pass with an [Aho–Corasick automaton](https://en.wikipedia.org/wiki/Aho%E2%80%93Corasick_algorithm). The package includes TypeScript declarations and has no runtime dependencies.

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
See the [runnable example](doc/example.cjs).

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
