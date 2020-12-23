import gql from 'graphql-tag'

export const socialAuthMutation = gql`
  mutation SocialAuth($provider: String!, $accessToken: String!) {
    socialAuth(provider: $provider, accessToken: $accessToken) {
      social {
        uid
        user {
          fullName
        }
      }
      token
      refreshToken
    }
  }`


export const refreshTokenMutation = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      token
      payload
      refreshToken
      refreshExpiresIn
    }
  }`
