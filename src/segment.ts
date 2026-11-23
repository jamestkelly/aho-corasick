/** A span whose endpoints are inclusive UTF-16 indices in the source text. */
export class Segment {
  constructor(
    readonly start: number,
    readonly end: number
  ) {}

  /** Compare endpoints only; keyword identity is irrelevant. */
  isEqual(comparison: Segment): boolean {
    return this.start === comparison.start && this.end === comparison.end;
  }

  /** Length of the inclusive span in UTF-16 code units. */
  size(): number {
    return this.end - this.start + 1;
  }
}
