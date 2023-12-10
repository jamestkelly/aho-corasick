/**
 * @description
 * Represents a state in a finite state machine. A `State` has the following functions:
 *  - `success`: Successfully transferred to another state.
 *  - `failure`: If it is not possible to jump along the string, jump to a shallower node.
 *  - `match`: Where a pattern string has been matched relative to input.
 *
 * The root node is slightly different. The root node does not have a failure function. 
 * Its _failure_ refers to moving to the next state according to the string path.
 * Other nodes do have `failure` states.
 */
export class State {
  private _fail: State | null = null;
  private readonly _depth: number;
  private readonly _match: string[] = [];
  private readonly _success: Map<string, State> = new Map();

  /**
   * @description
   * Creates a new State with the specified depth.
   * 
   * @param {number} d - The depth of the state in the state machine hierarchy.
   */
  constructor(d: number) {
    this._depth = d;
  }

  /**
   * @description
   * Gets the failure state associated with this state.
   */
  get failure(): State | null {
    return this._fail;
  }

  /**
   * @description
   * Sets the failure state associated with this state.
   * @param {State | null} s - The failure state to be set.
   */
  set failure(s: State | null) {
    this._fail = s;
  }

  /**
   * @description
   * Gets the depth of the state in the state machine hierarchy.
   */
  get depth(): number {
    return this._depth;
  }

  /**
   * @description
   * Gets an array of strings representing keywords associated with this state.
   */
  get match(): string[] {
    return this._match;
  }

  /**
   * @description
   * Gets an array of next states reachable from this state.
   */
  get successes(): State[] {
    return Array.from(this._success.values());
  }

  /**
   * @description
   * Gets an array of transition characters associated with next states.
   */
  get transitions(): string[] {
    return Array.from(this._success.keys());
  }

  /**
   * @description
   * Adds keywords to the list of strings representing keywords associated with this state.
   *
   * @param {string[]} keywords - An array of strings representing keywords to be added.
   */
  addMatch(keywords: string[]): void {
    this._match.push(...keywords);
  }

  /**
   * @description
   * Gets the next state associated with the specified character.
   * 
   * @param {string} char - The transition character.
   * @param {boolean} ignoreRoot - If true, ignore the root state when transitioning.
   * @returns {State | null} The next state, or null if no next state is found.
   */
  nextState(char: string, ignoreRoot: boolean = false): State | null {
    const nextState = this._success.get(char);
    return nextState !== undefined ? nextState : (!ignoreRoot && this.root) || null;
  }

  /**
   * @description
   * Adds a new state for the specified character and returns the added state.
   * 
   * @param {string} char - The transition character.
   * @returns {State} The added state.
   */
  addState(char: string): State {
    const next = this.nextState(char, true) ?? new State(this.depth + 1);
    this._success.set(char, next);
    return next;
  }
  
  /**
   * @description
   * Gets the root state if the depth is 0, otherwise returns null.
   */
  get root(): State | null {
    return this._depth === 0 ? this : null;
  }
}
