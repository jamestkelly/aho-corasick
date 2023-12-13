import { Segment } from './segment';

/**
 * @class Match
 * @classdesc A match result for a given string corresponding to a segment within a `Trie`.
 * @extends Segment
 */
export class Match extends Segment {
  constructor(
    readonly start: number,
    readonly end: number,
    readonly keyword: string
  ) {
    super(start, end);
  }
}
