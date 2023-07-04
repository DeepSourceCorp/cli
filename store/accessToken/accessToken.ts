import { RootState } from '~/store'
import { ActionTree, MutationTree, ActionContext, Store } from 'vuex'
import {
  AccessToken,
  DeleteAccessTokenPayload,
  DeleteAllAccessTokensPayload,
  AccessTokenConnection,
  CreateAccessTokenPayload
} from '~/types/types'
import { resolveNodes } from '~/utils/array'

// Queries
import fetchUserAccessTokenList from '~/apollo/queries/pat/accessTokenList.gql'
import fetchUserAccessToken from '~/apollo/queries/pat/accessToken.gql'

// Mutations
import createUserAccessToken from '~/apollo/mutations/pat/user/create.gql'
import deleteAccessToken from '~/apollo/mutations/pat/user/delete.gql'
import deleteAllAccessTokens from '~/apollo/mutations/pat/user/deleteAll.gql'

export interface AccessTokenState {
  userAccessTokenList: AccessToken[]
  currentUserAccessToken?: AccessToken
  totalUserAccessTokens: number
}

// Mutation -----------------------------------------
export enum AccessTokenMutations {
  SET_ACCESS_TOKEN = 'setAccessToken',
  SET_ACCESS_TOKEN_LIST = 'setAccessTokenList'
}

export const mutations: MutationTree<AccessTokenState> = {
  [AccessTokenMutations.SET_ACCESS_TOKEN]: (state, value: AccessToken) => {
    state.currentUserAccessToken = value
  },
  [AccessTokenMutations.SET_ACCESS_TOKEN_LIST]: (state, value: AccessTokenConnection) => {
    state.totalUserAccessTokens = value.totalCount ?? 0
    state.userAccessTokenList = resolveNodes(value)
  }
}
// Actions ------------------------------------------
export enum AccessTokenActions {
  CREATE_USER_ACCESS_TOKEN = 'createAccessToken',
  FETCH_ACCESS_TOKEN = 'fetchAccessToken',
  FETCH_ACCESS_TOKEN_LIST = 'fetchAccessTokenList',
  DELETE_ACCESS_TOKEN = 'deleteAccessToken',
  DELETE_ALL_ACCESS_TOKEN = 'deleteAllAccessTokens'
}

export type AccessTokenModuleActionContext = ActionContext<AccessTokenState, RootState>

interface AccessTokenModuleActions extends ActionTree<AccessTokenState, RootState> {
  [AccessTokenActions.CREATE_USER_ACCESS_TOKEN]: (
    this: Store<RootState>,
    injectee: AccessTokenModuleActionContext,
    args: {
      description: string
      expiryDays?: number
    }
  ) => Promise<CreateAccessTokenPayload>
  [AccessTokenActions.FETCH_ACCESS_TOKEN]: (
    this: Store<RootState>,
    injectee: AccessTokenModuleActionContext,
    args: {
      tokenId: string
    }
  ) => Promise<void>
  [AccessTokenActions.FETCH_ACCESS_TOKEN_LIST]: (
    this: Store<RootState>,
    injectee: AccessTokenModuleActionContext,
    args: {
      currentPage: number
      limit: number
      refetch?: boolean
    }
  ) => Promise<void>
  [AccessTokenActions.DELETE_ACCESS_TOKEN]: (
    this: Store<RootState>,
    injectee: AccessTokenModuleActionContext,
    args: {
      tokenId: string
    }
  ) => Promise<DeleteAccessTokenPayload>
  [AccessTokenActions.DELETE_ALL_ACCESS_TOKEN]: (
    this: Store<RootState>,
    injectee: AccessTokenModuleActionContext
  ) => Promise<DeleteAllAccessTokensPayload>
}

export const actions: AccessTokenModuleActions = {
  async [AccessTokenActions.FETCH_ACCESS_TOKEN]({ commit }, args) {
    const response = await this.$fetchGraphqlData(fetchUserAccessToken, {
      tokenId: args.tokenId
    })
    return commit(AccessTokenMutations.SET_ACCESS_TOKEN, response.data.accessToken)
  },
  async [AccessTokenActions.FETCH_ACCESS_TOKEN_LIST]({ commit }, args) {
    const { currentPage, limit } = args

    const response = await this.$fetchGraphqlData(
      fetchUserAccessTokenList,
      {
        limit: limit,
        after: this.$getGQLAfter(currentPage, limit)
      },
      args.refetch
    )
    return commit(AccessTokenMutations.SET_ACCESS_TOKEN_LIST, response.data.viewer.accessTokens)
  },
  async [AccessTokenActions.CREATE_USER_ACCESS_TOKEN](_, args) {
    const response = await this.$applyGraphqlMutation(createUserAccessToken, args)
    const { accessToken, token } = response.data.createAccessToken
    return { ...accessToken, token }
  },
  async [AccessTokenActions.DELETE_ACCESS_TOKEN](_, args) {
    const response = await this.$applyGraphqlMutation(deleteAccessToken, {
      tokenId: args.tokenId
    })
    return response.data.ok
  },
  async [AccessTokenActions.DELETE_ALL_ACCESS_TOKEN]() {
    const response = await this.$applyGraphqlMutation(deleteAllAccessTokens, {})
    return response.data.ok
  }
}

/**
 * Generate access token state
 *
 * @return {AccessTokenState => (}
 */
export const state = (): AccessTokenState => ({
  userAccessTokenList: [],
  currentUserAccessToken: undefined,
  totalUserAccessTokens: 0
})
