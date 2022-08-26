import { Component, mixins } from 'nuxt-property-decorator'
import { ReportStatus } from '~/types/types'
import ReportMixin from './reportMixin'

/**
 * Mixin for compliance report utilities
 */
@Component({})
export default class ComplianceReportMixin extends mixins(ReportMixin) {
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
