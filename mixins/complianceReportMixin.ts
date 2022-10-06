import { Component, mixins } from 'nuxt-property-decorator'
import {
  ComplianceIssue,
  ComplianceIssueOccurrence,
  ReportLevel,
  ReportStatus
} from '~/types/types'
import { complianceIssues } from '@/apollo/queries/reports/complianceIssues.gql'
import ReportMixin from './reportMixin'
import { GraphqlQueryResponse } from '~/types/apolloTypes'
import { ReportPageT } from '~/types/reportTypes'

/**
 * Mixin for compliance report utilities
 */
@Component({})
export default class ComplianceReportMixin extends mixins(ReportMixin) {
  /**
   * Fetch and set compliance issues of a compliance report.
   *
   * @param {ReportLevel} level
   * @param {string} objectId
   * @param {ReportPageT} reportKey
   */
  public async fetchComplianceIssues(level: ReportLevel, objectId: string, reportKey: ReportPageT) {
    if (objectId && level && reportKey) {
      const isOwasp = reportKey === ReportPageT.OWASP_TOP_10

      this.complianceIssuesLoading = true
      try {
        const response = (await this.$fetchGraphqlData(complianceIssues, {
          level,
          objectId,
          reportKey,
          isOwasp
        })) as GraphqlQueryResponse

        this.complianceIssueList = response.data?.complianceIssues as Array<ComplianceIssue>
        this.complianceIssuesSeverityMap = response.data
          ?.complianceIssuesSeverityMap as ComplianceIssueOccurrence
      } catch (e) {
        this.$logErrorAndToast(
          e as Error,
          'Unable to fetch security issues list, please contact support.'
        )
      } finally {
        this.complianceIssuesLoading = false
      }
    }
  }

  get shouldChartBeShown(): boolean {
    return !(this.historicalValuesLoading || this.labels.length < 2 || this.datasets.length === 0)
  }

  get compliancePassed(): boolean {
    return this.report?.status === ReportStatus.Passing
  }

  get currentVal(): number {
    return this.report?.currentValue ?? 0
  }

  get chartColors(): Array<string> {
    return this.compliancePassed ? ['juniper-500'] : ['cherry-500']
  }
}
