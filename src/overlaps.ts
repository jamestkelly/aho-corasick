import { Node } from './interval-node';
import { Segment } from './segment';

export class Tree {
  private root: Node;

  constructor(segments: Array<Segment>) {
    this.root = new Node(segments);
  }

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
