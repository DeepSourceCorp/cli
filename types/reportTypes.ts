import { DurationTypeT } from '~/utils/date'
import { smartApostrophe } from '~/utils/string'
import { GraphqlQueryResponse } from './apollo-graphql-types'
import {
  PinnedReport,
  PublicReport,
  ReportLevel,
  ReportType,
  RepositoryCoverageReportItem
} from './types'

// For use in pinnable reports menu items
export enum PinnableReportType {
  COMPLIANCE = 'compliance', // `owasp-top-10` & `sans-top-25`
  DISTRIBUTION = 'distribution-insights', // `issue-distribution` & `issues-prevented`
  NON_DISTRIBUTION = 'non-distribution-insights' // `code-coverage`
}

export type ReportCopyTextT = {
  summary: string | null
  intendedUse: string | null
}

export type ReportMetaProperties = {
  key?: ReportPageT
  title: string
  description: string
  type?: ReportType
  colors?: Array<string>
  bgColors?: Array<string>
  pinnableType?: PinnableReportType // For use in pinnable reports menu items
  helpText?: string
  level: Array<ReportLevel>
  metadataItems?: Array<IReportMetadata>
  copyText: (companyName: string) => ReportCopyTextT
}

export enum ReportPageT {
  OWASP_TOP_10 = 'owasp-top-10',
  SANS_TOP_25 = 'sans-top-25',
  DISTRIBUTION = 'issue-distribution',
  PUBLIC_REPORTS = 'public-reports',
  CODE_COVERAGE = 'code-coverage',
  ISSUES_PREVENTED = 'issues-prevented',
  CODE_HEALTH_TREND = 'code-health-trend',
  ISSUES_AUTOFIXED = 'issues-autofixed'
}

