import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { AutoOnboardActions, AutoOnboardMutations } from '~/store/owner/autoOnboard'
import {
  AutoOnboardEvent,
  AutoOnboardPayload,
  ConfigTemplate,
  CreateConfigTemplatePayload,
  DeleteConfigTemplatePayload,
  Repository,
  UpdateConfigTemplatePayload
} from '~/types/types'

const autoOnboard = namespace('owner/autoOnboard')

@Component
export default class AutoOnboardMixin extends Vue {
  @autoOnboard.State
  onboardableRepositories: Repository[]

  @autoOnboard.State
  hasMoreReposToOnboard: boolean

  @autoOnboard.State
  selectedTemplate?: ConfigTemplate

  @autoOnboard.State
  configTemplate?: ConfigTemplate

  @autoOnboard.State
  autoOnboardEvents: AutoOnboardEvent[]

  @autoOnboard.State
  configTemplateList: ConfigTemplate[]

  @autoOnboard.State
  totalTemplates: number

  @autoOnboard.Action(AutoOnboardActions.FETCH_AUTO_ONBOARDABLE_REPO_LIST)
  fetchAutoOnboardableRepoList: (args: {
    login: string
    provider: string
    currentPageNumber: number
    limit: number
    query?: string
    refetch?: boolean
  }) => void

  @autoOnboard.Action(AutoOnboardActions.CREATE_TEMPLATE)
  createConfigTemplate: (args: {
    ownerId: string
    title: string
    description: string
    config: string
  }) => Promise<CreateConfigTemplatePayload>

  @autoOnboard.Action(AutoOnboardActions.UPDATE_TEMPLATE)
  updateConfigTemplate: (args: {
    shortcode: string
    title: string
    description: string
    config: string
  }) => Promise<UpdateConfigTemplatePayload>

  @autoOnboard.Action(AutoOnboardActions.DELETE_TEMPLATE)
  deleteConfigTemplate: (args: { shortcode: string }) => Promise<DeleteConfigTemplatePayload>

  @autoOnboard.Action(AutoOnboardActions.FETCH_SINGLE_TEMPLATE)
  fetchSingleTemplate: (args: {
    login: string
    provider: string
    shortcode: string
    refetch?: boolean
  }) => void

  @autoOnboard.Action(AutoOnboardActions.FETCH_ONBOARDING_EVENT_LIST)
  fetchOnboardingEventList: (args: { login: string; provider: string; refetch?: boolean }) => void

  @autoOnboard.Action(AutoOnboardActions.FETCH_TEMPLATES)
  fetchConfigTemplatesList: (args: {
    login: string
    provider: string
    currentPage: number
    limit: number
    q?: string
    refetch?: boolean
  }) => Promise<void>

  @autoOnboard.Mutation(AutoOnboardMutations.SELECT_TEMPLATE_TO_ONBOARD)
  selectTemplateToOnboard: (template?: ConfigTemplate) => void

  @autoOnboard.Action(AutoOnboardActions.START_ONBOARDING)
  startOnboarding: (args: { shortcode: string; repoIds: string[] }) => Promise<AutoOnboardPayload>

  @autoOnboard.Mutation(AutoOnboardMutations.RESET_CONFIG_TEMPLATE)
  resetConfigTemplate: () => void

  async refetchTemplateList(provider?: string, owner?: string): Promise<void> {
    provider = provider ?? this.$route.params.provider
    owner = owner ?? this.$route.params.owner

    await this.fetchConfigTemplatesList({
      provider,
      login: owner,
      limit: 25,
      currentPage: 1,
      refetch: true
    })
  }

  get sortedEvents() {
    const sortOrder = ['OPEN', 'PEND']
    return this.autoOnboardEvents
      .filter((event) => sortOrder.includes(event.status))
      .sort((currentEvent, next) =>
        sortOrder.indexOf(currentEvent.status) < sortOrder.indexOf(next.status) ? -1 : 1
      )
  }

  get hasAutoOnboardEvents(): boolean {
    return this.sortedEvents.length > 0
  }
}
