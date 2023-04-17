export enum FeatureType {
  AUDIT_LOG = 'audit_log'
}

export enum PlanTypes {
  STARTER = 'starter',
  BUSINESS = 'business',
  ENTERPRISE = 'enterprise'
}

export interface FeatureProperties {
  title: string
  minRequiredPlan: PlanTypes
}

export const featureMap: Record<FeatureType, FeatureProperties> = {
  [FeatureType.AUDIT_LOG]: {
    title: 'Audit Log',
    minRequiredPlan: PlanTypes.BUSINESS // This is used as the copy text
  }
}
