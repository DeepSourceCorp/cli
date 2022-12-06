import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import {
  IHandleResponse,
  HistoricalValues,
  IReportInfo,
  ReportMeta,
  ReportPageT
} from '~/types/reportTypes'

const reportKey = ReportPageT.ISSUES_AUTOFIXED

export default {
  key: reportKey,
  query: 'pinnedReportData',
  componentName: 'PinnedChartReport',
  handleResponse: (response: GraphqlQueryResponse) => {
    const { report } = response.data

    const handledResponse: IHandleResponse = {
      label: ReportMeta[reportKey].title,
      value: report?.currentValue ?? 0,
      valueLabel: 'issues autofixed'
    }

    const { historicalValues } = report as { historicalValues: HistoricalValues }

    const prValues = (historicalValues.values.pr ?? []) as Array<number>
    const defaultBranchValues = (historicalValues.values.default_branch ?? []) as Array<number>

    handledResponse.datasets = [
      {
        name: 'Fixed in Pull Requests',
        values: prValues,
        chartType: 'bar'
      },
      {
        name: 'Fixed in Default Branch',
        values: defaultBranchValues,
        chartType: 'bar'
      }
    ]

    handledResponse.historicalValues = historicalValues

    return handledResponse
  }
} as IReportInfo
