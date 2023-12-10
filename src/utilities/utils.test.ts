import { isNonEmptyArray } from './utils';

/**
 * Test suite for the Utils functions.
 */
describe('utils', () => {
  // Test for valid arrays
  describe('isNonEmptyArray', () => {
    // Test case for valid array (populated)
    test('with valid arrays', () => {
      const arrayA = new Array<string>('Hello', 'World');

      expect(isNonEmptyArray(arrayA)).toBeTruthy();
    });

    // Test case for initialised but empty array
    test('with empty array', () => {
      const arrayA = new Array<string>();

      expect(isNonEmptyArray(arrayA)).toBeFalsy();
    });

    // Test case for uninitialised array
    test('with uninitialised array', () => {
      let arrayA: Array<string> | undefined;

      expect(isNonEmptyArray(arrayA)).toBeFalsy();
    });
  });
});
