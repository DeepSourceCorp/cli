import { RootState } from '~/store'
import { ActionTree, MutationTree, ActionContext, Store } from 'vuex'
import {
  AutoOnboardEvent,
  AutoOnboardEventConnection,
  AutoOnboardPayload,
  ConfigTemplate,
  ConfigTemplateConnection,
  CreateConfigTemplatePayload,
  DeleteConfigTemplatePayload,
  Repository,
  RepositoryConnection,
  UpdateConfigTemplatePayload
} from '~/types/types'

// Queries
import getTemplateDetails from '~/apollo/queries/owner/auto-onboard/getTemplateDetails.gql'
import getAutoOnboardableRepositoriesList from '~/apollo/queries/owner/auto-onboard/getAutoOnboardableRepositoriesList.gql'
import getAutoOnboardEventsList from '~/apollo/queries/owner/auto-onboard/getAutoOnboardEventsList.gql'
import getTemplatesList from '~/apollo/queries/owner/auto-onboard/getTemplatesList.gql'

// Mutations
import autoOnboard from '~/apollo/mutations/owner/auto-onboard/autoOnboard.gql'
import createConfigTemplate from '~/apollo/mutations/owner/auto-onboard/createConfigTemplate.gql'
import deleteConfigTemplate from '~/apollo/mutations/owner/auto-onboard/deleteConfigTemplate.gql'
import updateConfigTemplate from '~/apollo/mutations/owner/auto-onboard/updateConfigTemplate.gql'

export interface AutoOnboardState {
  configTemplate?: ConfigTemplate
  configTemplateList: ConfigTemplate[]
  totalTemplates: number
  onboardableRepositories: Repository[]
  autoOnboardEvents: AutoOnboardEvent[]
  repositoriesToOnboard: Repository['id'][]
  hasMoreReposToOnboard: boolean
  selectedTemplate?: ConfigTemplate
}

// Mutation -----------------------------------------

export enum AutoOnboardMutations {
  SET_ONBOARDABLE_REPOS = 'setOnboardAbleRepos',
  RESET_ONBOARDABLE_REPO_LIST = 'resetOnboardableReposList',
  SELECT_TEMPLATE_TO_ONBOARD = 'selectTemplateToOnboard',
  SET_CONFIG_TEMPLATE = 'setConfigTemplate',
  RESET_CONFIG_TEMPLATE = 'resetConfigTemplate',
  SET_CONFIG_TEMPLATE_LIST = 'setConfigTemplateList',
  SET_EVENT_LIST = 'setEventList'
}

export const mutations: MutationTree<AutoOnboardState> = {
  [AutoOnboardMutations.SET_ONBOARDABLE_REPOS]: (state, value: RepositoryConnection) => {
    state.hasMoreReposToOnboard = value.pageInfo.hasNextPage
    state.onboardableRepositories = state.onboardableRepositories.concat(
      value.edges
        .map((edge) => {
          return edge?.node ? edge.node : null
        })
        .filter((node) => node) as Repository[]
    )
  },
  [AutoOnboardMutations.RESET_ONBOARDABLE_REPO_LIST]: (state) => {
    state.hasMoreReposToOnboard = true
    state.onboardableRepositories = []
  },
  [AutoOnboardMutations.SELECT_TEMPLATE_TO_ONBOARD]: (state, value: ConfigTemplate) => {
    state.selectedTemplate = value
  },
  [AutoOnboardMutations.SET_CONFIG_TEMPLATE]: (state, value: ConfigTemplate) => {
    state.configTemplate = value
  },
  [AutoOnboardMutations.RESET_CONFIG_TEMPLATE]: (state) => {
    state.configTemplate = undefined
  },
  [AutoOnboardMutations.SET_CONFIG_TEMPLATE_LIST]: (state, value: ConfigTemplateConnection) => {
    state.totalTemplates = value.totalCount ?? 0
    state.configTemplateList = value.edges
      .map((edge) => {
        return edge?.node ? edge.node : null
      })
      .filter((node) => node) as ConfigTemplate[]
  },
  [AutoOnboardMutations.SET_EVENT_LIST]: (state, value: AutoOnboardEventConnection) => {
    state.autoOnboardEvents = value.edges
      .map((edge) => {
        return edge?.node ? edge.node : null
      })
      .filter((node) => node) as AutoOnboardEvent[]
  }
}

// Actions ------------------------------------------
export enum AutoOnboardActions {
  CREATE_TEMPLATE = 'createTemplate',
  DELETE_TEMPLATE = 'deleteTemplate',
  FETCH_SINGLE_TEMPLATE = 'fetchSingleTemplate',
  FETCH_TEMPLATES = 'fetchTemplates',
  FETCH_AUTO_ONBOARDABLE_REPO_LIST = 'fetchAutoOnboardableRepoList',
  START_ONBOARDING = 'startOnboarding',
  FETCH_ONBOARDING_EVENT_LIST = 'fetchOnboardingEventList',
  UPDATE_TEMPLATE = 'updateTemplate'
}

export type AutoOnboardModuleActionContext = ActionContext<AutoOnboardState, RootState>

