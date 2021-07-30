import { GetterTree, MutationTree, ActionTree, ActionContext, Store } from 'vuex'
import { RootState } from '~/store'

import triggerAdhocRunGQLMutation from '~/apollo/mutations/repository/triggerAdHocRun.gql'

export interface AdHocRunAnalyzer {
  name: string
  enabled: boolean
  meta: Record<string, string | boolean>
}
export interface AdHocRunStore {
  repositoryId: string
  analyzers: Array<AdHocRunAnalyzer>
}

// Getters ------------------------------------------
export enum AdHocRunGetterTypes {
  REPOSITORY = 'GET_REPOSITORY',
  ANALYZERS = 'GET_ANALYZERS'
}

export const getters: GetterTree<AdHocRunStore, RootState> = {
  [AdHocRunGetterTypes.REPOSITORY]: (state) => state.repositoryId || '',
  [AdHocRunGetterTypes.ANALYZERS]: (state) => state.analyzers || []
}

// Mutations ----------------------------------------
export enum AdHocRunMutationTypes {
  UPDATE_REPOSITORY = 'UPDATE_REPOSITORY',
  UPDATE_ANALYZER = 'UPDATE_ANALYZER',
  REMOVE_ANALYZER = 'REMOVE_ANALYZER',
  RESET_ANALYZERS = 'RESET_ANALYZERS'
}

export const mutations: MutationTree<AdHocRunStore> = {
  [AdHocRunMutationTypes.UPDATE_REPOSITORY]: (state: AdHocRunStore, repositoryId: string) => {
    state.repositoryId = repositoryId
    state.analyzers = []
  },

  [AdHocRunMutationTypes.UPDATE_ANALYZER]: (state: AdHocRunStore, config: AdHocRunAnalyzer) => {
    // Check if ANALYZER is already present
    const index = state.analyzers.findIndex((lang) => lang.name === config.name)

    // if present
    if (index > -1) {
      // update the object with new config
      Object.assign(state.analyzers[index], config)
    } else {
      // Update
      state.analyzers.push(config)
    }
  },

  [AdHocRunMutationTypes.REMOVE_ANALYZER]: (state: AdHocRunStore, langToRemove: string) => {
    state.analyzers = state.analyzers.filter((lang) => lang.name !== langToRemove)
  },

  [AdHocRunMutationTypes.RESET_ANALYZERS]: (state: AdHocRunStore) => {
    state.analyzers = []
  }
}

// Actions ----------------------------------------
export type AdHocRunActionContext = ActionContext<AdHocRunStore, RootState>

export enum AdHocRunActionTypes {
  TRIGGER_ADHOC_RUN = 'TRIGGER_ADHOC_RUN',
  RESET_ALL_PREFERENCES = 'RESET_ALL_PREFERENCES'
}

interface AdHocRunModuleActions extends ActionTree<AdHocRunStore, RootState> {
  [AdHocRunActionTypes.TRIGGER_ADHOC_RUN]: (
    this: Store<RootState>,
    injectee: AdHocRunActionContext,
    args: { config: string }
  ) => Promise<void>
  [AdHocRunActionTypes.RESET_ALL_PREFERENCES]: (injectee: AdHocRunActionContext) => void
}

export const actions: AdHocRunModuleActions = {
  async [AdHocRunActionTypes.TRIGGER_ADHOC_RUN]({ state }, args) {
    await this.$applyGraphqlMutation(triggerAdhocRunGQLMutation, {
      input: {
        config: args.config,
        repositoryId: state.repositoryId
      }
    })
  },

  [AdHocRunActionTypes.RESET_ALL_PREFERENCES]({ commit }) {
    commit(AdHocRunMutationTypes.RESET_ANALYZERS)
    commit(AdHocRunMutationTypes.UPDATE_REPOSITORY, '')
  }
}
export const state = function (): AdHocRunStore {
  return <AdHocRunStore>{
    repositoryId: '',
    analyzers: []
  }
}
