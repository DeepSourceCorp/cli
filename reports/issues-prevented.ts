import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import {
  IHandledResponse,
  IReportInfo,
  IssueDistributionT,
  ReportMeta,
  ReportPageT
} from '~/types/reportTypes'
import { Report } from '~/types/types'
import { getFormattedDistributionChartData } from '~/utils/reports'

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
      valueLabel: report?.currentValue === 1 ? 'issue prevented' : 'issues prevented'
    }

    const { historicalValues } = report as Report
    const analyzerValues = historicalValues?.values?.analyzer

    if (analyzerValues && filter === IssueDistributionT.ANALYZER) {
      const [dataset, othersDatasetNames] = getFormattedDistributionChartData(
        analyzerValues,
        reportKey
      )

      handledResponse.datasets = dataset
      handledResponse.othersDatasetNames = othersDatasetNames
    }

    const categoryValues = historicalValues?.values?.category

    if (categoryValues && filter === IssueDistributionT.CATEGORY) {
      const [dataset, othersDatasetNames] = getFormattedDistributionChartData(
        categoryValues,
        reportKey
      )

      handledResponse.datasets = dataset
      handledResponse.othersDatasetNames = othersDatasetNames
    }

    handledResponse.historicalValues = historicalValues

    return handledResponse
  }
} as IReportInfo
