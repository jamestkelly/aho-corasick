import { State } from '../models'

describe('State', () => {
  describe('addState', () => {
    it('can construct sequence of characters', () => {
      const rootState = new State(0)
      rootState.addState('a').addState('b').addState('c')

      const stateA = rootState.nextState('a')!
      expect(stateA.depth).toBe(1)

      const stateB = stateA.nextState('b')!
      expect(stateB.depth).toBe(2)

      const stateC = stateB.nextState('c')!
      expect(stateC.depth).toBe(3)
    })
  })

  describe('getStates', () => {
    it('can retrieve all states that are reachable with one step', () => {
      const rootState = new State(0)
      rootState.addState('a').addState('d')
      rootState.addState('b')
      rootState.addState('c')

      rootState.successes.forEach((state) => {
        expect(state.depth).toBe(1)
      })
    })
  })

  describe('getTransitions', () => {
    it('can retrieve all transitions', () => {
      const rootState = new State(0)
      rootState.addState('a').addState('d')
      rootState.addState('b')
      rootState.addState('c')

      expect(rootState.transitions).toEqual(['a', 'b', 'c'])
    })
  })
})