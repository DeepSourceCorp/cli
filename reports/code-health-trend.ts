import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import {
  IHandledResponse,
  HistoricalValues,
  IReportInfo,
  ReportMeta,
  ReportPageT
} from '~/types/reportTypes'
import { getFormattedCodeHealthChartData } from '~/utils/reports'

const reportKey = ReportPageT.CODE_HEALTH_TREND

export default {
  key: reportKey,
  query: 'pinnedReportData',
  componentName: 'PinnedChartReport',
  handleResponse: (response: GraphqlQueryResponse) => {
    const { report } = response.data

    const handledResponse: IHandledResponse = {
      label: ReportMeta[reportKey].title,
      value: report?.currentValue ?? 0,
      valueLabel: report?.currentValue === 1 ? 'net new issue' : 'net new issues'
    }

    const { historicalValues } = report as { historicalValues: HistoricalValues }
    handledResponse.datasets = getFormattedCodeHealthChartData(historicalValues)

    handledResponse.historicalValues = historicalValues

    return handledResponse
  }
} as IReportInfo
