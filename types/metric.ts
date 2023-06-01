import { RepositoryMetricValue } from './types'

export enum MetricType {
  'aggregate' = 'aggregate',
  'generic' = 'generic'
}

export enum StatType {
  'threshold' = 'threshold',
  'metric' = 'metric'
}

export enum ThresholdType {
  'threshold',
  'newCodeThreshold'
}

export interface GroupedMetrics {
  name: string
  metrics: RepositoryMetricValue[]
}

export const NLCV_SHORTCODE = 'NLCV'

export const DEFAULT_BR_COVERAGE_METRICS = ['BCV', 'CCV', 'LCV', 'CPCV']
