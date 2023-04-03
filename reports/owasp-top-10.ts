import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import {
  IHandledResponse,
  HistoricalValues,
  IReportInfo,
  ReportMeta,
  ReportPageT
} from '~/types/reportTypes'
import { ReportStatus } from '~/types/types'
import { getFormattedComplianceChartData } from '~/utils/reports'

const reportKey = ReportPageT.OWASP_TOP_10

export default {
  key: reportKey,
  query: 'pinnedReportData',
  componentName: 'PinnedChartReport',
  handleResponse: (response: GraphqlQueryResponse) => {
    const { report } = response.data

    const compliancePassing = report?.status === ReportStatus.Passing

    const handledResponse: IHandledResponse = {
      compliancePassing,
      label: ReportMeta[reportKey].title,
      value: report?.currentValue ?? 0,
      valueLabel: report?.currentValue === 1 ? 'active issue' : 'active issues'
    }

    const { historicalValues } = report as { historicalValues: HistoricalValues }
    if (Array.isArray(historicalValues.values.count)) {
      handledResponse.datasets = getFormattedComplianceChartData(historicalValues)
    }

    handledResponse.historicalValues = historicalValues

    return handledResponse
  }
} as IReportInfo
