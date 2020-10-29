import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import { AnalyzerConnection } from '~/types/types'
import AnalyzersGQLQuery from '~/apollo/queries/analyzers.graphql';
import { ACT_FETCH_ANALYZERS } from '~/types/action-types';

const MUT_SET_ANALYZERS = 'setAnalyzers';

@Module({
  name: 'modules/analyzers',
  stateFactory: true,
  namespaced: true
})
class Analyzers extends VuexModule {
  analyzers: AnalyzerConnection | null = {
    pageInfo: {
      hasNextPage: true,
      hasPreviousPage: true
    },
    edges: []
  };

  @Mutation
  public [MUT_SET_ANALYZERS](analyzers: AnalyzerConnection): void {
    this.analyzers = analyzers;
  }

  @Action
  public async [ACT_FETCH_ANALYZERS]() {
    let client = this.store.app.apolloProvider.defaultClient
    const response = await client.query({
      query: AnalyzersGQLQuery
    })
    this.context.commit(MUT_SET_ANALYZERS, response.data.analyzers)
  }
}

export default Analyzers; 