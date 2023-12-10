import { Segment } from './segment';

/**
 * @description 
 * A match result for a given string corresponding to a segment within a `Trie`.
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
