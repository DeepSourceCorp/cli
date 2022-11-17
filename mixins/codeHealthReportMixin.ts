import { Component, mixins } from 'nuxt-property-decorator'
import {
  Dataset,
  CodeHealthTrendMeta,
  CodeHealthTrendT,
  HistoricalValues
} from '~/types/reportTypes'

import ReportMixin from './reportMixin'

/**
 * Mixin for code health trend report utilities
 */
@Component({})
export default class CodeHealthReportMixin extends mixins(ReportMixin) {
  /**
   * Method to format historical values according to requirements of code health trend chart
   *
   * @param {HistoricalValues} historicalValues
   * @returns {Array<Dataset>}
   */
  public formatCodeHealthChartData(historicalValues: HistoricalValues): Array<Dataset> {
    const codeHealthDatasets: Array<Dataset> = []

    Object.keys(CodeHealthTrendMeta).forEach((trend) => {
      // Extract trend values from historicalValues for a particular trend
      // vis-à-vis active, resolved and net
      let trendValues = historicalValues.values[trend] as Array<number>

      if (Array.isArray(trendValues)) {
        // Convert all resolved issue counts to -ve
        if (trend === CodeHealthTrendT.RESOLVED) {
          trendValues = trendValues.map((trend) => -trend)
        }

        // All other properties for dataset are coming from CodeHealthTrendMeta
        // Only values are being assigned as extracted from historicalValues
        const trendDataset: Dataset = {
          ...CodeHealthTrendMeta[trend as CodeHealthTrendT],
          values: trendValues
        }

        codeHealthDatasets.push(trendDataset)
      }
    })

    return codeHealthDatasets
  }

  get emptyCodeHealthChartDataSet(): Dataset[] {
    return [
      { name: 'ACTIVE ISSUES', chartType: 'bar', values: [17, 19, 12, 9, 14, 5, 5, 4] },
      { name: 'RESOLVED ISSUES', chartType: 'bar', values: [-17, -15, -19, -11, -12, 0, -4, -2] },
      { name: 'NET NEW ISSUES', chartType: 'line', values: [0, 4, -7, -2, 2, 5, 1, 2] }
    ]
  }
}
