import { Segment } from './segment';

/** Centered interval-tree node: local spans cross the midpoint, children lie to either side. */
export class Node {
  private midPoint: number;
  private segments: Array<Segment> = new Array<Segment>();
  private left: Node | null = null;
  private right: Node | null = null;

  /** Partition spans by position without splitting spans that cover the midpoint. */
  constructor(segments: Array<Segment>) {
    this.midPoint = this.getMidPoint(segments);
    const paths: Array<Array<Segment>> = [
      new Array<Segment>(),
      new Array<Segment>()
    ];

    segments.forEach((s) => {
      if (s.end < this.midPoint) paths[0].push(s);
      else if (s.start > this.midPoint) paths[1].push(s);
      else this.segments.push(s);
    });

    if (paths[0].length > 0) {
      this.left = new Node(paths[0]);
    }

    if (paths[1].length > 0) {
      this.right = new Node(paths[1]);
    }
  }

  /** Find intersecting spans, excluding all spans with exactly the query endpoints. */
  getOverlappingSegments(s: Segment): Array<Segment> {
    if (this.midPoint < s.start) {
      // Overlapping segments in the right subtree and self
      const rightChild = this.right ? this.right.getOverlappingSegments(s) : [];
      const self = this.segments.filter((n) => n.end >= s.start);

      const result = [...rightChild, ...self];
      return result.filter((n) => !s.isEqual(n));
    } else if (s.end < this.midPoint) {
      // Overlapping segments in the left subtree and self
      const leftChild = this.left ? this.left.getOverlappingSegments(s) : [];
      const self = this.segments.filter((n) => n.start <= s.end);

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

  /** Bisect the range from the earliest start to the latest end. */
  private getMidPoint(segments: Array<Segment>): number {
    const points = [-1, -1];

    segments.forEach((s) => {
      if (points[0] === -1 || s.start < points[0]) {
        points[0] = s.start;
      }

      if (points[1] === -1 || s.end > points[1]) {
        points[1] = s.end;
      }
    });

    return Math.floor((points[0] + points[1]) / 2);
  }
}
