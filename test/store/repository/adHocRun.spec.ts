import { state, mutations, AdHocRunMutationTypes, AdHocRunStore } from '~/store/repository/adHocRun'
import { mockAdHocRunStore } from './__mocks__/adHocRun.mock'

let currentState: AdHocRunStore

describe('[Store] Analyzer/List', () => {
  beforeEach(() => {
    currentState = mockAdHocRunStore()
  })

  /*
    +++++++++++++++++++++++++++++++++++++++++++++
    +++++++++++++++++++ STATE +++++++++++++++++++
    +++++++++++++++++++++++++++++++++++++++++++++
  */
  describe('[[State]]', () => {
    test('has no initial data', () => {
      const initState = state()
      expect(initState.repositoryId).toEqual('')
      expect(initState.analyzers).toEqual([])
    })
  })

  /*
    +++++++++++++++++++++++++++++++++++++++++++++++++
    +++++++++++++++++++ MUTATIONS +++++++++++++++++++
    +++++++++++++++++++++++++++++++++++++++++++++++++
  */
  describe('[[Mutations]]', () => {
    describe(`Mutation "${AdHocRunMutationTypes.UPDATE_REPOSITORY}"`, () => {
      test('successfully updates loading field in state', () => {
        mutations[AdHocRunMutationTypes.UPDATE_REPOSITORY](currentState, 'deepsourcelabs-zeal-repo')
        expect(currentState.repositoryId).toEqual('deepsourcelabs-zeal-repo')
      })
    })

    describe(`Mutation "${AdHocRunMutationTypes.UPDATE_ANALYZER}"`, () => {
      test('successfully adds an analyzer in an empty state', () => {
        mutations[AdHocRunMutationTypes.UPDATE_ANALYZER](currentState, {
          name: 'python',
          enabled: true,
          meta: {
            runtime: '3.x.x'
          }
        })
        expect(currentState.analyzers.length).toEqual(1)
        expect(currentState.analyzers[0].name).toEqual('python')

        mutations[AdHocRunMutationTypes.UPDATE_ANALYZER](currentState, {
          name: 'javascript',
          enabled: true,
          meta: {
            dailect: 'typescript'
          }
        })
        expect(currentState.analyzers.length).toEqual(2)
        expect(currentState.analyzers[1].name).toEqual('javascript')
      })

      test('successfully udpates an existing', () => {
        mutations[AdHocRunMutationTypes.UPDATE_ANALYZER](currentState, {
          name: 'python',
          enabled: true,
          meta: {
            runtime: '3.x.x'
          }
        })
        expect(currentState.analyzers[0].meta.runtime).toEqual('3.x.x')

        mutations[AdHocRunMutationTypes.UPDATE_ANALYZER](currentState, {
          name: 'python',
          enabled: true,
          meta: {
            runtime: '2.x.x'
          }
        })
        expect(currentState.analyzers[0].meta.runtime).toEqual('2.x.x')
      })
    })

    describe(`Mutation "${AdHocRunMutationTypes.REMOVE_ANALYZER}"`, () => {
      test('successfully adds an analyzer in an empty state', () => {
        mutations[AdHocRunMutationTypes.UPDATE_ANALYZER](currentState, {
          name: 'python',
          enabled: true,
          meta: {
            runtime: '3.x.x'
          }
        })
        expect(currentState.analyzers.length).toEqual(1)

        mutations[AdHocRunMutationTypes.REMOVE_ANALYZER](currentState, 'python')
        expect(currentState.analyzers.length).toEqual(0)
      })
    })
  })
})
