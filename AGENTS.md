# Working on the matcher

- Use the Node version in `.node-version` and the pnpm version in `package.json`.
  Install with `pnpm install --frozen-lockfile`; run `pnpm validate` before opening a PR.
  Validation builds the library, checks the tests and scripts, and installs the actual
  tarball into a fresh TypeScript consumer.
- `src/trie.ts` is the package entry point. When changing matching behavior, check
  `README.md` for the public contract and pin the behavior in `test/trie.test.ts`.
  Match offsets address the **original** string, even when lowercasing changes its
  length. Keep JSDoc on exported APIs and explain invariants on internal helpers.
- Write repository scripts and runnable examples in `.mts`. Node runs them directly;
  use erasable TypeScript and import `../dist/trie.js` when exercising the built library.
  Build first. For performance changes, distinguish lazy compilation from warm scans
  and check equal results before comparing timings.
- Use a Conventional Commit PR title. Publishing runs from `main`; semantic-release
  derives the version from commits (`feat:` means minor). Leave versioning and tags to CI.
