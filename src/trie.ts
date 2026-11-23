import { defaultTrieOptions, TrieOptions } from "./options";
import { Match } from "./match";
import { Tree } from "./overlaps";
import { State } from "./state";

/** Number of accepted matches for one stored keyword. */
export interface WordCount {
  keyword: string;
  occurrences: number;
}
const wordChar = /[a-zA-Z0-9]/;

/**
 * Search text for many literal keywords in one pass. Keywords with a common prefix
 * share a path in the trie. Suffix links let the scan keep a partial match instead
 * of backing up in the text: with `she` and `hers` inserted, reading `r` after
 * `she` continues from `he` to `her`. Reuse the trie across input strings.
 */
export class Trie {
  private failureStateConstructed: boolean = false;
  private readonly root: State = new State();
  private readonly options: TrieOptions;

  /** Insert the initial dictionary; failure links are built on the first nonempty search. */
  constructor(keywords?: Array<string>, options?: Partial<TrieOptions>) {
    this.options = { ...defaultTrieOptions, ...options };

    if (Array.isArray(keywords)) {
      keywords.forEach((keyword) => this.addKeyword(keyword));
    }
  }

  /**
   * Insert a literal, retaining duplicates, and invalidate the compiled failure links.
   * @throws If the keyword is null, empty, or whitespace-only.
   */
  addKeyword(keyword: string): void {
    if (keyword == null || keyword.trim() === "") {
      throw new Error("Provided string `keyword` is a null or empty string.");
    }

    let currentState = this.root;
    const cased = this.options.caseSensitive ? keyword : keyword.toLowerCase();
    const kw = this.options.removeWhiteSpaces ? cased.trim() : cased;

    // Greek final sigma and ordinary sigma share a path; Match.keyword retains the stored spelling.
    const key = this.options.caseSensitive ? kw : kw.replace(/ς/g, "σ");
    for (let i = 0; i < key.length; i++) {
      const char = key.charAt(i);
      currentState = currentState.add(char);
    }

    currentState.keywords.push(kw);
    this.failureStateConstructed = false;
  }

  /**
   * Return inclusive UTF-16 spans in the original text. Overlaps are emitted by
   * end position, longest suffix first. With overlaps disabled, longer spans win
   * (first emitted breaks ties); identical spans survive and results are in start order.
   * Recover the original substring with `text.slice(match.start, match.end + 1)`.
   */
  getMatches(text: string): Array<Match> {
    const matches: Match[] = [];
    this.scan(text, (start, end, keyword) => matches.push(new Match(start, end, keyword)));
    return this.options.allowOverlap
      ? matches
      : new Tree(matches).removeOverlappingSegments(matches);
  }

  /** Stop at the first qualifying occurrence without allocating a match list. */
  hasMatch(text: string): boolean {
    return this.scan(text);
  }

  /** With a callback, report every qualifying span and return false at exhaustion.
   * Without one, return true immediately on the first hit (`hasMatch`).
   */
  private scan(
    text: string,
    emit?: (start: number, end: number, keyword: string) => void,
  ): boolean {
    if (!text) return false;
    if (!this.failureStateConstructed) this.constructFailureStates();
    let currentState: State = this.root;

    const input = this.options.caseSensitive ? text : text.toLowerCase().replace(/ς/g, "σ");
    // Map offsets in the lowercased input back to the original string. For "İx" → "i\u0307x",
    // the map is [0, <hole>, 1, 2]: a match ending between i and the dot must be skipped.
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
      if (!currentState.matches.length) continue;
      for (let state: State | undefined = currentState; state; state = state.output) {
        for (const keyword of state.matches) {
          const from = pos - keyword.length + 1;
          const start = boundaries ? boundaries[from] : from;
          const after = boundaries ? boundaries[pos + 1] : pos + 1;
          if (start === undefined || after === undefined) continue;
          if (
            !this.options.wholeWords ||
            (!wordChar.test(text.charAt(start - 1)) && !wordChar.test(text.charAt(after)))
          ) {
            if (!emit) return true;
            emit(start, after - 1, keyword);
          }
        }
      }
    }
    return false;
  }

  /** Return the nonempty gaps between accepted spans, preserving original text and order. */
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

  /** Count accepted matches by stored keyword in first-result order, omitting misses. */
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
      ([keyword, occurrences]) => ({ keyword, occurrences }),
    );

    return wordCounts;
  }

  /** Follow suffix links until a transition exists, falling back to the root on a miss. */
  private getState(currentState: State, char: string): State {
    let next = currentState.next.get(char);
    while (!next && currentState !== this.root) {
      currentState = currentState.failure;
      next = currentState.next.get(char);
    }
    return next ?? this.root;
  }

  /** Link states breadth-first so every shorter suffix has its outputs ready first. */
  private constructFailureStates(): void {
    const queue = Array.from(this.root.next.values());
    for (const child of queue) child.link(this.root);
    for (let head = 0; head < queue.length; head++) {
      const state = queue[head];
      state.next.forEach((child, char) => {
        child.link(this.getState(state.failure, char));
        queue.push(child);
      });
    }
    this.failureStateConstructed = true;
  }
}

export { TrieOptions, defaultTrieOptions, Match };
