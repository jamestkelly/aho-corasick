import { defaultTrieOptions, TrieOptions } from './options';
import { Match } from './match';
import { Tree } from './overlaps';
import { State } from './state';

export interface WordCount {
  keyword: string;
  occurrences: number;
}
const wordChar = /[a-zA-Z0-9]/;

export class Trie {
  private failureStateConstructed: boolean = false;
  private readonly root: State = new State();
  private readonly options: TrieOptions;

  constructor(keywords?: Array<string>, options?: Partial<TrieOptions>) {
    this.options = { ...defaultTrieOptions, ...options };

    if (Array.isArray(keywords)) {
      keywords.forEach((keyword) => this.addKeyword(keyword));
    }
  }

  addKeyword(keyword: string): void {
    if (keyword == null || keyword.trim() === '') {
      throw new Error('Provided string `keyword` is a null or empty string.');
    }

    let currentState = this.root;
    const cased = this.options.caseSensitive ? keyword : keyword.toLowerCase();
    const kw = this.options.removeWhiteSpaces ? cased.trim() : cased;

    const key = this.options.caseSensitive ? kw : kw.replace(/ς/g, 'σ');
    for (let i = 0; i < key.length; i++) {
      const char = key.charAt(i);
      currentState = currentState.add(char);
    }

    currentState.keywords.push(kw);
    this.failureStateConstructed = false;
  }

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
    if (!text) return;
    if (!this.failureStateConstructed) this.constructFailureStates();
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
      for (const keyword of currentState.matches) {
        const from = pos - keyword.length + 1;
        const start = boundaries ? boundaries[from] : from;
        const after = boundaries ? boundaries[pos + 1] : pos + 1;
        if (start === undefined || after === undefined) continue;
        if (
          !this.options.wholeWords ||
          (!wordChar.test(text.charAt(start - 1)) &&
            !wordChar.test(text.charAt(after)))
        ) {
          emit(start, after - 1, keyword);
        }
      }
    }
  }

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

  private getState(currentState: State, char: string): State {
    let next = currentState.next.get(char);
    while (!next && currentState !== this.root) {
      currentState = currentState.failure;
      next = currentState.next.get(char);
    }
    return next ?? this.root;
  }

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
