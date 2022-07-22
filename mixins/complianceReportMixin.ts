import { Component, mixins } from 'nuxt-property-decorator'
import { ReportStatus } from '~/types/types'
import ReportMixin from './reportMixin'

/**
 * Mixin for compliance report utilities
 */
@Component({})
export default class ComplianceReportMixin extends mixins(ReportMixin) {
  get shouldChartBeShown(): boolean {
    if (this.historicalValuesLoading) return false
    if (this.labels.length < 2) return false
    if (this.datasets.length === 0) return false

    return true
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
