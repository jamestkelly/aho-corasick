export class State {
  readonly next = new Map<string, State>();
  readonly keywords: string[] = [];
  output?: State;
  failure: State = this;

  add(char: string): State {
    let child = this.next.get(char);
    if (!child) this.next.set(char, (child = new State()));
    return child;
  }

  link(failure: State): void {
    this.failure = failure;
    this.output = failure.keywords.length ? failure : failure.output;
  }
}
