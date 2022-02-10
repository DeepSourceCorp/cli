import {
  state,
  mutations,
  actions,
  AccessTokenModuleActionContext,
  AccessTokenState,
  AccessTokenActions,
  AccessTokenMutations
} from '~/store/accessToken/accessToken'
import {
  accessTokenList,
  accessTokenListWithoutTotalCountResponse,
  accessTokenListResponse,
  createAccessTokenResponse,
  currentAccessTokenResponse,
  currentUserAccessToken,
  mockStateEmpty,
  mockStateFilled
} from './__mocks__/accessTokenMocks'
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'

let actionCxt: AccessTokenModuleActionContext
let commit: jest.Mock
let accessTokenState: AccessTokenState
let localThis: any
let spy: jest.SpyInstance

describe('[[ MUTATIONS ]]', () => {
  beforeEach(() => {
    accessTokenState = mockStateEmpty()
  })
  test(`Mutation "${AccessTokenMutations.SET_ACCESS_TOKEN}"`, () => {
    mutations[AccessTokenMutations.SET_ACCESS_TOKEN](accessTokenState, currentUserAccessToken)
    expect(accessTokenState.currentUserAccessToken).toMatchObject(currentUserAccessToken)
  })
  test(`Mutation "${AccessTokenMutations.SET_ACCESS_TOKEN_LIST}"`, () => {
    mutations[AccessTokenMutations.SET_ACCESS_TOKEN_LIST](
      accessTokenState,
      accessTokenListResponse.data.viewer.accessTokens
    )

    expect(accessTokenState.userAccessTokenList).toMatchObject(accessTokenList)
    expect(accessTokenState.totalUserAccessTokens).toEqual(
      accessTokenListResponse.data.viewer.accessTokens.totalCount
    )

    mutations[AccessTokenMutations.SET_ACCESS_TOKEN_LIST](
      accessTokenState,
      accessTokenListWithoutTotalCountResponse.data.viewer.accessTokens
    )

    expect(accessTokenState.userAccessTokenList).toMatchObject([])
    expect(accessTokenState.totalUserAccessTokens).toEqual(0)
  })
})

