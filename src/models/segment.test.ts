import { Segment } from './segment';

describe('Segment', () => {
  describe('constructor', () => {
    test('should create a new segment with specified start and end points', () => {
      const segment = new Segment(1, 5);
      expect(segment.start).toBe(1);
      expect(segment.end).toBe(5);
    });
  });

  describe('isEqual', () => {
    test('should return true for equal segments', () => {
      const segment1 = new Segment(1, 5);
      const segment2 = new Segment(1, 5);
      expect(segment1.isEqual(segment2)).toBe(true);
    });

    test('should return false for unequal segments', () => {
      const segment1 = new Segment(1, 5);
      const segment2 = new Segment(2, 6);
      expect(segment1.isEqual(segment2)).toBe(false);
    });
  });

  describe('size', () => {
    test('should return the size of the interval', () => {
      const segment = new Segment(3, 8);
      expect(segment.size()).toBe(6);
    });

    test('should return 1 for a single-point interval', () => {
      const singlePointSegment = new Segment(5, 5);
      expect(singlePointSegment.size()).toBe(1);
    });

    test('should return -2 for an inverse interval', () => {
      const emptySegment = new Segment(8, 5);
      expect(emptySegment.size()).toBe(-2);
    });
  });
});
