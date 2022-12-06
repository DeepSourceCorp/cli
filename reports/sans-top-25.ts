import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import {
  IHandleResponse,
  HistoricalValues,
  IReportInfo,
  ReportMeta,
  ReportPageT
} from '~/types/reportTypes'
import { ReportStatus } from '~/types/types'

const reportKey = ReportPageT.SANS_TOP_25

export default {
  key: reportKey,
  query: 'pinnedReportData',
  componentName: 'PinnedChartReport',
  handleResponse: (response: GraphqlQueryResponse) => {
    const { report } = response.data

    const handledResponse: IHandleResponse = {
      label: ReportMeta[reportKey].title,
      value: report?.currentValue ?? 0,
      valueLabel: 'active issues',
      compliancePassing: report?.status === ReportStatus.Passing
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
