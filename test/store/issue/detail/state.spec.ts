import { state } from '~/store/issue/detail'

describe('[Store] Issue/Detail', () => {
  describe('[[State]]', () => {
    test('has the right initial data', () => {
      const initState = state()
      expect(initState.loading).toEqual(false)
      expect(initState.error).toEqual({})
      expect(initState.issue).toEqual({})
    })
  })
})
