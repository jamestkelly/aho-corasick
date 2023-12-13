import { Tree } from './tree';
import { Segment } from './segment';
import { Node } from './node';

describe('Tree', () => {
  describe('constructor', () => {
    test('should create a new tree with the specified segments', () => {
      const segments = [new Segment(1, 3), new Segment(4, 6)];
      const tree = new Tree(segments);
      expect(tree).toBeInstanceOf(Tree);
      expect(tree['root']).toBeInstanceOf(Node);
    });
  });

  describe('removeOverlappingSegments', () => {
    test('should remove overlapping segments from the given array of segments', () => {
      const segments = [
        new Segment(1, 5),
        new Segment(2, 4),
        new Segment(6, 9),
        new Segment(8, 10),
        new Segment(12, 15)
      ];
      const tree = new Tree(segments);

      const result = tree.removeOverlappingSegments(segments);
      expect(result).toHaveLength(3);
      expect(result).toEqual([segments[0], segments[2], segments[4]]);
    });

    test('should handle empty array of segments', () => {
      const tree = new Tree([]);
      const result = tree.removeOverlappingSegments([]);
      expect(result).toEqual([]);
    });

    test('should handle array with a single segment', () => {
      const segments = [new Segment(1, 5)];
      const tree = new Tree(segments);
      const result = tree.removeOverlappingSegments(segments);
      expect(result).toEqual(segments);
    });

    test('should handle non-overlapping segments', () => {
      const segments = [
        new Segment(1, 3),
        new Segment(5, 7),
        new Segment(9, 11)
      ];
      const tree = new Tree(segments);
      const result = tree.removeOverlappingSegments(segments);
      expect(result).toEqual(segments);
    });

    test('should handle segments with equal size', () => {
      const segments = [
        new Segment(1, 4),
        new Segment(2, 5),
        new Segment(3, 6)
      ];
      const tree = new Tree(segments);
      const result = tree.removeOverlappingSegments(segments);
      expect(result).toEqual([segments[0]]);
    });
  });
});
