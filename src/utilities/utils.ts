/**
 * @description
 * Verifies that an array is neither uninitialised nor empty.
 * 
 * @param {any} arr The object to verify if it is a non-empty array.
 * @returns {boolean} Whether the array is initialised and non-empty.
 */
export function isNonEmptyArray(arr: any): boolean {
  return Array.isArray(arr) && arr.length > 0;
}

