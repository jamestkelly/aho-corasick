import { Segment, Node } from '../models';

/**
 * Test suite for the Node class.
 */
describe('Node', () => {
  // Test suite for the getOverlappingSegments method
  describe('getOverlappingSegments', () => {
    // Sample segments for testing
    const segments = [
      new Segment(0, 2),
      new Segment(1, 3),
      new Segment(2, 4),
      new Segment(3, 5),
      new Segment(4, 6),
      new Segment(5, 7)
    ];

    // Create a Node instance with the sample segments
    const node = new Node(segments);

    // Test case for the left path
    test('is left path correct', () => {
      // Get overlapping segments for a specific segment on the left path
      const overlaps = node
        .getOverlappingSegments(new Segment(1, 2))
        .sort((n, m) => n.a - m.a);

      // Assertions
      expect(overlaps).toHaveLength(3);
      expect(overlaps[0]).toEqual(new Segment(0, 2));
      expect(overlaps[1]).toEqual(new Segment(1, 3));
      expect(overlaps[2]).toEqual(new Segment(2, 4));
    });

    // Test case for the right path
    test('is right path correct', () => {
      // Get overlapping segments for a specific segment on the right path
      const overlaps = node
        .getOverlappingSegments(new Segment(5, 6))
        .sort((n, m) => n.a - m.a);

      // Assertions
      expect(overlaps).toHaveLength(3);
      expect(overlaps[0]).toEqual(new Segment(3, 5));
      expect(overlaps[1]).toEqual(new Segment(4, 6));
      expect(overlaps[2]).toEqual(new Segment(5, 7));
    });

    // Test case for overlapping segments in general
    test('are segments correct', () => {
      // Get overlapping segments for a specific segment
      const overlaps = node
        .getOverlappingSegments(new Segment(1, 3))
        .sort((n, m) => n.a - m.a);

      // Assertions
      expect(overlaps).toHaveLength(3);
      expect(overlaps[0]).toEqual(new Segment(0, 2));
      expect(overlaps[1]).toEqual(new Segment(2, 4));
      expect(overlaps[2]).toEqual(new Segment(3, 5));
    });

    // Test case to ensure the result does not contain the original segment (self-reference)
    test('should not contain self (self-reference)', () => {
      // Get overlapping segments for a specific segment (self-reference)
      const overlaps = node
        .getOverlappingSegments(new Segment(5, 7))
        .sort((n, m) => n.a - m.a);

      // Assertions
      expect(overlaps).toHaveLength(2);
      expect(overlaps[0]).toEqual(new Segment(3, 5));
      expect(overlaps[1]).toEqual(new Segment(4, 6));
    });
  });
});
