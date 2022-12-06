import { Component, mixins } from 'nuxt-property-decorator'
import { Dataset } from '~/types/reportTypes'

import ReportMixin from './reportMixin'

/**
 * Mixin for code health trend report utilities
 */
@Component({})
export default class CodeHealthReportMixin extends mixins(ReportMixin) {
  get emptyCodeHealthChartDataSet(): Dataset[] {
    return [
      { name: 'ACTIVE ISSUES', chartType: 'bar', values: [17, 19, 12, 9, 14, 5, 5, 4] },
      { name: 'RESOLVED ISSUES', chartType: 'bar', values: [-17, -15, -19, -11, -12, 0, -4, -2] },
      { name: 'NET NEW ISSUES', chartType: 'line', values: [0, 4, -7, -2, 2, 5, 1, 2] }
    ]
  }
}
