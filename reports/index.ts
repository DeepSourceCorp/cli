import { IReportInfo, ReportPageT } from '~/types/reportTypes'

import CODE_COVERAGE_INFO from './code-coverage'
import ISSUES_AUTOFIXED_INFO from './issues-autofixed'
import CODE_HEALTH_TREND_INFO from './code-health-trend'
import ISSUE_DISTRIBUTION_INFO from './issue-distribution'
import ISSUES_PREVENTED_INFO from './issues-prevented'
import OWASP_REPORT_INFO from './owasp-top-10'
import SANS_REPORT_INFO from './sans-top-25'

const ReportMap = {
  [ReportPageT.OWASP_TOP_10]: OWASP_REPORT_INFO,
  [ReportPageT.SANS_TOP_25]: SANS_REPORT_INFO,
  [ReportPageT.CODE_HEALTH_TREND]: CODE_HEALTH_TREND_INFO,
  [ReportPageT.DISTRIBUTION]: ISSUE_DISTRIBUTION_INFO,
  [ReportPageT.ISSUES_PREVENTED]: ISSUES_PREVENTED_INFO,
  [ReportPageT.ISSUES_AUTOFIXED]: ISSUES_AUTOFIXED_INFO,
  [ReportPageT.CODE_COVERAGE]: CODE_COVERAGE_INFO
} as Record<ReportPageT, IReportInfo>

export default ReportMap
