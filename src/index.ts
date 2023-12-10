import { defaultTrieOptions } from './config/options'
import {
  Match,
  State,
  Tree,
} from './models';
import { TrieOptions } from './interfaces';
import { isAlphanumeric } from './utilities/utils';

/**
 * Aho-Corasick implementation based on http://cr.yp.to/bib/1975/aho.pdf
 * Port of
 * robert-bor/aho-corasick https://github.com/robert-bor/aho-corasick and
 * hankcs/aho-corasick https://github.com/hankcs/aho-corasick
 */
export class Trie {
  private failureStateConstructed: boolean = false
  private readonly rootState: State = new State(0)
  private options: TrieOptions

  constructor(keywords?: string[], options?: Partial<TrieOptions>) {
    if (typeof keywords !== 'undefined' && keywords.length > 0) {
      keywords.forEach((keyword) => {
        this.addKeyword(keyword)
      })
    }
    if (options) {
      this.options = { ...defaultTrieOptions, ...options }
    } else {
      this.options = defaultTrieOptions
    }
  }

  addKeyword(keyword: string): void {
    const length = keyword.length
    if (length === 0) return
    let currentState = this.rootState
    for (let i = 0; i < length; i++) {
      const char = keyword.charAt(i)
      currentState = currentState.addState(char)
    }
    currentState.addMatch([keyword])
  }

  /**
   * Find keywords from given text.
   *
   * @param text - The text to search for keywords.
   */
  parseText(text: string): Match[] {
    this.checkForConstructedFailureStates()
    let currentState: State = this.rootState
    const collectedEmits: Match[] = []

    const length = text.length

    for (let pos = 0; pos <= length; pos++) {
      const originalChar = text.charAt(pos)
      const char = this.options.caseSensitive ? originalChar.toLowerCase() : originalChar
      currentState = this.getState(currentState, char)
      const emits = this.toEmits(pos, currentState)
      collectedEmits.push(...emits)
    }

    // Filter out partial words.
    const emits = this.options.wholeWords ? this.removePartialMatches(text, collectedEmits) : collectedEmits

    // Filter out overlaps, bigger size has larger priority.
    const filteredOverlaps = !this.options.allowOverlap ? new Tree(emits).removeOverlappingSegments(emits) : emits

    return filteredOverlaps
  }

  /**
   * Jump to the next state, using both goto and failure.
   *
   * @param currentState - Current state.
   * @param char - Accepted character.
   * @returns Jumped state.
   */
  private getState(currentState: State, char: string): State {
    let state: State = currentState
    let newCurrentState: State | null = currentState.nextState(char)
    while (newCurrentState === null) {
      state = state.failure!
      newCurrentState = state.nextState(char)
    }
    return newCurrentState!
  }

  private checkForConstructedFailureStates(): void {
    if (!this.failureStateConstructed) {
      this.constructFailureStates()
    }
  }

  private constructFailureStates(): void {
    const queue: State[] = []

    this.rootState.failure = this.rootState
    this.rootState.successes.forEach((depthOneState) => {
      depthOneState.failure = this.rootState
      queue.push(depthOneState)
    })

    while (queue.length > 0) {
      // cannot be undefined because queue.length > 0
      const currentState: State = queue.shift()!

      currentState.transitions.forEach((transition) => {
        // This can't be null
        const targetState: State = currentState.nextState(transition)!
        queue.push(targetState)
        let traceFailureState: State = currentState.failure!
        while (traceFailureState.nextState(transition) === null) {
          traceFailureState = traceFailureState.failure!
        }
        // cannot be null because traceFailure.nextState(transition) !== null here.
        const newFailureState = traceFailureState.nextState(transition)!
        targetState.failure = newFailureState
        targetState.addMatch(newFailureState.match)
      })
    }

    this.failureStateConstructed = true
  }

  private removePartialMatches(searchText: string, emits: Match[]): Match[] {
    const start = searchText.length
    return emits.filter((emit) => {
      return (
        (emit.start === 0 || !isAlphanumeric(searchText.charAt(emit.start - 1))) &&
        (emit.end + 1 == start || !isAlphanumeric(searchText.charAt(emit.end + 1)))
      )
    })
  }

  private toEmits(end: number, currentState: State): Match[] {
    const emits: string[] = currentState.match
    return emits.map((emit) => {
      return new Match(end - emit.length + 1, end, emit)
    })
  }
}

export { TrieOptions, defaultTrieOptions, Match }