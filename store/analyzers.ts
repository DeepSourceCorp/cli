import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import gql from "graphql-tag";

@Module({
  name: 'analyzers',
  stateFactory: true,
  namespaced: true
})
class Analyzers extends VuexModule {
  public analyzers: any = [];

  @Mutation
  public setAnalyzers(analyzers: any): void {
    this.analyzers = analyzers;
  }

  @Action
  public async fetchAnalyzers() {
    let client = this.store.app.apolloProvider.defaultClient
    const response = await client.query({
      query: gql`
      query {
        analyzers {
          edges {
            node {
              id
              name
              shortcode
            }
          }
        }
      }
      `
    })
    this.context.commit('setAnalyzers', response.data.analyzers.edges)
  }
}

export default Analyzers; 