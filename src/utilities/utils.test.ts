import {
  isAlphanumeric,
  isNonEmptyArray,
  isEmptyArray,
  isNullOrEmptyString,
  nonNullOrEmptyString
} from './utils';

describe('utils', () => {
  describe('isNonEmptyArray', () => {
    test('with valid arrays', () => {
      const arrayA = new Array<string>('Hello', 'World');

      expect(isNonEmptyArray(arrayA)).toBeTruthy();
    });

    test('with empty array', () => {
      const arrayA = new Array<string>();

      expect(isNonEmptyArray(arrayA)).toBeFalsy();
    });

    test('with uninitialised array', () => {
      let arrayA: Array<string> | undefined;

      expect(isNonEmptyArray(arrayA)).toBeFalsy();
    });
  });

  describe('isEmptyArray', () => {
    test('with valid arrays', () => {
      const arrayA = new Array<string>('Hello', 'World');

      expect(isEmptyArray(arrayA)).toBeFalsy();
    });

    test('with empty array', () => {
      const arrayA = new Array<string>();

      expect(isEmptyArray(arrayA)).toBeTruthy();
    });

    test('with uninitialised array', () => {
      let arrayA: Array<string> | undefined;

      expect(isEmptyArray(arrayA)).toBeTruthy();
    });
  });

  describe('isAlphanumeric', () => {
    test('with valida alphanumeric strings', () => {
      expect(isAlphanumeric('hello')).toBeTruthy();
      expect(isAlphanumeric('world')).toBeTruthy();
      expect(isAlphanumeric('123456')).toBeTruthy();
      expect(isAlphanumeric('abcdef')).toBeTruthy();
      expect(isAlphanumeric('ABCDEF')).toBeTruthy();
      expect(isAlphanumeric('h3ll0')).toBeTruthy();
      expect(isAlphanumeric('w0r1d')).toBeTruthy();
    });

    test('with invalid alphanumeric string', () => {
      expect(isAlphanumeric('!!')).toBeFalsy();
      expect(isAlphanumeric('word1 word2')).toBeFalsy();
      expect(isAlphanumeric('$$$$')).toBeFalsy();
      expect(isAlphanumeric('')).toBeFalsy();
    });
  });

  describe('isNullOrEmptyString', () => {
    test('with empty strings', () => {
      expect(isNullOrEmptyString('')).toBeTruthy();
      expect(isNullOrEmptyString('        ')).toBeTruthy();
    });

    test('with non-empty strings', () => {
      expect(isNullOrEmptyString('hello world')).toBeFalsy();
    });
  });

  describe('isNullOrEmptyString', () => {
    test('with empty strings', () => {
      expect(nonNullOrEmptyString('')).toBeFalsy();
      expect(nonNullOrEmptyString('        ')).toBeFalsy();
    });

    test('with non-empty strings', () => {
      expect(nonNullOrEmptyString('hello world')).toBeTruthy();
    });
  });
});
