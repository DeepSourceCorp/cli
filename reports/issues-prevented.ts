import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import {
  IHandledResponse,
  IReportInfo,
  IssueDistributionT,
  ReportMeta,
  ReportPageT
} from '~/types/reportTypes'
import { Report } from '~/types/types'

const reportKey = ReportPageT.ISSUES_PREVENTED

export default {
  key: reportKey,
  query: 'pinnedReportData',
  componentName: 'PinnedChartReport',
  handleResponse: (response: GraphqlQueryResponse, filter: IssueDistributionT) => {
    const { report } = response.data

    const handledResponse: IHandledResponse = {
      label: ReportMeta[reportKey].title,
      value: report?.currentValue ?? 0,
      valueLabel: 'issues prevented'
    }

    const { historicalValues } = report as Report
    const analyzerValues = historicalValues?.values?.analyzer

    if (analyzerValues && filter === IssueDistributionT.ANALYZER) {
      handledResponse.datasets = Object.keys(analyzerValues).map((analyzer) => {
        return { name: analyzer, chartType: 'bar', values: analyzerValues[analyzer] }
      })
    }

    const categoryValues = historicalValues?.values?.category

    if (categoryValues && filter === IssueDistributionT.CATEGORY) {
      handledResponse.datasets = Object.keys(categoryValues).map((category) => {
        return { name: category, chartType: 'bar', values: categoryValues[category] }
      })
    }

    handledResponse.historicalValues = historicalValues

    return handledResponse
  }
} as IReportInfo
