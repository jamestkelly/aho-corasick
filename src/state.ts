// Bound inherited keyword copies while amortizing pointer hops during enumeration.
const maxOutputGroup = 32;

/** A dictionary prefix with transitions, a fallback suffix, and grouped keyword outputs. */
export class State {
  readonly next = new Map<string, State>();
  readonly keywords: string[] = [];
  matches = this.keywords;
  output?: State;
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
    } else if (
      this.keywords.length + this.output.matches.length <=
      maxOutputGroup
    ) {
      this.matches = this.keywords.concat(this.output.matches);
      this.output = this.output.output;
    }
  }
}
