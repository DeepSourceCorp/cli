import { DurationTypeT } from '~/utils/date'
import { smartApostrophe } from '~/utils/string'
import { PublicReport, ReportType } from './types'

export type ReportCopyTextT = {
  summary: string | null
  intendedUse: string | null
}

export type ReportMetaProperties = {
  title: string
  description: string
  type?: ReportType
  copyText: (companyName: string) => ReportCopyTextT
}

export enum ReportPageT {
  OWASP_TOP_10 = 'owasp-top-10',
  SANS_TOP_25 = 'sans-top-25',
  DISTRIBUTION = 'issue-distribution',
  PUBLIC_REPORTS = 'public-reports',
  CODE_COVERAGE = 'code-coverage'
}

export const ReportMeta: Record<ReportPageT, ReportMetaProperties> = {
  [ReportPageT.OWASP_TOP_10]: {
    title: 'OWASP Top 10',
    description: 'Overview of OWASP Top 10 security risks in your code.',
    type: ReportType.Compliance,
    copyText: (companyName) => {
      return {
        summary: `<h1 id="summary" class="text-lg text-vanilla-100 font-semibold scroll-mt-8">Summary</h1>
        <p>
          The Open Web Application Security Project Foundation, or OWASP Foundation, is a non-profit
          foundation dedicated to improving software security. The foundation is community-driven and
          helps organizations build secure software through open-source tools, resources, and
          research. The OWASP Top 10 is a recommendation framework maintained by the OWASP Foundation
          since 2003. The list is a collection of security recommendations that helps organizations to
          write more secure code. It is updated periodically to accommodate for the advancements and
          developments in application security. More information on OWASP Top 10 can be found
          <a
            href="https://deepsource.io/guides/owasp-top-10/"
            rel="nofollow noopener noreferrer"
            target="_blank"
            class="text-juniper-500 font-medium"
            >here</a
          >.
        </p>
        <p>
          DeepSource continuously scans ${smartApostrophe(
            companyName
          )} source code continuously to detect violations
          of OWASP Top 10 recommendations and provides guidance to correct them. This report provides
          the current, as well as a historical snapshot of the presence of such vulnerabilities in
          ${smartApostrophe(
            companyName
          )} source code, limited to the repositories, tracked on DeepSource.
        </p>`,
        intendedUse: ` <h1 id="intended-use" class="text-lg text-vanilla-100 font-semibold scroll-mt-8">Intended use of this report</h1>
        <p>
          This report can be used by the ${companyName} team to identify and remediate violations of
          OWASP Top 10 recommendations in their source code. The report can also be used by key
          stakeholders within the organization and interested external stakeholders to understand the
          source code security posture of ${companyName}.
        </p>`
      }
    }
  },
  [ReportPageT.SANS_TOP_25]: {
    title: 'SANS Top 25',
    description: 'Overview of CWE/SANS Top 25 most dangerous software errors in your code.',
    type: ReportType.Compliance,
    copyText: (companyName) => {
      return {
        summary: `<h1 id="summary" class="text-lg text-vanilla-100 font-semibold scroll-mt-8">Summary</h1>
        <p>
          The SANS Institute was founded in 1989 as a cooperative for information security thought
          leadership. The CWE (Common Weakness Enumeration) / SANS Top 25 list is a well-known list
          of the most common and severe errors in software that can lead to serious security
          vulnerabilities. The list is used by organizations as a primer to ensure their source code
          is secure.
        </p>
        <p>
          DeepSource continuously scans ${companyName}’s source code continuously to detect violations
          of SANS Top 25 recommendations and provides guidance to correct them. This report provides
          the current, as well as a historical snapshot of the presence of such vulnerabilities in
          ${companyName}’s source code, limited to the repositories, tracked on DeepSource.
        </p>`,
        intendedUse: `<h1 id="intended-use" class="text-lg text-vanilla-100 font-semibold scroll-mt-8">Intended use of this report</h1>
        <p>
          This report can be used by the ${companyName} team to identify and remediate violations of
          SANS Top 25 recommendations in their source code. The report can also be used by key
          stakeholders within the organization and interested external stakeholders to understand the
          source code security posture of ${companyName}.
        </p>`
      }
    }
  },
  [ReportPageT.DISTRIBUTION]: {
    title: 'Issue Distribution',
    description: 'Overview of issues found across categories and Analyzers.',
    type: ReportType.Insight,
    copyText: (companyName) => {
      return {
        summary: `<h1 id="summary" class="text-lg text-vanilla-100 font-semibold scroll-mt-8">Summary</h1>
        <p>
            DeepSource continuously scans ${smartApostrophe(
              companyName
            )} source code to detect code health issues and
            provides guidance to correct them. This report provides the current and historical snapshot of code health issues in
            ${smartApostrophe(
              companyName
            )} source code, limited to the repositories tracked on DeepSource. The code health
            issue detected by DeepSource includes, but is not limited to, these categories: bug risks, anti-patterns, style
            violations, performance issues, code coverage issues, and so on.
        </p>
        `,
        intendedUse: `<h1 id="intended-use" class="text-lg text-vanilla-100 font-semibold scroll-mt-8">Intended use of this report</h1>
        <p>
            This report can be used by the ${companyName} team to identify and remediate code health issues in their code base
            and make it more maintainable. The report can also be used by key internal and external stakeholders to understand
            the code quality and maintainability of ${companyName}.
        </p>`
      }
    }
  },
  [ReportPageT.CODE_COVERAGE]: {
    title: 'Code Coverage',
    description: 'Track code coverage across your organization.',
    type: ReportType.Insight,
    copyText: (companyName) => {
      return {
        summary: `<h1 id="summary" class="text-lg text-vanilla-100 font-semibold scroll-mt-8">Summary</h1>
        <p>
            DeepSource integrates with ${smartApostrophe(
              companyName
            )} continuous integration (CI) system to track their
            source code's coverage generated after running the automated tests and helps them take action to improve it. This report provides the
            current and historical snapshot of code coverage metrics for ${smartApostrophe(
              companyName
            )} source code, limited
            to the repositories tracked on DeepSource.
        </p>`,
        intendedUse: `<h1 id="intended-use" class="text-lg text-vanilla-100 font-semibold scroll-mt-8">Intended use of this report</h1>
        <p>
            This report can be used by the ${companyName} team to identify and remediate gaps in code not covered by any
            automated tests and make it more stable and maintainable. The report can also be used by key internal and external
            stakeholders to understand the stability of ${smartApostrophe(companyName)} software.
        </p>`
      }
    }
  },
  [ReportPageT.PUBLIC_REPORTS]: {
    title: 'Public Reports',
    description: '',
    copyText: () => {
      return {
        summary: ``,
        intendedUse: ``
      }
    }
  }
}