interface AutoOnboardModuleActions extends ActionTree<AutoOnboardState, RootState> {
  [AutoOnboardActions.CREATE_TEMPLATE]: (
    this: Store<RootState>,
    injectee: AutoOnboardModuleActionContext,
    args: { ownerId: string; title: string; description: string; config: string }
  ) => Promise<CreateConfigTemplatePayload>
  [AutoOnboardActions.DELETE_TEMPLATE]: (
    this: Store<RootState>,
    injectee: AutoOnboardModuleActionContext,
    args: { shortcode: string }
  ) => Promise<DeleteConfigTemplatePayload>
  [AutoOnboardActions.FETCH_SINGLE_TEMPLATE]: (
    this: Store<RootState>,
    injectee: AutoOnboardModuleActionContext,
    args: { login: string; provider: string; shortcode: boolean; refetch?: boolean }
  ) => Promise<void>
  [AutoOnboardActions.FETCH_TEMPLATES]: (
    this: Store<RootState>,
    injectee: AutoOnboardModuleActionContext,
    args: {
      login: string
      provider: string
      currentPage: number
      limit: number
      q?: string
      refetch?: boolean
    }
  ) => Promise<void>
  [AutoOnboardActions.FETCH_AUTO_ONBOARDABLE_REPO_LIST]: (
    this: Store<RootState>,
    injectee: AutoOnboardModuleActionContext,
    args: {
      login: string
      provider: string
      currentPageNumber: number
      limit: number
      query?: string
      refetch?: boolean
    }
  ) => Promise<void>
  [AutoOnboardActions.START_ONBOARDING]: (
    this: Store<RootState>,
    injectee: AutoOnboardModuleActionContext,
    args: {
      shortcode: string
      repoIds: string[]
    }
  ) => Promise<AutoOnboardPayload>
  [AutoOnboardActions.FETCH_ONBOARDING_EVENT_LIST]: (
    this: Store<RootState>,
    injectee: AutoOnboardModuleActionContext,
    args: { login: string; provider: string; refetch?: boolean }
  ) => Promise<void>
  [AutoOnboardActions.UPDATE_TEMPLATE]: (
    this: Store<RootState>,
    injectee: AutoOnboardModuleActionContext,
    args: { shortcode: string; title: string; description: string; config: string }
  ) => Promise<UpdateConfigTemplatePayload>
}

export const actions: AutoOnboardModuleActions = {
  async [AutoOnboardActions.CREATE_TEMPLATE](_, args) {
    const response = await this.$applyGraphqlMutation(createConfigTemplate, args)
    return response.data.createConfigTemplate
  },
  async [AutoOnboardActions.DELETE_TEMPLATE](_, args) {
    const response = await this.$applyGraphqlMutation(deleteConfigTemplate, args)
    return response.data.deleteConfigTemplate
  },
  async [AutoOnboardActions.FETCH_SINGLE_TEMPLATE]({ commit }, args) {
    try {
      const response = await this.$fetchGraphqlData(
        getTemplateDetails,
        {
          login: args.login,
          shortcode: args.shortcode,
          provider: this.$providerMetaMap[args.provider].value
        },
        args.refetch
      )
      commit(AutoOnboardMutations.SET_CONFIG_TEMPLATE, response.data.owner.configTemplate)
    } catch (e) {
      this.$toast.danger('There was an error fetching')
    }
  },
  async [AutoOnboardActions.FETCH_TEMPLATES]({ commit }, args) {
    try {
      const response = await this.$fetchGraphqlData(
        getTemplatesList,
        {
          login: args.login,
          after: this.$getGQLAfter(args.currentPage, args.limit),
          limit: args.limit,
          provider: this.$providerMetaMap[args.provider].value,
          q: args.q
        },
        args.refetch
      )
      commit(AutoOnboardMutations.SET_CONFIG_TEMPLATE_LIST, response.data.owner.configTemplates)
    } catch (e) {
      this.$toast.danger('There was an error fetching templates')
    }
  },
  async [AutoOnboardActions.FETCH_ONBOARDING_EVENT_LIST]({ commit }, args) {
    try {
      const response = await this.$fetchGraphqlData(
        getAutoOnboardEventsList,
        {
          login: args.login,
          provider: this.$providerMetaMap[args.provider].value
        },
        args.refetch
      )
      commit(AutoOnboardMutations.SET_EVENT_LIST, response.data.owner.autoonboardingEvents)
    } catch (e) {
      this.$toast.danger('There was an error fetching')
    }
  },
  async [AutoOnboardActions.FETCH_AUTO_ONBOARDABLE_REPO_LIST]({ commit }, args) {
    try {
      const response = await this.$fetchGraphqlData(
        getAutoOnboardableRepositoriesList,
        {
          login: args.login,
          provider: this.$providerMetaMap[args.provider].value,
          after: this.$getGQLAfter(args.currentPageNumber, args.limit),
          limit: args.limit,
          query: args.query
        },
        args.refetch
      )
      commit(AutoOnboardMutations.SET_ONBOARDABLE_REPOS, response.data.owner.repoList)
    } catch (e) {
      this.$toast.danger('There was an error fetching')
    }
  },
  async [AutoOnboardActions.START_ONBOARDING](_, args) {
    const response = await this.$applyGraphqlMutation(autoOnboard, args)
    return response.data.autoOnboard
  },
  async [AutoOnboardActions.UPDATE_TEMPLATE](_, args) {
    const response = await this.$applyGraphqlMutation(updateConfigTemplate, args)
    return response.data.updateConfigTemplate
  }
}

export const state = (): AutoOnboardState => ({
  configTemplate: undefined,
  configTemplateList: [],
  totalTemplates: 0,
  onboardableRepositories: [],
  autoOnboardEvents: [],
  repositoriesToOnboard: [],
  selectedTemplate: undefined,
  hasMoreReposToOnboard: true
})
