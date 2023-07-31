export interface OwnerFeature {
  shortcode: string
  name: string
  enabled: boolean
}

export enum OwnerFeatureType {
  AUDIT_LOG = 'audit_log',
  MONOREPO = 'monorepo'
}