export const ReportMeta: Record<ReportPageT, ReportMetaProperties> = {
  [ReportPageT.OWASP_TOP_10]: {
    title: 'OWASP® Top 10',
    description: 'Overview of OWASP® Top 10 security risks in your code.',
    type: ReportType.Compliance,
    pinnableType: PinnableReportType.COMPLIANCE, // For use in pinnable reports menu items
    helpText: 'Compliance with OWASP®️ Top 10 security standard',
    level: [ReportLevel.Enterprise, ReportLevel.Owner, ReportLevel.Repository],
    copyText: (companyName) => {
      return {
        summary: `<h1 id="summary" class="text-lg text-vanilla-100 font-semibold scroll-mt-8">Summary</h1>
        <p>
          The Open Web Application Security Project Foundation, or OWASP® Foundation, is a non-profit
          foundation dedicated to improving software security. The foundation is community-driven and
          helps organizations build secure software through open-source tools, resources, and
          research. The OWASP® Top 10 is a recommendation framework maintained by the OWASP® Foundation
          since 2003. The list is a collection of security recommendations that helps organizations to
          write more secure code. It is updated periodically to accommodate for the advancements and
          developments in application security. More information on OWASP® Top 10 can be found
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
          )} source code to detect violations
          of OWASP® Top 10 recommendations and provides guidance to correct them. This report provides
          the current, as well as a historical snapshot of the presence of such vulnerabilities in
          ${smartApostrophe(
            companyName
          )} source code, limited to the repositories, tracked on DeepSource.
        </p>`,
        intendedUse: ` <h1 id="intended-use" class="text-lg text-vanilla-100 font-semibold scroll-mt-8">Intended use of this report</h1>
        <p>
          This report can be used by the ${companyName} team to identify and remediate violations of
          OWASP® Top 10 recommendations in their source code. The report can also be used by key
          stakeholders within the organization and interested external stakeholders to understand the
          source code security posture of ${companyName}.
        </p>`
      }
    }
  },
  [ReportPageT.SANS_TOP_25]: {
    title: 'CWE/SANS Top 25',
    description: 'Overview of CWE/SANS Top 25 most dangerous software errors in your code.',
    type: ReportType.Compliance,
    pinnableType: PinnableReportType.COMPLIANCE, // For use in pinnable reports menu items
    helpText: 'Compliance with CWE/SANS Top 25 security standard',
    level: [ReportLevel.Enterprise, ReportLevel.Owner, ReportLevel.Repository],
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
          of CWE/SANS Top 25 recommendations and provides guidance to correct them. This report provides
          the current, as well as a historical snapshot of the presence of such vulnerabilities in
          ${companyName}’s source code, limited to the repositories, tracked on DeepSource.
        </p>`,
        intendedUse: `<h1 id="intended-use" class="text-lg text-vanilla-100 font-semibold scroll-mt-8">Intended use of this report</h1>
        <p>
          This report can be used by the ${companyName} team to identify and remediate violations of
          CWE/SANS Top 25 recommendations in their source code. The report can also be used by key
          stakeholders within the organization and interested external stakeholders to understand the
          source code security posture of ${companyName}.
        </p>`
      }
    }
  },
  [ReportPageT.CODE_HEALTH_TREND]: {
    title: 'Code Health Trend',
    description: 'Net new code health issues introduced in the code base.',
    type: ReportType.Insight,
    colors: ['cherry-500', 'juniper-500', 'robin-500'],
    bgColors: ['bg-cherry-500', 'bg-juniper-500', 'bg-robin-500'],
    pinnableType: PinnableReportType.NON_DISTRIBUTION, // For use in pinnable reports menu items
    helpText: 'Net new code health issues introduced in the code base',
    level: [ReportLevel.Enterprise, ReportLevel.Owner, ReportLevel.Repository],
    copyText: (companyName) => {
      return {
        summary: `<h1 id="summary" class="text-lg text-vanilla-100 font-semibold scroll-mt-8">Summary</h1>
        <p>
            DeepSource continuously scans ${smartApostrophe(
              companyName
            )} source code to detect code health issues. This
            report provides the current and historical snapshot of active, resolved and net new code health issues introduced to
            ${smartApostrophe(
              companyName
            )} source code, limited to the repositories tracked on DeepSource.
        </p>
        `,
        intendedUse: `<h1 id="intended-use" class="text-lg text-vanilla-100 font-semibold scroll-mt-8">Intended use of this report</h1>
        <p>
            This report can be used by the ${companyName} team to track how many new issues are being introduced to the codebase
            and how many existing issues are being resolved. The goal of this report is to provide insights about the net change
            in code health.
        </p>`
      }
    }
  },
  [ReportPageT.DISTRIBUTION]: {
    title: 'Issue Distribution',
    description: 'Overview of issues found across categories and Analyzers.',
    type: ReportType.Insight,
    colors: ['robin-600', 'robin-500', 'robin-400', 'robin-200'],
    bgColors: ['bg-robin-600', 'bg-robin-500', 'bg-robin-400', 'bg-robin-200'],
    pinnableType: PinnableReportType.DISTRIBUTION, // For use in pinnable reports menu items
    helpText: 'Distribution of all code health issues present in the code base',
    level: [ReportLevel.Enterprise, ReportLevel.Owner, ReportLevel.Repository],
    metadataItems: [
      {
        filter: `${ReportPageT.DISTRIBUTION}-analyzer` as ReportMetadataFilterT,
        text: 'By Analyzer'
      },
      {
        filter: `${ReportPageT.DISTRIBUTION}-category` as ReportMetadataFilterT,
        text: 'By Category'
      }
    ],
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
  [ReportPageT.ISSUES_PREVENTED]: {
    title: 'Issues Prevented',
    description: 'Issues prevented from entering the default branch.',
    type: ReportType.Insight,
    colors: ['juniper-600', 'juniper-500', 'juniper-300', 'juniper-100'],
    bgColors: ['bg-juniper-600', 'bg-juniper-500', 'bg-juniper-300', 'bg-juniper-100'],
    pinnableType: PinnableReportType.DISTRIBUTION, // For use in pinnable reports menu items
    helpText: 'Issues you’ve prevented from entering the code base',
    level: [ReportLevel.Enterprise, ReportLevel.Owner, ReportLevel.Repository],
    metadataItems: [
      {
        filter: `${ReportPageT.ISSUES_PREVENTED}-analyzer` as ReportMetadataFilterT,
        text: 'By Analyzer'
      },
      {
        filter: `${ReportPageT.ISSUES_PREVENTED}-category` as ReportMetadataFilterT,
        text: 'By Category'
      }
    ],
    copyText: (companyName) => {
      return {
        summary: `<h1 id="summary" class="text-lg text-vanilla-100 font-semibold scroll-mt-8">Summary</h1>
        <p>
            DeepSource continuously scans ${smartApostrophe(
              companyName
            )} source code to detect code health issues and
            provides guidance to correct them.
        </p>
        <p>
            This report provides information about the effectiveness of ${smartApostrophe(
              companyName
            )} code health efforts by
            showing the number of code health issues the team prevented from being introduced in the code base. The code health
            issues detected by DeepSource include, but are not limited to, these categories: bug risks, anti-patterns, style
            violations, performance issues, code coverage issues, and so on.
        </p>`,
        intendedUse: `<h1 id="intended-use" class="text-lg text-vanilla-100 font-semibold scroll-mt-8">Intended use of this report</h1>
        <p>
            This report can be used by the ${companyName} team to understand the effectiveness of their code health practices,
            prioritize areas of improvement, and chart out a plan of action. Key internal and external stakeholders can also use
            the report to understand the code quality and maintainability of ${companyName}.
        </p>`
      }
    }
  },
  [ReportPageT.ISSUES_AUTOFIXED]: {
    title: 'Issues Autofixed',
    description: 'Issues Autofixed by DeepSource.',
    type: ReportType.Insight,
    colors: ['juniper-500', 'juniper-100'],
    bgColors: ['bg-juniper-500', 'bg-juniper-100'],
    pinnableType: PinnableReportType.NON_DISTRIBUTION, // For use in pinnable reports menu items
    helpText: 'Code health issues automatically fixed with Autofix™',
    level: [ReportLevel.Enterprise, ReportLevel.Owner, ReportLevel.Repository],
    copyText: (companyName) => {
      return {
        summary: `<h1 id="summary" class="text-lg text-vanilla-100 font-semibold scroll-mt-8">Summary</h1>
        <p>
            DeepSource continuously scans ${smartApostrophe(
              companyName
            )} source code to detect code health issues and
            provides guidance to correct them.
        </p>
        <p>
            This report provides information on the number of issues in ${smartApostrophe(
              companyName
            )} codebase, that were
            fixed using Autofix™. The issues fixed by DeepSource using Autofix™ include, but are not limited to, these categories: bug risks, anti-patterns,
            style violations, performance issues, and so on.
        </p>`,
        intendedUse: `<h1 id="intended-use" class="text-lg text-vanilla-100 font-semibold scroll-mt-8">Intended use of this report</h1>
        <p>
            This report can be used by the ${companyName} team to understand the effectiveness of DeepSource in fixing their
            code health issues and improving developer productivity. Key internal and external stakeholders can also use the
            report to understand the effectiveness of DeepSource in improving the code quality and maintainability of
            ${smartApostrophe(
              companyName
            )} codebase, along with saving significant time for developers.
        </p>`
      }
    }
  },
  [ReportPageT.CODE_COVERAGE]: {
    title: 'Code Coverage',
    description: 'Track code coverage across your organization.',
    type: ReportType.Insight,
    pinnableType: PinnableReportType.NON_DISTRIBUTION, // For use in pinnable reports menu items
    helpText: 'Code coverage and related metrics of your code base',
    level: [ReportLevel.Enterprise, ReportLevel.Owner],
    copyText: (companyName) => {
      return {
        summary: `<h1 id="summary" class="text-lg text-vanilla-100 font-semibold scroll-mt-8">Summary</h1>
            <p>
                DeepSource integrates with ${smartApostrophe(
                  companyName
                )} continuous integration (CI) system to track their
                source code's coverage generated after running the automated tests and helps them take action to improve it. This report provides the
                latest snapshot of code coverage metrics for ${smartApostrophe(
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
    level: [ReportLevel.Enterprise, ReportLevel.Owner, ReportLevel.Repository],
    copyText: () => {
      return {
        summary: ``,
        intendedUse: ``
      }
    }
  }
}

export type DateRangeOptionT = {
  count: number
  durationType: DurationTypeT
}

export interface Dataset {
  name: string
  values: number[]
  chartType?: string
  bgColor?: string
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

// Consumed in pinned reports
export interface IReportInfo {
  key: ReportPageT
  query: string
  componentName: string
  handleResponse: (response: GraphqlQueryResponse, filter?: IssueDistributionT) => IHandledResponse
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

// Code health trend has 3 types of values in historical values (i.e. in its chart)
export enum CodeHealthTrendT {
  NET = 'net',
  ACTIVE = 'active',
  RESOLVED = 'resolved'
}

export type CodeHealthTrendMetaProperties = {
  name: string
  chartType: 'bar' | 'line'
}

export const CodeHealthTrendMeta: Record<CodeHealthTrendT, CodeHealthTrendMetaProperties> = {
  [CodeHealthTrendT.ACTIVE]: {
    name: 'issues introduced',
    chartType: 'bar'
  },
  [CodeHealthTrendT.RESOLVED]: {
    name: 'issues resolved',
    chartType: 'bar'
  },
  [CodeHealthTrendT.NET]: {
    name: 'net new issues',
    chartType: 'line'
  }
}

export const MAX_INDIVIDUAL_DATASET = 3

// Consumed in pinned reports
// The following are consumed in pinned reports

// Type information corresponding to individual entries after processing the query response
export type CompiledPinnedReportT = PinnedReport &
  IHandledResponse & { componentName: string; error?: boolean }

// Type information corresponding to chart datasets
export type DataSetsT = Array<{ name: string; chartType?: string; values: Array<number> }>

export enum LoadingConditions {
  REPORT_WIDGET_INITIAL_LOAD = 'report-widget-initial-load', // Denotes the pinned initial load
  REPORT_WIDGET_DATA_FETCH = 'report-widget-data-fetch', // Denotes the pinned report data fetch
  REPORT_CONTROLS_CHANGE = 'report-controls-change', // Denotes a change in report controls value
  REPORT_SWAP = 'report-swap' // Denotes the currently pinned report got swapped with a different one
}

export interface ILoadingValue {
  condition: LoadingConditions | null
  status: boolean
}

export interface IHandledResponse {
  compliancePassing?: boolean // Specific to `owasp-top-10` and `sans-top-25`` reports
  coverageList?: Array<RepositoryCoverageReportItem> // Specific to `code-coverage` report
  datasets?: DataSetsT
  label: string
  historicalValues?: HistoricalValues
  value?: number
  valueLabel?: string
}

export type ReportMetadataFilterT = `${ReportPageT}-analyzer` | `${ReportPageT}-category`

export interface IPinnableReportItem {
  accordionItemIsOpen?: boolean // For `distribution-based` entries that get rendered as accordions
  key: ReportPageT
  label: string
  metadata: { filter: ReportMetadataFilterT; text: string } | null
  metadataItems?: Array<IReportMetadata>
  type: PinnableReportType
}

// Type information corresponding to the report metadata
export interface IReportMetadata {
  filter: ReportMetadataFilterT
  text: string
}
