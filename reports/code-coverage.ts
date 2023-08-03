import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import { IHandledResponse, IReportInfo, ReportMeta, ReportPageT } from '~/types/reportTypes'
import { resolveNodes } from '~/utils/array'

const reportKey = ReportPageT.CODE_COVERAGE

export default {
  key: reportKey,
  query: 'codeCoverage',
  componentName: 'PinnedCodeCoverageReport',
  handleResponse: (response: GraphqlQueryResponse) => {
    const handledResponse: IHandledResponse = {
      label: ReportMeta[reportKey].title,
      coverageList: resolveNodes(response.data.owner?.repositoriesCoverageReport) ?? []
    }

    return handledResponse
  }
} as IReportInfo