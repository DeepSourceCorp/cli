import { DurationTypeT } from '~/utils/date'

type ReportMetaProperties = {
  title: string
  description: string
  hasIssueTable: boolean
}

export enum ReportPageT {
  OWASP_TOP_10 = 'owasp-top-10',
  SANS_TOP_25 = 'sans-top-25',
  DISTRIBUTION = 'issue-distribution'
}

export const ReportMeta: Record<ReportPageT, ReportMetaProperties> = {
  [ReportPageT.OWASP_TOP_10]: {
    title: 'OWASP Top 10',
    description: 'Overview of OWASP Top 10 security risks in your code.',
    hasIssueTable: true
  },
  [ReportPageT.SANS_TOP_25]: {
    title: 'SANS Top 25',
    description: 'Overview of CWE/SANS Top 25 most dangerous software errors in your code.',
    hasIssueTable: true
  },
  [ReportPageT.DISTRIBUTION]: {
    title: 'Issue Distribution',
    description: 'Overview of issues across categories and as detected by analyzers.',
    hasIssueTable: false
  }
}

export type ComplianceIssueOccurences = {
  high?: number
  medium?: number
  low?: number
  totalValue: number
}

export type ComplianceIssue = {
  issueID: string
  title: string
  occurences: ComplianceIssueOccurences
  rank?: number
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
  label: string
  link: string[]
  pathName: ReportPageT
}
