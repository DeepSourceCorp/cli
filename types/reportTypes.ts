import { DurationTypeT } from '~/utils/date'
import { TrendDirection } from './types'

type ReportMetaProperties = {
  title: string
  description: string
  hasIssueTable: boolean
}

export enum ReportPageT {
  OWASP_TOP_10 = 'owasp-top-10',
  SANS_TOP_25 = 'sans-top-25'
}

export const ReportMeta: Record<ReportPageT, ReportMetaProperties> = {
  [ReportPageT.OWASP_TOP_10]: {
    title: 'OWASP Top 10',
    description: 'Compliance with OWASP Top 10 recommendations',
    hasIssueTable: true
  },
  [ReportPageT.SANS_TOP_25]: {
    title: 'SANS Top 25',
    description: 'Compliance with SANS Top 25 recommendations',
    hasIssueTable: true
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

export type IssueDistribution = {
  icon?: string
  label: string
  value: number
  trendValue?: number
  trendDirection?: TrendDirection
  trendPositive?: boolean
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
  values: Record<string, Array<number>>
}

export interface ReportsTabLink {
  label: string
  link: string[]
  pathName: ReportPageT
}
