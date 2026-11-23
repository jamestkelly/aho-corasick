import { Segment } from "./segment";

/** A dictionary hit with the stored keyword and its span in the original text. */
export class Match extends Segment {
  /** The stored keyword may differ in case or length from the matched substring. */
  constructor(
    readonly start: number,
    readonly end: number,
    readonly keyword: string,
  ) {
    super(start, end);
  }
}
