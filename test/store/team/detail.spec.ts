import {
  state,
  mutations,
  actions,
  TeamMutations,
  TeamActionContext,
  TeamState,
  TeamActions
} from '~/store/team/detail'
import { mockTeamState } from './__mocks__/detail.mock'
import { Team } from '~/types/types'
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'

let actionCxt: TeamActionContext
let commit: jest.Mock
let spy: jest.SpyInstance
let teamState: TeamState

const localThisSuccess: any = {
  $providerMetaMap: {
    gh: {
      text: 'Github',
      shortcode: 'gh',
      value: 'GITHUB'
    }
  },
  $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
    return Promise.resolve({ data: { team: mockTeamState().team } })
  },
  $getGQLAfter(): string {
    return ''
  }
}

const localThisFailure: any = {
  $providerMetaMap: {
    gh: {
      text: 'Github',
      shortcode: 'gh',
      value: 'GITHUB'
    }
  },
  $fetchGraphqlData(): Promise<Error> {
    return Promise.reject(new Error('ERR1'))
  },
  $getGQLAfter(): string {
    return ''
  }
}

describe('[Store] Team/List', () => {
  beforeEach(() => {
    commit = jest.fn()
    teamState = mockTeamState()

    actionCxt = {
      state: teamState,
      commit,
      dispatch: jest.fn(),
      getters: jest.fn(),
      rootGetters: jest.fn(),
      rootState: {}
    }
  })

  /*
    +++++++++++++++++++++++++++++++++++++++++++++
    +++++++++++++++++++ STATE +++++++++++++++++++
    +++++++++++++++++++++++++++++++++++++++++++++
  */
  describe('[[State]]', () => {
    test('has the right initial data', () => {
      const initState = state()
      expect(initState.loading).toEqual(false)
      expect(initState.error).toEqual({})
      expect(initState.team).toEqual({})
    })
  })

  /*
    +++++++++++++++++++++++++++++++++++++++++++++++
    +++++++++++++++++++ ACTIONS +++++++++++++++++++
    +++++++++++++++++++++++++++++++++++++++++++++++
  */
  describe('[[Actions]]', () => {
    describe(`Action "${TeamActions.FETCH_TEAM_INFO}"`, () => {
      describe(`Success`, () => {
        beforeEach(async () => {
          // Setting the global spy on `localThisSuccess.$fetchGraphqlData`
          spy = jest.spyOn(localThisSuccess, '$fetchGraphqlData')

          await actions[TeamActions.FETCH_TEAM_INFO].call(localThisSuccess, actionCxt, {
            provider: 'gh',
            login: 'deepsourcelabs',
            limit: 5,
            currentPage: 0,
            query: ''
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${TeamMutations.SET_LOADING}`, () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `TeamMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(TeamMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `TeamMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(TeamMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${TeamMutations.SET_TEAM}`, async () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit
          const apiResponse = await localThisSuccess.$fetchGraphqlData()

          // Assert if `TeamMutations.SET_RUN` is being commited or not.
          expect(secondCall[0]).toEqual(TeamMutations.SET_TEAM)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual(apiResponse.data.team)
        })
      })
      describe(`Failure`, () => {
        beforeEach(async () => {
          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThisFailure, '$fetchGraphqlData')

          await actions[TeamActions.FETCH_TEAM_INFO].call(localThisFailure, actionCxt, {
            provider: 'gh',
            login: 'deepsourcelabs',
            limit: 5,
            currentPage: 0,
            query: ''
          })
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${TeamMutations.SET_LOADING}`, () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `TeamMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(TeamMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `TeamMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(TeamMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${TeamMutations.SET_ERROR}`, () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          // Assert if `TeamMutations.SET_ERROR` is being commited or not.
          expect(secondCall[0]).toEqual(TeamMutations.SET_ERROR)

          // Assert if the payload passed to the mutation was empty.
          expect(secondCall[1]).toEqual(Error('ERR1'))
        })
      })
    })
  })

  /*
    +++++++++++++++++++++++++++++++++++++++++++++++++
    +++++++++++++++++++ MUTATIONS +++++++++++++++++++
    +++++++++++++++++++++++++++++++++++++++++++++++++
  */
  describe('[[Mutations]]', () => {
    describe(`Mutation "${TeamMutations.SET_LOADING}"`, () => {
      test('successfully updates loading field in state', () => {
        mutations[TeamMutations.SET_LOADING](teamState, true)
        expect(teamState.loading).toEqual(true)
      })
    })

    describe(`Mutation "${TeamMutations.SET_ERROR}"`, () => {
      test('successfully updates loading field in state', () => {
        const dummyError = {
          graphQLErrors: {
            message: 'Dummy error',
            locations: [],
            path: []
          }
        }
        mutations[TeamMutations.SET_ERROR](teamState, dummyError)
        expect(teamState.error).toEqual(dummyError)
      })
    })

    describe(`Mutation "${TeamMutations.SET_TEAM}"`, () => {
      beforeEach(() => {
        teamState.team = {} as Team
      })
      test('successfully adds new run detail to the state', () => {
        const newTeam = {
          id: 'sfsdfdsfsdfdsfdsfsd',
          login: 'not-deesource'
        }

        mutations[TeamMutations.SET_TEAM](teamState, newTeam as Team)
        expect(teamState.team).toEqual(newTeam)
      })

      test('successfully appends data', () => {
        const newTeam = mockTeamState().team

        if (newTeam.id) {
          newTeam.id = 'new_id'
        }
        mutations[TeamMutations.SET_TEAM](teamState, newTeam)
        expect(teamState.team.id).toEqual(newTeam.id)
      })
    })
  })
})
