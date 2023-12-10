import { Direction } from '../interfaces/interface';
import { Segment } from './segment';

/**
 * @description
 * Represents a binary search tree node for managing segments.
 */
export class Node {
  private midPoint: number;
  private segments: Array<Segment> = new Array<Segment>();
  private left: Node | null = null;
  private right: Node | null = null;

  /**
   * @description
   * Constructs a Node with the given segments and initializes its properties.
   *
   * @param {Array<Segment>} segments The segments to be managed by the node.
   */
  constructor(segments: Array<Segment>) {
    this.midPoint = this.getMidPoint(segments);
    const paths: Array<Array<Segment>> = [
      new Array<Segment>(),
      new Array<Segment>()
    ];

    segments.forEach((s) => {
      if (s.b < this.midPoint) paths[0].push(s);
      else if (s.a > this.midPoint) paths[1].push(s);
      else this.segments.push(s);
    });

    if (paths[0].length > 0) {
      this.left = new Node(paths[0]);
    }

    if (paths[1].length > 0) {
      this.right = new Node(paths[1]);
    }
  }

  /**
   * @description
   * Gets overlapping segments with the given segment.
   *
   * @param {Segment} s The segment to check for overlapping segments.
   * @returns {Array<Segment>} An array of overlapping segments.
   */
  getOverlappingSegments(s: Segment): Array<Segment> {
    if (this.midPoint < s.a) {
      // Overlapping segments in the right subtree and self
      const rightChild = this.right ? this.right.getOverlappingSegments(s) : [];
      const self = this.getDirectionalOverlappingSegments(s, Direction.RIGHT);

      const result = [...rightChild, ...self];
      return result.filter((n) => !s.isEqual(n));
    } else if (s.b < this.midPoint) {
      // Overlapping segments in the left subtree and self
      const leftChild = this.left ? this.left.getOverlappingSegments(s) : [];
      const self = this.getDirectionalOverlappingSegments(s, Direction.LEFT);

      const result = [...leftChild, ...self];
      return result.filter((n) => !s.isEqual(n));
    } else {
      // Overlapping segments in both subtrees and self
      const rightChild = this.right ? this.right.getOverlappingSegments(s) : [];
      const leftChild = this.left ? this.left.getOverlappingSegments(s) : [];

      const result = [...this.segments, ...rightChild, ...leftChild];
      return result.filter((n) => !s.isEqual(n));
    }
  }

  /**
   * @description
   * Gets overlapping segments in a specific direction relative to the given segment.
   *
   * @param {Segment} s The segment to check for overlapping segments.
   * @param {Direction} dir The direction (LEFT or RIGHT) to search for overlapping segments.
   * @returns {Array<Segment>} An array of overlapping segments in the specified direction.
   */
  private getDirectionalOverlappingSegments(
    s: Segment,
    dir: Direction
  ): Array<Segment> {
    return this.segments.filter((n) => {
      switch (dir) {
        case Direction.LEFT:
          return n.a <= s.b;
        case Direction.RIGHT:
          return n.b >= s.a;
      }
    });
  }

  /**
   * @description
   * Calculates the midpoint of the given segments.
   *
   * @param {Array<Segment>} segments The segments to calculate the midpoint from.
   * @returns {number} The midpoint value.
   */
  private getMidPoint(segments: Array<Segment>): number {
    const points = [-1, -1];

    segments.forEach((s) => {
      if (points[0] === -1 || s.a < points[0]) {
        points[0] = s.a;
      }

      if (points[1] === -1 || s.b > points[1]) {
        points[1] = s.b;
      }
    });

    return Math.floor((points[0] + points[1]) / 2);
  }
}
