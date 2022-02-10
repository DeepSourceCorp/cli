import { Component, Vue, namespace } from 'nuxt-property-decorator'
import { AccessTokenActions } from '~/store/accessToken/accessToken'

import {
  AccessToken,
  CreateAccessTokenPayload,
  DeleteAccessTokenPayload,
  DeleteAllAccessTokensPayload
} from '~/types/types'

export interface CreatedAccessToken extends AccessToken {
  token: string
}

const accessTokenStore = namespace('accessToken/accessToken')

/**
 * AccessTokenMixin
 */
@Component
export default class AccessTokenMixin extends Vue {
  @accessTokenStore.State
  userAccessTokenList: AccessToken[]

  @accessTokenStore.State
  totalUserAccessTokens: number

  @accessTokenStore.State
  currentUserAccessToken?: AccessToken

  @accessTokenStore.Action(AccessTokenActions.FETCH_ACCESS_TOKEN_LIST)
  fetchAccessTokenList: (args: {
    currentPage: number
    limit: number
    refetch?: boolean
  }) => Promise<void>

  @accessTokenStore.Action(AccessTokenActions.FETCH_ACCESS_TOKEN)
  fetchSingleAccessToken: (args: { tokenId: string }) => Promise<CreateAccessTokenPayload>

  @accessTokenStore.Action(AccessTokenActions.DELETE_ACCESS_TOKEN)
  deleteAccessToken: (args: { tokenId: string }) => Promise<DeleteAccessTokenPayload>

  @accessTokenStore.Action(AccessTokenActions.DELETE_ALL_ACCESS_TOKEN)
  deleteAllAccessTokens: () => Promise<DeleteAllAccessTokensPayload>

  @accessTokenStore.Action(AccessTokenActions.CREATE_USER_ACCESS_TOKEN)
  createUserAccessToken: (args: {
    description?: string
    expiryDays?: number
  }) => Promise<CreatedAccessToken>
}
