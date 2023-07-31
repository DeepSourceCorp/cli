import { Component, mixins } from 'nuxt-property-decorator'

import RepositoryLevelAuditLogGQLQuery from '~/apollo/queries/repository/settings/auditLog.gql'
import TeamLevelAuditLogGQLQuery from '~/apollo/queries/team/auditLog.gql'

import ExportAuditLogsGQLMutation from '~/apollo/mutations/audit-log/exportAuditLogs.gql'

import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import { AuditLogLevel } from '~/types/auditLog'
import { DateRangeOptionT } from '~/types/reportTypes'
import {
  AuditLog,
  AuditLogConnection,
  ExportAuditLogsInput,
  Maybe,
  Repository,
  Team,
  VcsProviderChoices
} from '~/types/types'

import { resolveNodes } from '~/utils/array'
import { dateRangeOptions, getDateRange } from '~/utils/reports'

import { OwnerFeatureType } from '~/types/ownerTypes'
import ActiveUserMixin from './activeUserMixin'

// Refers to the `apollo/queries/repository/settings/auditLog.gql` GQL query
interface CustomRepositoryLevelAuditLogQuery extends Repository {
  fullLogs: Maybe<AuditLogConnection>
}

// Refers to the `apollo/queries/team/auditLog.gql` GQL query
interface CustomTeamLevelAuditLogQuery extends Team {
  fullLogs: Maybe<AuditLogConnection>
}

type BaseQueryArgsT = {
  after: string
  first: number
  createdAtGte: string
  createdAtLte: string
  provider: VcsProviderChoices
  q: string
}

type OptionalQueryArgsT =
  | {
      login: string
    }
  | {
      owner: string
      name: string
    }

type QueryArgsT = BaseQueryArgsT & OptionalQueryArgsT

@Component({})
export default class AuditLogMixin extends mixins(ActiveUserMixin) {
  pageNumber = 1
  perPageCount = 30
  totalCount = 0

  auditLogEnabled = true
  auditLogListLoading = false
  exportLogsLoading = false
  showExportLogsSuccessModal = false

  dateRange = '3m'
  level = ''
  objectId = ''
  searchQuery = ''

  dateRangeOptions: Record<string, DateRangeOptionT> = dateRangeOptions

  auditLogItems = [] as Array<AuditLog>

  get auditLogPageProps() {
    return {
      auditLogItems: this.auditLogItems,
      auditLogListLoading: this.auditLogListLoading,
      dateRange: this.dateRange,
      exportLogsLoading: this.exportLogsLoading,
      pageNumber: this.pageNumber,
      searchQuery: this.searchQuery,
      showExportLogsSuccessModal: this.showExportLogsSuccessModal,
      totalCount: this.totalCount,
      viewerEmail: this.viewer.email,
      level: this.level,
      auditLogEnabled: this.auditLogEnabled
    }
  }

  async fetch() {
    this.auditLogListLoading = true

    await this.fetchOwnerFeatures()

    // If the feature isn't enabled for the team, return early since it isn't required to fetch Audit log events
    if (!this.auditLogEnabled) {
      this.auditLogListLoading = false
      return
    }

    await this.fetchAuditLogItems()

    if (!this.viewer?.email) {
      await this.fetchActiveUser()
    }
  }

  async exportLogs() {
    try {
      this.exportLogsLoading = true

      const { startDate: createdAtGte, endDate: createdAtLte } = getDateRange(this.dateRange)

      const args: ExportAuditLogsInput = {
        objectId: this.objectId,
        createdAtGte,
        createdAtLte
      }

      const response = await this.$applyGraphqlMutation(ExportAuditLogsGQLMutation, { input: args })
      if (response.data.exportAuditLogs.ok) {
        this.showExportLogsSuccessModal = true
      }
    } catch (err) {
      this.$toast.danger((err as Error).message.replace('GraphQL error: ', ''))
    } finally {
      this.exportLogsLoading = false
    }
  }

  async fetchOwnerFeatures() {
    try {
      this.auditLogEnabled = await this.$isFeatureAvailable(OwnerFeatureType.AUDIT_LOG, {
        login: this.$route.params.owner,
        provider: this.$providerMetaMap[this.$route.params.provider].value
      })
    } catch (error) {
      this.$logErrorAndToast(
        error as Error,
        'Unable to fetch details about the team. Please contact support.'
      )
    }
  }

  async fetchAuditLogItems({
    dateRangeFromEmit,
    searchQueryFromEmit,
    pageNumberFromEmit
  }: {
    dateRangeFromEmit?: string
    searchQueryFromEmit?: string
    pageNumberFromEmit?: number
  } = {}) {
    try {
      this.auditLogListLoading = true

      this.dateRange = dateRangeFromEmit ?? this.dateRange
      this.searchQuery = searchQueryFromEmit ?? this.searchQuery
      this.pageNumber = pageNumberFromEmit || this.pageNumber

      const args = this.getQueryArgs()

      const gqlQueryMap = {
        [AuditLogLevel.Repository]: RepositoryLevelAuditLogGQLQuery,
        [AuditLogLevel.Team]: TeamLevelAuditLogGQLQuery
      }

      const response: GraphqlQueryResponse = await this.$fetchGraphqlData(
        gqlQueryMap[this.level as AuditLogLevel],
        args
      )

      if (this.level === AuditLogLevel.Team) {
        this.objectId = response.data.team?.id as string

        this.auditLogItems = resolveNodes(response?.data?.team?.logs as AuditLogConnection)

        this.totalCount =
          (response.data.team as CustomTeamLevelAuditLogQuery).fullLogs?.totalCount ?? 0
      } else {
        this.objectId = response.data.repository?.id as string

        this.auditLogItems = resolveNodes(response?.data?.repository?.logs as AuditLogConnection)

        this.totalCount =
          (response.data.repository as CustomRepositoryLevelAuditLogQuery).fullLogs?.totalCount ?? 0
      }
    } catch (err) {
      this.$toast.danger((err as Error).message.replace('Graphql error:', ''))
    } finally {
      this.auditLogListLoading = false
    }
  }

  getQueryArgs(): QueryArgsT {
    const provider = this.$providerMetaMap[this.$route.params.provider].value
    const { owner, repo } = this.$route.params

    const { startDate: createdAtGte, endDate: createdAtLte } = getDateRange(this.dateRange)

    const baseArgs: BaseQueryArgsT = {
      provider,
      first: this.perPageCount,
      after: this.$getGQLAfter(this.pageNumber, this.perPageCount),
      createdAtGte,
      createdAtLte,
      q: this.searchQuery
    }

    const optionalArgs: OptionalQueryArgsT =
      this.level === AuditLogLevel.Team ? { login: owner } : { owner, name: repo }

    return {
      ...baseArgs,
      ...optionalArgs
    }
  }
}
