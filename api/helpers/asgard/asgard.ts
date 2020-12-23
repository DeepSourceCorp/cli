import {ApolloClient} from 'apollo-client';
import { NormalizedCacheObject } from 'apollo-cache-inmemory'
import { socialAuthMutation, refreshTokenMutation } from './contracts'
import { SocialAuthJwt, Refresh } from '@/types/types';
import { AsgardError } from './errors';



export class AsgardClient {

  private client: ApolloClient<NormalizedCacheObject>;

  static getInstance(graphqlClient: ApolloClient<NormalizedCacheObject>):AsgardClient {
    return asgardClient || new AsgardClient(graphqlClient);
  }

  constructor(graphqlClient: ApolloClient<NormalizedCacheObject>) {
     this.client = graphqlClient;
  }

  /**
   * Fetches the JWT from Asgard by exchanging the access token received from VCS.
   * @param accessToken
   * @param provider
   */
  public async getToken(accessToken: string, provider: string): Promise<SocialAuthJwt> {
    try {
      const result = await this.client.mutate({
        mutation: socialAuthMutation,
        variables: {
          provider,
          accessToken
        }
      });
      return <SocialAuthJwt>{...result.data.socialAuth};
    } catch (err) {
      throw new AsgardError(err.message);
    }
  }

  /**
   * Fetches a new JWT from Asgard by exchanging the refresh token.
   * @param refreshToken
   */
  public async refreshToken(refreshToken: string): Promise<Refresh> {
    try {
      const result = await this.client.mutate({
        mutation: refreshTokenMutation,
        variables: {
          refreshToken
        }
      });
      return <Refresh>{...result.data.refreshToken}
    } catch (err) {
      throw new AsgardError(err.message);
    }
  }
}

let asgardClient: AsgardClient;
