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
      keywords.forEach((keyword) => this.addKeyword(keyword));
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
    const cased = this.options.caseSensitive ? keyword : keyword.toLowerCase();
    const kw = this.options.removeWhiteSpaces ? cased.trim() : cased;

    const key = this.options.caseSensitive ? kw : kw.replace(/ς/g, 'σ');
    for (let i = 0; i < key.length; i++) {
      const char = key.charAt(i);
      currentState = currentState.addState(char);
    }

    currentState.addMatch([kw]);
    this.failureStateConstructed = false;
  }

  /**
   * @description
   * Parses the input text for keyword matches.
   *
   * @param {string} text - The text to parse for keyword matches.
   * @returns {Array<Match>} - An array of Match objects representing keyword matches.
   */
  getMatches(text: string): Array<Match> {
    const matches: Match[] = [];
    this.scan(text, (start, end, keyword) =>
      matches.push(new Match(start, end, keyword))
    );
    return this.options.allowOverlap
      ? matches
      : new Tree(matches).removeOverlappingSegments(matches);
  }

  private scan(
    text: string,
    emit: (start: number, end: number, keyword: string) => void
  ): void {
    if (isNullOrEmptyString(text)) return;
    this.checkForConstructedFailureStates();
    let currentState: State = this.root;

    const input = this.options.caseSensitive
      ? text
      : text.toLowerCase().replace(/ς/g, 'σ');
    // A lowercase expansion (e.g. İ → i̇) has no original boundary inside it.
    let boundaries: number[] | undefined;
    if (input.length !== text.length) {
      boundaries = [0];
      let folded = 0;
      for (let i = 0; i < text.length;) {
        const point = String.fromCodePoint(text.codePointAt(i)!);
        const width = point.toLowerCase().length;
        if (point.length === 2 && width === 2) boundaries[folded + 1] = i + 1;
        folded += width;
        i += point.length;
        boundaries[folded] = i;
      }
    }
    for (let pos = 0; pos < input.length; pos++) {
      currentState = this.getState(currentState, input.charAt(pos));
      for (const keyword of currentState.match) {
        const from = pos - keyword.length + 1;
        const start = boundaries ? boundaries[from] : from;
        const after = boundaries ? boundaries[pos + 1] : pos + 1;
        if (start === undefined || after === undefined) continue;
        if (
          !this.options.wholeWords ||
          (!isAlphanumeric(text.charAt(start - 1)) &&
            !isAlphanumeric(text.charAt(after)))
        ) {
          emit(start, after - 1, keyword);
        }
      }
    }
  }

  /**
   * @description
   * Retrieves all non-matching substrings in the input text.
   *
   * @param {string} text - The input text.
   * @returns {Array<string>} An array of non-matching substrings.
   */
  getNonMatches(text: string): Array<string> {
    const matches: Array<Match> = this.getMatches(text);

    matches.sort((a, b) => a.start - b.start);

    const nonMatches: Array<string> = new Array<string>();
    let currentIndex = 0;

    for (const match of matches) {
      if (currentIndex < match.start) {
        nonMatches.push(text.slice(currentIndex, match.start));
      }
      currentIndex = Math.max(currentIndex, match.end + 1);
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
    const wordCountMap = new Map<string, number>();
    const countKeyword = (keyword: string) => {
      const count = wordCountMap.get(keyword) || 0;
      wordCountMap.set(keyword, count + 1);
    };
    if (this.options.allowOverlap) {
      this.scan(text, (_, __, keyword) => countKeyword(keyword));
    } else {
      for (const match of this.getMatches(text)) countKeyword(match.keyword);
    }

    const wordCounts: Array<WordCount> = Array.from(wordCountMap.entries()).map(
      ([keyword, occurrences]) => ({ keyword, occurrences })
    );

    return wordCounts;
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

    for (let head = 0; head < queue.length; head++) {
      const currentState = queue[head];

      currentState.transitions.forEach((transition) => {
        const targetState: State = currentState.nextState(transition)!;
        queue.push(targetState);
        let traceFailureState: State = currentState.failure!;

        while (traceFailureState.nextState(transition) === null) {
          traceFailureState = traceFailureState.failure!;
        }

        const newFailureState = traceFailureState.nextState(transition)!;
        targetState.failure = newFailureState;
      });
    }

    this.failureStateConstructed = true;
  }
}

export { TrieOptions, defaultTrieOptions, Match };
