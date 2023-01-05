import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import {
  IHandledResponse,
  HistoricalValues,
  IReportInfo,
  ReportMeta,
  ReportPageT
} from '~/types/reportTypes'
import { getFormattedIssuesAutofixedChartData } from '~/utils/reports'

const reportKey = ReportPageT.ISSUES_AUTOFIXED

export default {
  key: reportKey,
  query: 'pinnedReportData',
  componentName: 'PinnedChartReport',
  handleResponse: (response: GraphqlQueryResponse) => {
    const { report } = response.data

    const handledResponse: IHandledResponse = {
      label: ReportMeta[reportKey].title,
      value: report?.currentValue ?? 0,
      valueLabel: 'issues autofixed'
    }

    const { historicalValues } = report as { historicalValues: HistoricalValues }

    handledResponse.datasets = getFormattedIssuesAutofixedChartData(historicalValues)

    handledResponse.historicalValues = historicalValues

    return handledResponse
  }
} as IReportInfo
