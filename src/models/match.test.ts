import { Match } from './match';

/**
 * Test suite for the Segment class.
 */
describe('Match', () => {
  // Test suite for the isEqual method
  describe('is equal to', () => {
    // Test case for equality with itself
    test('itself', () => {
      // Create a Segment instance
      const m = new Match(0, 1, 'test');

      // Assertion: The match should be equal to itself
      expect(m.isEqual(m)).toBeTruthy();
    });

    // Test case for equality with an equivalent match
    test('an equivalent match', () => {
      // Create two equivalent Segment instances
      const n = new Match(0, 1, 'test');
      const m = new Match(0, 1, 'test');

      // Assertion: The two segments should be equal
      expect(n.isEqual(m)).toBeTruthy();
    });
  });

  // Test suite for the isEqual method
  describe('is not equal to', () => {
    // Test case for inequality with a different match
    test('a different match', () => {
      // Create two different Segment instances
      const n = new Match(2, 3, 'test2');
      const m = new Match(0, 1, 'test');

      // Assertion: The two segments should not be equal
      expect(n.isEqual(m)).toBeFalsy();
    });
  });
});
