import { defaultTrieOptions } from './config/options';
import { Match, State, Tree } from './models';
import { TrieOptions, WordCount } from './interfaces';
import {
  isAlphanumeric,
  isNonEmptyArray,
  isNullOrEmptyString
} from './utilities/utils';

/**
 * @class Trie
 * @classdesc Represents a Trie data structure for storing and searching keywords. This is a port
 * of the following implmentations:
 *  - [Efficient String Matching: An Aid to Bibliographic Search](http://cr.yp.to/bib/1975/aho.pdf)
 *  - [robert-bor/aho-corasick](https://github.com/robert-bor/aho-corasick)
 *  - [hankcs/aho-corasick](https://github.com/hankcs/aho-corasick)
 *  - [tanishiking/aho-corasick-js](https://github.com/tanishiking/aho-corasick-js)
 *
 * This implementation adds several additional features, including:
 *  - Extended case sensitivity & trimming of white spaces.
 */
export class Trie {
  private failureStateConstructed: boolean = false;
  private readonly root: State = new State(0);
  private options: TrieOptions;

  /**
   * @description
   * Trie constructor function.
   *
   * @param {Array<string>} [keywords] - An optional array of keywords to initialize the Trie with.
   * @param {Partial<TrieOptions>} [options] - Optional configuration options for the Trie.
   */
  constructor(keywords?: Array<string>, options?: Partial<TrieOptions>) {
    this.options = { ...defaultTrieOptions, ...options };

    if (keywords && isNonEmptyArray(keywords)) {
      this.initialiseKeywords(keywords);
    }
  }

  /**
   * @description
   * Adds a keyword to the Trie.
   *
   * @param {string} keyword - The keyword to add to the Trie.
   * @throws {Error} Throws an error if the provided keyword is null or empty.
   * @returns {void}
   */
  addKeyword(keyword: string): void {
    if (isNullOrEmptyString(keyword)) {
      throw new Error('Provided string `keyword` is a null or empty string.');
    }

    let currentState = this.root;
    const kw = this.prepareKeywordForInsertion(keyword);

    for (let i = 0; i < kw.length; i++) {
      const char = kw.charAt(i);
      currentState = currentState.addState(char);
    }

    currentState.addMatch([kw]);
  }

  /**
   * @description
   * Parses the input text for keyword matches.
   *
   * @param {string} text - The text to parse for keyword matches.
   * @returns {Array<Match>} - An array of Match objects representing keyword matches.
   */
  getMatches(text: string): Array<Match> {
    this.checkForConstructedFailureStates();
    let currentState: State = this.root;
    const matches: Array<Match> = [];

    if (isNullOrEmptyString(text)) {
      return matches;
    }

    for (let pos = 0; pos <= text.length; pos++) {
      const char = this.options.caseSensitive
        ? text.charAt(pos)
        : text.charAt(pos).toLowerCase();
      currentState = this.getState(currentState, char);
      matches.push(...this.toMatches(pos, currentState));
    }

    const filteredMatches = this.applyFilteringOptions(text, matches);
    return filteredMatches;
  }

  /**
   * @description
   * Retrieves all non-matching substrings in the input text.
   *
   * @param {string} text - The input text.
   * @returns {Array<string>} An array of non-matching substrings.
   */
  getNonMatches(text: string): Array<string> {
    this.checkForConstructedFailureStates();
    const matches: Array<Match> = this.getMatches(text);

    matches.sort((a, b) => a.start - b.start);

    const nonMatches: Array<string> = new Array<string>();
    let currentIndex = 0;

    for (const match of matches) {
      if (currentIndex < match.start) {
        nonMatches.push(text.slice(currentIndex, match.start));
      }
      currentIndex = match.end + 1;
    }

    if (currentIndex < text.length) {
      nonMatches.push(text.slice(currentIndex));
    }

    return nonMatches;
  }

  /**
   * @description
   * Retrieves an array of WordCount objects representing matched words and their total occurrences
   * in the input text.
   *
   * @param {string} text - The input text.
   * @returns {Array<WordCount>} An array of WordCount objects.
   */
  getStringOccurrences(text: string): Array<WordCount> {
    this.checkForConstructedFailureStates();
    const matches: Array<Match> = this.getMatches(text);
    const wordCountMap = new Map<string, number>();

    for (const match of matches) {
      const keyword = match.keyword;
      const count = wordCountMap.get(keyword) || 0;
      wordCountMap.set(keyword, count + 1);
    }

    const wordCounts: Array<WordCount> = Array.from(wordCountMap.entries()).map(
      ([keyword, occurrences]) => ({ keyword, occurrences })
    );

    return wordCounts;
  }