describe('[[ ACTIONS ]]', () => {
  beforeEach(() => {
    commit = jest.fn()
    accessTokenState = mockStateFilled()

    actionCxt = {
      state: accessTokenState,
      commit,
      dispatch: jest.fn(),
      getters: jest.fn(),
      rootGetters: jest.fn(),
      rootState: {}
    }
  })

  describe(`Runs ${AccessTokenActions.FETCH_ACCESS_TOKEN}`, () => {
    beforeEach(async () => {
      localThis = {
        async $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
          return new Promise<GraphqlQueryResponse>((resolve) =>
            setTimeout(() => resolve(currentAccessTokenResponse), 10)
          )
        }
      }

      // Setting the global spy on `localThis.$fetchGraphqlData`
      spy = jest.spyOn(localThis, '$fetchGraphqlData')

      await actions[AccessTokenActions.FETCH_ACCESS_TOKEN].call(localThis, actionCxt, {
        tokenId: currentUserAccessToken.id
      })
    })
    test('successfully calls the api', () => {
      expect(spy).toHaveBeenCalledTimes(1)
    })
    test('successfully commits mutations', async () => {
      expect(commit).toHaveBeenCalledTimes(1)
    })

    test(`successfully commits mutation ${AccessTokenMutations.SET_ACCESS_TOKEN}`, async () => {
      // Storing the first commit call made
      const {
        mock: {
          calls: [firstCall]
        }
      } = commit

      // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not.
      expect(firstCall[0]).toEqual(AccessTokenMutations.SET_ACCESS_TOKEN)

      // Assert if right data is passed to the mutation.
      expect(firstCall[1]).toEqual(currentUserAccessToken)
    })
  })

  describe(`Runs ${AccessTokenActions.FETCH_ACCESS_TOKEN_LIST}`, () => {
    beforeEach(async () => {
      localThis = {
        async $fetchGraphqlData(): Promise<unknown> {
          return new Promise<unknown>((resolve) =>
            setTimeout(() => resolve(accessTokenListResponse), 10)
          )
        },
        $getGQLAfter: () => {
          return 'sjkadfnlkasd'
        }
      }

      // Setting the global spy on `localThis.$fetchGraphqlData`
      spy = jest.spyOn(localThis, '$fetchGraphqlData')

      await actions[AccessTokenActions.FETCH_ACCESS_TOKEN_LIST].call(localThis, actionCxt, {
        currentPage: 0,
        limit: 5
      })
    })
    test('successfully calls the api', () => {
      expect(spy).toHaveBeenCalledTimes(1)
    })
    test('successfully commits mutations', async () => {
      expect(commit).toHaveBeenCalledTimes(1)
    })

    test(`successfully commits mutation ${AccessTokenMutations.SET_ACCESS_TOKEN_LIST}`, async () => {
      // Storing the first commit call made
      const {
        mock: {
          calls: [firstCall]
        }
      } = commit

      // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not.
      expect(firstCall[0]).toEqual(AccessTokenMutations.SET_ACCESS_TOKEN_LIST)

      // Assert if right data is passed to the mutation.
      expect(firstCall[1]).toEqual(accessTokenListResponse.data.viewer.accessTokens)
    })
  })

  describe(`Runs ${AccessTokenActions.CREATE_USER_ACCESS_TOKEN}`, () => {
    beforeEach(async () => {
      localThis = {
        async $applyGraphqlMutation(): Promise<unknown> {
          return new Promise<unknown>((resolve) =>
            setTimeout(() => resolve(createAccessTokenResponse), 10)
          )
        }
      }
      spy = jest.spyOn(localThis, '$applyGraphqlMutation')

      await actions[AccessTokenActions.CREATE_USER_ACCESS_TOKEN].call(localThis, actionCxt, {
        description: '21321',
        expiryDays: 140
      })
    })
    test('successfully calls the api', () => {
      expect(spy).toHaveBeenCalledTimes(1)
    })
    test('successfully commits mutations', async () => {
      expect(commit).toHaveBeenCalledTimes(0)
    })
  })

  describe(`Runs ${AccessTokenActions.DELETE_ACCESS_TOKEN}`, () => {
    beforeEach(async () => {
      localThis = {
        async $applyGraphqlMutation(): Promise<unknown> {
          return new Promise<unknown>((resolve) =>
            setTimeout(() => resolve({ data: { ok: true } }), 10)
          )
        }
      }
      spy = jest.spyOn(localThis, '$applyGraphqlMutation')

      await actions[AccessTokenActions.DELETE_ACCESS_TOKEN].call(localThis, actionCxt, {
        tokenId: '21321'
      })
    })
    test('successfully calls the api', () => {
      expect(spy).toHaveBeenCalledTimes(1)
    })
    test('successfully commits mutations', async () => {
      expect(commit).toHaveBeenCalledTimes(0)
    })
  })

  describe(`Runs ${AccessTokenActions.DELETE_ALL_ACCESS_TOKEN}`, () => {
    beforeEach(async () => {
      localThis = {
        async $applyGraphqlMutation(): Promise<unknown> {
          return new Promise<unknown>((resolve) =>
            setTimeout(() => resolve({ data: { ok: true } }), 10)
          )
        }
      }
      spy = jest.spyOn(localThis, '$applyGraphqlMutation')

      await actions[AccessTokenActions.DELETE_ALL_ACCESS_TOKEN].call(localThis, actionCxt)
    })
    test('successfully calls the api', () => {
      expect(spy).toHaveBeenCalledTimes(1)
    })
    test('successfully commits mutations', async () => {
      expect(commit).toHaveBeenCalledTimes(0)
    })
  })
})
