import { Match } from './match';

describe('Match', () => {
  describe('constructor', () => {
    test('should create a new Match instance with the specified start, end, and keyword', () => {
      const match = new Match(1, 5, 'example');
      expect(match).toBeInstanceOf(Match);
      expect(match['start']).toBe(1);
      expect(match['end']).toBe(5);
      expect(match['keyword']).toBe('example');
    });
  });
});