  /**
   * @description
   * Initializes the Trie with an array of keywords. These keywords are parsed respective
   * to the provided options `caseSensitive` and `removeWhiteSpaces` where strings are
   * flipped to lower case when the former is `true` and white spaces are trimmed when the
   * latter is `true`.
   *
   * @param {Array<string>} keywords - An array of keywords to add to the Trie.
   * @private
   * @returns {void}
   */
  private initialiseKeywords(keywords: Array<string>): void {
    const caseTransform = this.options.caseSensitive
      ? (x: string) => x
      : (x: string) => x.toLowerCase();

    const trimWhiteSpace = this.options.removeWhiteSpaces
      ? (x: string) => x
      : (x: string) => x.trim();

    keywords.forEach((kw) =>
      this.addKeyword(trimWhiteSpace(caseTransform(kw)))
    );
  }

  /**
   * @description
   * Prepares a keyword for insertion into the Trie based on the specified options.
   *
   * @param {string} keyword - The original keyword to prepare.
   * @private
   * @returns {string} The prepared keyword.
   */
  private prepareKeywordForInsertion(keyword: string): string {
    const transformCase = (x: string): string =>
      this.options.caseSensitive ? x : x.toLowerCase();

    const trimWhitespace = (x: string): string =>
      this.options.removeWhiteSpaces ? x.trim() : x;

    return trimWhitespace(trimWhitespace(transformCase(keyword)));
  }

  /**
   * @description
   * Applies filtering options to the list of matches.
   *
   * @param {string} text - The input text.
   * @param {Array<Match>} matches - The list of matches.
   * @returns {Array<Match>} The filtered list of matches.
   * @private
   */
  private applyFilteringOptions(
    text: string,
    matches: Array<Match>
  ): Array<Match> {
    const partialMatchesRemoved = this.options.wholeWords
      ? this.removePartialMatches(text, matches)
      : matches;

    const overlapsFiltered = !this.options.allowOverlap
      ? new Tree(partialMatchesRemoved).removeOverlappingSegments(
          partialMatchesRemoved
        )
      : partialMatchesRemoved;

    return overlapsFiltered;
  }

  /**
   * @description
   * Retrieves the next state based on the current state and a character.
   *
   * @param {State} currentState - The current state in the Trie.
   * @param {string} char - The character to transition to the next state.
   * @private
   * @returns {State} The next state in the Trie.
   */
  private getState(currentState: State, char: string): State {
    let state: State = currentState;
    let newCurrentState: State | null = currentState.nextState(char);

    while (newCurrentState === null) {
      state = state.failure!;
      newCurrentState = state.nextState(char);
    }

    return newCurrentState!;
  }

  /**
   * @description
   * Checks if failure states have been constructed and constructs them if necessary.
   *
   * @private
   * @returns {void}
   */
  private checkForConstructedFailureStates(): void {
    if (!this.failureStateConstructed) {
      this.constructFailureStates();
    }
  }

  /**
   * @description
   * Constructs failure states for each state in the Trie.
   *
   * @private
   * @returns {void}
   */
  private constructFailureStates(): void {
    const queue: State[] = [];
    this.root.failure = this.root;

    this.root.successes.forEach((depthOneState) => {
      depthOneState.failure = this.root;
      queue.push(depthOneState);
    });

    while (queue.length > 0) {
      const currentState: State = queue.shift()!;

      currentState.transitions.forEach((transition) => {
        const targetState: State = currentState.nextState(transition)!;
        queue.push(targetState);
        let traceFailureState: State = currentState.failure!;

        while (traceFailureState.nextState(transition) === null) {
          traceFailureState = traceFailureState.failure!;
        }

        const newFailureState = traceFailureState.nextState(transition)!;
        targetState.failure = newFailureState;
        targetState.addMatch(newFailureState.match);
      });
    }

    this.failureStateConstructed = true;
  }

  /**
   * @description
   * Removes partial matches from the list of emits based on the search text.
   *
   * @param {string} text - The search text.
   * @param {Match[]} matches - The list of emitted matches.
   * @private
   * @returns {Match[]} The filtered list of matches.
   */
  private removePartialMatches(text: string, matches: Match[]): Match[] {
    const start = text.length;
    return matches.filter((match) => {
      return (
        (match.start === 0 || !isAlphanumeric(text.charAt(match.start - 1))) &&
        (match.end + 1 == start || !isAlphanumeric(text.charAt(match.end + 1)))
      );
    });
  }

  /**
   * @description
   * Converts Trie matches to Match objects.
   *
   * @param {number} end - The end index of the match.
   * @param {State} state - The current state in the Trie.
   * @private
   * @returns {Match[]} The list of Match objects.
   */
  private toMatches(end: number, state: State): Match[] {
    const matches: string[] = state.match;
    return matches.map((match) => {
      return new Match(end - match.length + 1, end, match);
    });
  }
}

export { TrieOptions, defaultTrieOptions, Match };
