import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import {
  IHandledResponse,
  HistoricalValues,
  IReportInfo,
  ReportMeta,
  ReportPageT
} from '~/types/reportTypes'
import { ReportStatus } from '~/types/types'

const reportKey = ReportPageT.OWASP_TOP_10

export default {
  key: reportKey,
  query: 'pinnedReportData',
  componentName: 'PinnedChartReport',
  handleResponse: (response: GraphqlQueryResponse) => {
    const { report } = response.data

    const handledResponse: IHandledResponse = {
      compliancePassing: report?.status === ReportStatus.Passing,
      label: ReportMeta[reportKey].title,
      value: report?.currentValue ?? 0,
      valueLabel: 'active issues'
    }

    const { historicalValues } = report as { historicalValues: HistoricalValues }
    if (Array.isArray(historicalValues.values.count)) {
      handledResponse.datasets = [
        {
          name: 'Active Issues',
          values: historicalValues.values.count
        }
      ]
    }

    handledResponse.historicalValues = historicalValues

    return handledResponse
  }
} as IReportInfo
