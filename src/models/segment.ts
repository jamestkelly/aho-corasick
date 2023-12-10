/**
 * @description
 * Represents a closed interval (segment) in mathematics.
 * A closed interval is a set of points between two values (a and b),
 * where both endpoints are included in the interval.
 */
export class Segment {
  /**
   * @description
   * Creates a new closed interval (segment) with specified start and end points.
   *
   * @param a The starting point of the interval.
   * @param b The ending point of the interval.
   */
  constructor(
    readonly a: number,
    readonly b: number
  ) {}

  /**
   * @description
   * Checks if this interval is equal to another interval.
   *
   * @param {Segment} comparison The interval to compare with.
   * @returns {boolean} True if the intervals are equal, false otherwise.
   */
  isEqual(comparison: Segment): boolean {
    return this.a === comparison.a && this.b === comparison.b;
  }

  /**
   * @description
   * Calculates and returns the size of the interval.
   * The size of the interval is the number of points it contains.
   *
   * @returns {number} The size of the interval.
   */
  size(): number {
    return this.b - this.a + 1;
  }
}
