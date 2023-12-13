import { State } from './state';

describe('State', () => {
  describe('constructor', () => {
    test('should create a new State with the specified depth', () => {
      const state = new State(1);
      expect(state.depth).toBe(1);
      expect(state.match).toEqual([]);
      expect(state.successes).toEqual([]);
      expect(state.transitions).toEqual([]);
      expect(state.failure).toBeNull();
    });
  });

  describe('addMatch', () => {
    test('should add keywords to the list of strings representing keywords', () => {
      const state = new State(1);
      state.addMatch(['keyword1', 'keyword2']);
      expect(state.match).toEqual(['keyword1', 'keyword2']);
    });
  });

  describe('nextState', () => {
    test('should return the next state associated with the specified character', () => {
      const state = new State(1);
      const nextState = new State(2);
      state.addState('a');
      state.addMatch(['keyword']);
      state.failure = nextState;

      expect(state.nextState('a')).toBeInstanceOf(State);
    });

    test('should ignore root state when transitioning if ignoreRoot is true', () => {
      const state = new State(1);
      const nextState = new State(2);
      state.addState('a');
      state.addMatch(['keyword']);
      state.failure = nextState;

      expect(state.nextState('b', true)).toBeNull();
    });

    test('should return null if no next state is found', () => {
      const state = new State(1);
      expect(state.nextState('a')).toBeNull();
    });
  });

  describe('addState', () => {
    test('should add a new state for the specified character and return the added state', () => {
      const state = new State(1);
      const nextState = state.addState('a');
      expect(nextState).toBeInstanceOf(State);
      expect(state.nextState('a')).toBe(nextState);
    });
  });

  describe('root', () => {
    test('should return the root state if the depth is 0, otherwise return null', () => {
      const rootState = new State(0);
      const state = new State(1);
      expect(rootState.root).toBe(rootState);
      expect(state.root).toBeNull();
    });
  });
});
