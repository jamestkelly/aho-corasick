import { Node } from "./interval-node";
import { Segment } from "./segment";

/** Interval index for resolving competing match spans. */
export class Tree {
  private root: Node;

  /** Index the candidate spans before selecting winners. */
  constructor(segments: Array<Segment>) {
    this.root = new Node(segments);
  }

  /** Prefer longer spans, then earlier emission; keep equal spans and return in start order. */
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
