import { isAlphanumeric, isNonEmptyArray } from './utils';

/**
 * Test suite for the Utils functions.
 */
describe('utils', () => {
  // Test for valid arrays with `isNonEmptyArray`
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

  // Test for alphanumeric strings with `isAlphanumeric`
  describe('isAlphanumeric', () => {
    // Test case for valid strings
    test('with valida alphanumeric strings', () => {
      expect(isAlphanumeric('hello')).toBeTruthy();
      expect(isAlphanumeric('world')).toBeTruthy();
      expect(isAlphanumeric('123456')).toBeTruthy();
      expect(isAlphanumeric('abcdef')).toBeTruthy();
      expect(isAlphanumeric('ABCDEF')).toBeTruthy();
      expect(isAlphanumeric('h3ll0')).toBeTruthy();
      expect(isAlphanumeric('w0r1d')).toBeTruthy();
    });

    // Test case for invalid strings
    test('with invalid alphanumeric string', () => {
      expect(isAlphanumeric('!!')).toBeFalsy();
      expect(isAlphanumeric('word1 word2')).toBeFalsy();
      expect(isAlphanumeric('$$$$')).toBeFalsy();
      expect(isAlphanumeric('')).toBeFalsy();
    });
  });
});
