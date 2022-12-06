import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import { IHandleResponse, IReportInfo, ReportMeta, ReportPageT } from '~/types/reportTypes'
import { RepositoryCoverageReportItem } from '~/types/types'
import { resolveNodes } from '~/utils/array'

const reportKey = ReportPageT.CODE_COVERAGE

export default {
  key: reportKey,
  query: 'codeCoverage',
  componentName: 'PinnedCodeCoverageReport',
  handleResponse: (response: GraphqlQueryResponse) => {
    const handledResponse: IHandleResponse = {
      label: ReportMeta[reportKey].title,
      coverageList:
        (resolveNodes(
          response.data.owner?.repositoriesCoverageReport
        ) as Array<RepositoryCoverageReportItem>) ?? []
    }

    return handledResponse
  }
} as IReportInfo
