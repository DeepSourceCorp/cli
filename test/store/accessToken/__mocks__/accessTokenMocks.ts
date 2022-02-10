import { AccessTokenState } from '~/store/accessToken/accessToken'
import { AccessToken, AccessTokenExpirationStatus, AccessTokenEdge, Maybe } from '~/types/types'
import { CreatedAccessToken } from '@/mixins/accessTokenMixin'

export const currentUserAccessToken: AccessToken = {
  id: 'this-is-a-mock-access-token',
  description: 'test',
  expiresAt: '2022-02-07T09:08:54.520Z',
  expirationStatus: AccessTokenExpirationStatus.Active
}

export const currentAccessTokenResponse = {
  data: {
    accessToken: currentUserAccessToken
  }
}

export const missingAccessTokenResponse = {
  errors: [
    {
      message: 'Object does not exist.',
      locations: [
        {
          line: 2,
          column: 3
        }
      ],
      path: ['accessToken']
    }
  ]
}

export const createdAccessToken: CreatedAccessToken = {
  id: 'this-is-a-mock-access-token',
  description: 'test',
  expiresAt: '2022-02-07T09:08:54.520Z',
  expirationStatus: AccessTokenExpirationStatus.Active,
  token: '0b200e81-9180-4cee-abdc-ff090c22d7fe'
}

export const createAccessTokenResponse = {
  data: {
    createAccessToken: {
      accessToken: createdAccessToken
    }
  }
}

export const accessTokenList: AccessToken[] = [
  {
    id: 'this-is-a-mock-access-token',
    description: 'test',
    expiresAt: '2022-02-07T09:08:54.520Z',
    expirationStatus: AccessTokenExpirationStatus.Active
  },
  {
    id: 'this-is-a-mock-access-token-2',
    description: 'test-2',
    expiresAt: '2022-02-07T09:08:54.520Z',
    expirationStatus: AccessTokenExpirationStatus.Active
  },
  {
    id: 'this-is-a-mock-access-token-3',
    description: 'test-3',
    expiresAt: '2022-02-07T09:08:54.520Z',
    expirationStatus: AccessTokenExpirationStatus.Expired
  },
  {
    id: 'this-is-a-mock-access-token-3',
    description: 'test-3',
    expiresAt: '2022-02-07T09:08:54.520Z',
    expirationStatus: AccessTokenExpirationStatus.DoesNotExpire
  }
]

export const accessTokenListResponse = {
  data: {
    viewer: {
      accessTokens: {
        totalCount: 4,
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false
        },
        edges: accessTokenList.map((token) => {
          return { node: token }
        }) as Maybe<AccessTokenEdge>[]
      }
    }
  }
}

export const accessTokenListWithoutTotalCountResponse = {
  data: {
    viewer: {
      accessTokens: {
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false
        },
        edges: []
      }
    }
  }
}

export const mockStateEmpty = (): AccessTokenState => ({
  userAccessTokenList: [],
  currentUserAccessToken: undefined,
  totalUserAccessTokens: 0
})

export const mockStateFilled = (): AccessTokenState => ({
  userAccessTokenList: accessTokenList,
  currentUserAccessToken: currentUserAccessToken,
  totalUserAccessTokens: 4
})
