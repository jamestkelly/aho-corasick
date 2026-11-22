import { Node, Segment } from '../models';

/**
 * @class Tree
 * @classdesc Represents a tree structure for managing segments and removing overlapping segments.
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
    const removed = new Set<Segment>();
    const sortedSegments = segments.slice().sort((a, b) => b.size() - a.size());

    for (const segment of sortedSegments) {
      if (!removed.has(segment)) {
        for (const overlap of this.root.getOverlappingSegments(segment)) {
          removed.add(overlap);
        }
      }
    }

    return segments
      .slice()
      .sort((a, b) => a.start - b.start)
      .filter((s) => !removed.has(s));
  }
}
