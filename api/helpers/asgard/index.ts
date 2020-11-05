import {ApolloClient} from 'apollo-client';
import { NormalizedCacheObject } from 'apollo-cache-inmemory'
import gql from 'graphql-tag'

var asgardClient: AsgardClient;

export class AsgardClient {

  private client: ApolloClient<NormalizedCacheObject>;

  static getInstance(graphqlClient: ApolloClient<NormalizedCacheObject>):AsgardClient {
    return asgardClient || new AsgardClient(graphqlClient);
  }

  constructor(graphqlClient: ApolloClient<NormalizedCacheObject>) {
     this.client = graphqlClient;
  }

  public async getJWT(accessToken: string, provider: string): Promise<string> {
    const mutation =
      gql`
        mutation SocialAuth($provider: String!, $accessToken: String!) {
          socialAuth(provider: $provider, accessToken: $accessToken) {
            social {
              uid
              user {
                fullName
              }
            }
            token
          }
        }
      `;

      const result = await this.client.mutate({
        mutation: mutation,
        variables: {
          provider,
          accessToken
        }
      });
      //TODO<Vishnu>: Throw proper errors.
    return result.data.socialAuth.token;
  }
}
