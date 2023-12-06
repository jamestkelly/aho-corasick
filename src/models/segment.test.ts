import { Segment } from './segment';

/**
 * Unit tests to verify the basic functionality of the `Segment` objects.
 */
describe('Segment', () => {

  // Test suite for the isEqual method
  describe('is equal to', () => {

    // Test case for equality with itself
    test('itself', () => {
      // Create a Segment instance
      const n = new Segment(0, 1);

      // Assertion: The segment should be equal to itself
      expect(n.isEqual(n)).toBeTruthy();
    });

    // Test case for equality with an equivalent segment
    test('an equivalent segment', () => {
      // Create two equivalent Segment instances
      const n = new Segment(0, 1);
      const m = new Segment(0, 1);

      // Assertion: The two segments should be equal
      expect(n.isEqual(m)).toBeTruthy();
    });
  });

  // Test suite for the isEqual method
  describe('is not equal to', () => {

    // Test case for inequality with a different segment
    test('a different segment', () => {
      // Create two different Segment instances
      const n = new Segment(0, 1);
      const m = new Segment(0, 2);

      // Assertion: The two segments should not be equal
      expect(n.isEqual(m)).toBeFalsy();
    });
  });

  // Test suite for the size method
  describe('is of size', () => {

    // Test case for the size method
    test('equal to (b - a + 1)', () => {
      // Create a Segment instance
      const n = new Segment(0, 2);

      // Assertion: The size of the segment should be equal to (b - a + 1)
      expect(n.size()).toBe(3);
    });
  });
});
