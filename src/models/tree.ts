import { Node } from './node';
import { Segment } from './segment';

/**
 * @description
 * Represents a tree structure for managing segments and removing overlapping segments.
 */
export class Tree {
  private root: Node;

  /**
   * @description
   * Creates a new tree with the specified segments.
   *
   * @param {Array<Segment>} segments An array of segments to initialize the tree.
   */
  constructor(segments: Array<Segment>) {
    this.root = new Node(segments);
  }

  /**
   * @description
   * Removes overlapping segments from the given array of segments.
   *
   * @param {Array<T>} segments An array of segments to remove overlaps from.
   * @returns {Array<T>} An array of segments without overlapping segments.
   */
  removeOverlappingSegments<T extends Segment>(segments: Array<T>): Array<T> {
    const removed: Array<Segment> = new Array<Segment>();
    const sortedSegments = segments.slice().sort((a, b) => b.size() - a.size());

    for (const segment of sortedSegments) {
      if (!this.hasSegment(removed, segment)) {
        removed.push(...this.root.getOverlappingSegments(segment).filter((o) => !this.hasSegment(removed, o)));
      }
    }

    return segments
      .slice()
      .sort((a, b) => a.a - b.a)
      .filter((s) => !this.hasSegment(removed, s));
  }

  /**
   * @description
   * Checks if a segment is present in the array of segments.
   *
   * @param {Array<Segment>} segments An array of segments to check against.
   * @param {Segment} s The segment to check for.
   * @returns {boolean} True if the segment is present, false otherwise.
   */
  private hasSegment(segments: Array<Segment>, s: Segment): boolean {
    return segments.some((n) => n.isEqual(s));
  }
}