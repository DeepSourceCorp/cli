import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import gql from "graphql-tag";
import { AnalyzerConnection, PageInfo } from '~/types/types.ts'
import AnalyzersGQLQuery from '~/apollo/queries/analyzers.graphql';

@Module({
  name: 'analyzers',
  stateFactory: true,
  namespaced: true
})
class Analyzers extends VuexModule {
  public analyzers: AnalyzerConnection | null = {
    pageInfo: {
      hasNextPage: true,
      hasPreviousPage: true
    },
    edges: []
  };

  @Mutation
  public setAnalyzers(analyzers: AnalyzerConnection): void {
    this.analyzers = analyzers;
  }

  @Action
  public async fetchAnalyzers() {
    let client = this.store.app.apolloProvider.defaultClient
    const response = await client.query({
      query: AnalyzersGQLQuery
    })
    this.context.commit('setAnalyzers', response.data.analyzers)
  }
}

export default Analyzers; 