import { Segment } from '../models';
import { Node } from './node';

describe('Node', () => {
  describe('constructor', () => {
    test('should create a new node with segments and initialize properties', () => {
      const segments = [new Segment(1, 5), new Segment(3, 8)];
      const node = new Node(segments);
      expect(node).toEqual({
        segments: [
          { start: 1, end: 5 },
          { start: 3, end: 8 }
        ],
        left: null,
        right: null,
        midPoint: 4
      });
    });
  });

  describe('getOverlappingSegments', () => {
    test('should return overlapping segments with the given segment', () => {
      const segments = [new Segment(1, 5), new Segment(3, 8)];
      const node = new Node(segments);

      const overlappingSegments = node.getOverlappingSegments(
        new Segment(4, 7)
      );
      expect(overlappingSegments).toEqual([
        new Segment(1, 5),
        new Segment(3, 8)
      ]);
    });

    test('should not include the same segment in the result', () => {
      const segments = [new Segment(1, 5), new Segment(3, 8)];
      const node = new Node(segments);

      const overlappingSegments = node.getOverlappingSegments(
        new Segment(1, 5)
      );
      expect(overlappingSegments).toEqual([new Segment(3, 8)]);
    });

    test('should handle overlapping in both subtrees', () => {
      const segments = [
        new Segment(1, 5),
        new Segment(6, 10),
        new Segment(8, 12)
      ];
      const node = new Node(segments);

      const overlappingSegments = node.getOverlappingSegments(
        new Segment(4, 9)
      );
      expect(overlappingSegments).toEqual([
        new Segment(6, 10),
        new Segment(8, 12),
        new Segment(1, 5)
      ]);
    });
  });
});
