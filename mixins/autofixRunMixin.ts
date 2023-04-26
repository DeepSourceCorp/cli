import { Component, Vue, namespace } from 'nuxt-property-decorator'
import { AutofixRunListActions } from '~/store/autofixRun/list'
import { AutofixRun, AutofixRunStatus, AutofixRunConnection } from '~/types/types'

const autofixRunListStore = namespace('autofixRun/list')

@Component
export default class AutofixRunMixin extends Vue {
  @autofixRunListStore.State
  autofixRunList!: AutofixRunConnection

  @autofixRunListStore.State
  pendingAutofixList: AutofixRun[]

  @autofixRunListStore.Action(AutofixRunListActions.FETCH_AUTOFIX_RUN_LIST)
  fetchAutofixRunList: (args: {
    provider: string
    owner: string
    name: string
    limit?: number
    statusIn?: AutofixRunStatus[]
    refetch?: boolean
  }) => Promise<void>

  @autofixRunListStore.Action(AutofixRunListActions.FETCH_PENDING_AUTOFIX_RUNS)
  fetchPendingAutofixRuns: (args: {
    provider: string
    owner: string
    name: string
    refetch?: boolean
  }) => Promise<void>
}
