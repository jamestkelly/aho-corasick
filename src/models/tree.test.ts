import { Segment } from './segment';
import { Tree } from './tree';

/**
 * Test suite for the SegmentTree class.
 */
describe('SegmentTree', () => {

  // Test suite for the removeOverlappingSegments method
  describe('removeOverlappingSegments', () => {

    // Test case to ensure all overlapping segments are removed
    test('are all overlapping segments removed', () => {
      // Sample segments for testing
      const segments = [
        new Segment(0, 2),
        new Segment(4, 5),
        new Segment(2, 10),
        new Segment(6, 13),
        new Segment(9, 15),
        new Segment(12, 16)
      ];

      // Create a SegmentTree instance with the sample segments
      const intervalTree = new Tree(segments);

      // Remove overlapping segments from the tree
      const filtered = intervalTree.removeOverlappingSegments(segments);

      // Assertions
      expect(filtered).toHaveLength(2);
      expect(filtered[0]).toEqual(new Segment(2, 10));
      expect(filtered[1]).toEqual(new Segment(12, 16));
    });
  });
});
