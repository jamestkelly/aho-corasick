// Copying every matching suffix into every prefix takes quadratic space for a, aa, aaa, …
// Group short lists so the scan need not follow a separate link for every keyword.
const maxOutputGroup = 32;

/** A dictionary prefix with transitions, a fallback suffix, and grouped keyword outputs. */
export class State {
  readonly next = new Map<string, State>();
  /** Only keywords ending at this prefix; inherited matches never go here. */
  readonly keywords: string[] = [];
  /** First group to emit here, including any suffixes shared or copied by link(). */
  matches = this.keywords;
  /** Next group of shorter matches ending at the same text position. */
  output?: State;
  /** Longest proper suffix that is also a trie prefix; the root falls back to itself. */
  failure: State = this;

  /** Reuse or create the child reached by one UTF-16 code unit. */
  add(char: string): State {
    let child = this.next.get(char);
    if (!child) this.next.set(char, (child = new State()));
    return child;
  }

  /** Rebuild suffix outputs from local keywords, sharing or merging small groups. */
  link(failure: State): void {
    this.failure = failure;
    this.matches = this.keywords;
    this.output = failure.matches.length ? failure : failure.output;
    if (!this.output) return;
    if (!this.keywords.length) {
      this.matches = this.output.matches;
      this.output = this.output.output;
    } else if (this.keywords.length + this.output.matches.length <= maxOutputGroup) {
      this.matches = this.keywords.concat(this.output.matches);
      this.output = this.output.output;
    }
  }
}
