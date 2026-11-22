export class Segment {
  constructor(
    readonly start: number,
    readonly end: number
  ) {}

  isEqual(comparison: Segment): boolean {
    return this.start === comparison.start && this.end === comparison.end;
  }

  size(): number {
    return this.end - this.start + 1;
  }
}
