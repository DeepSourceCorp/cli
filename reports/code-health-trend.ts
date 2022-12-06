import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import {
  IHandleResponse,
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

    const handledResponse: IHandleResponse = {
      label: ReportMeta[reportKey].title,
      value: report?.currentValue ?? 0,
      valueLabel: 'net new issues'
    }

    const { historicalValues } = report as { historicalValues: HistoricalValues }
    handledResponse.datasets = getFormattedCodeHealthChartData(historicalValues)

    handledResponse.historicalValues = historicalValues

    return handledResponse
  }
} as IReportInfo
