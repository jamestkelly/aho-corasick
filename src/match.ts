import { Segment } from './segment';

export class Match extends Segment {
  constructor(
    readonly start: number,
    readonly end: number,
    readonly keyword: string
  ) {
    super(start, end);
  }
}
