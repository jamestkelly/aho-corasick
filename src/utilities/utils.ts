/**
 * @description
 * Verifies that an array is neither uninitialised nor empty.
 *
 * @param {any} arr The object to verify if it is a non-empty array.
 * @returns {boolean} Whether the array is initialised and non-empty.
 */
export function isNonEmptyArray(arr: any): boolean {
  return typeof arr !== 'undefined' && Array.isArray(arr) && arr.length > 0;
}

/**
 * @description
 * Verifies that an array is empty or undefined.
 *
 * @param {any} arr The object to verify if it is a non-empty array.
 * @returns {boolean} Whether the array is undefined and empty.
 */
export function isEmptyArray(arr: any): boolean {
  return !isNonEmptyArray(arr);
}

/**
 * @description
 * Checks if a given string contains only alphanumeric characters.
 *
 * Alphanumeric characters include uppercase and lowercase letters (A-Z, a-z)
 * and numeric digits (0-9).
 *
 * @param {string} str - The input string to be checked.
 * @returns {boolean} Returns true if the string is alphanumeric, false otherwise.
 *
 * @example
 * isAlphaNumeric("abc123"); // true
 * isAlphaNumeric("hello_world"); // false (contains underscore)
 * isAlphaNumeric("123$%^"); // false (contains special characters)
 */
export function isAlphanumeric(str: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(str);
}

/**
 * @description
 * Checks if a string is null, undefined, or empty (contains only whitespace).
 *
 * @param {string} str - The string to be checked.
 * @returns {boolean} - Returns true if the string is null, undefined, or empty; otherwise, returns false.
 */
export function isNullOrEmptyString(str: string): boolean {
  return str == null || str.trim() == '';
}

/**
 * @description
 * Checks if a string is not null, undefined, or empty (contains only whitespace).
 *
 * @param {string} str - The string to be checked.
 * @returns {boolean} - Returns true if the string is not null, undefined, or empty; otherwise, returns false.
 */
export function nonNullOrEmptyString(str: string): boolean {
  return !isNullOrEmptyString(str);
}