export type ComplianceIssueOccurences = {
  high?: number
  medium?: number
  low?: number
  totalValue: number
}

export type DateRangeOptionT = {
  count: number
  durationType: DurationTypeT
}

export interface Dataset {
  name: string
  values: number[]
  chartType?: string
}

export interface HistoricalValues {
  labels: Array<string>
  values: Record<string, Array<number> & Record<string, Array<number>>>
}

export enum IssueDistributionT {
  CATEGORY = 'category',
  ANALYZER = 'analyzer'
}

export interface ReportsTabLink {
  key: ReportPageT
  label: string
  link: string[]
}

export enum PublicReportErrors {
  AUTH_REQUIRED = 'auth-required',
  INVALID_PASSWORD = 'invalid-password',
  INVALID_TOKEN = 'invalid-token',
  DOES_NOT_EXIST = 'does-not-exist'
}

export type ReportSortT = 'first-created' | 'last-created'

export type ReportToEditT = {
  reportId: PublicReport['reportId']
  isRestricted: PublicReport['isRestricted']
  reportKeys?: PublicReport['reportKeys']
  shareHistoricalData: PublicReport['shareHistoricalData']
  label: PublicReport['label']
  source?: PublicReport['source']
  sourcedRepositories?: PublicReport['sourcedRepositories']
}

export enum CoverageSortT {
  LCV_ASCENDING = 'lcv-asc',
  LCV_DESCENDING = 'lcv-desc',
  BCV_ASCENDING = 'bcv-asc',
  BCV_DESCENDING = 'bcv-desc'
}

export enum CodeCoverageT {
  LCV = 'lcv',
  BCV = 'bcv'
}
