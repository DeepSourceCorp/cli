export enum IssueOccurrenceDistributionType {
  PRODUCT = 'product',
  ISSUE_TYPE = 'issue-type'
}

export interface IssueFilterChoice {
  name: string
  shortcode: string
  icon: string
  count?: number
  subCategories?: Array<IssueFilterChoice>
}

export enum BaseTypeOptions {
  ALL = 'all',
  RECOMMENDED = 'recommended'
}

export enum IssueTypeOptions {
  BUG_RISK = 'bug-risk',
  ANTI_PATTERN = 'antipattern',
  SECURITY = 'security',
  STYLE = 'style',
  PERFORMANCE = 'performance',
  DOCUMENTATION = 'doc',
  TYPECHECK = 'typecheck',
  COVERAGE = 'coverage'
}

export enum ProductTypeOptions {
  STATIC_ANALYSIS = 'static_analysis',
  SAST = 'sast',
  COVERAGE = 'coverage',
  IAC_ANALYSIS = 'iac_analysis',
  AUDIT_REQUIRED = 'audit_required'
}

export const IssueBaseTypesMap: Record<BaseTypeOptions, IssueFilterChoice> = {
  [BaseTypeOptions.ALL]: {
    name: 'All issues',
    shortcode: 'all',
    icon: 'list'
  },
  [BaseTypeOptions.RECOMMENDED]: { name: 'Recommended', shortcode: 'recommended', icon: 'shine' }
}

export const IssueCategoryTypesMap: Record<IssueTypeOptions, IssueFilterChoice> = {
  [IssueTypeOptions.BUG_RISK]: { name: 'Bug Risk', shortcode: 'bug-risk', icon: 'bug-risk' },
  [IssueTypeOptions.ANTI_PATTERN]: {
    name: 'Anti-pattern',
    shortcode: 'antipattern',
    icon: 'antipattern'
  },
  [IssueTypeOptions.SECURITY]: { name: 'Security', shortcode: 'security', icon: 'security' },
  [IssueTypeOptions.PERFORMANCE]: {
    name: 'Performance',
    shortcode: 'performance',
    icon: 'performance'
  },
  [IssueTypeOptions.TYPECHECK]: { name: 'Typecheck', shortcode: 'typecheck', icon: 'typecheck' },
  [IssueTypeOptions.COVERAGE]: { name: 'Coverage', shortcode: 'coverage', icon: 'coverage' },
  [IssueTypeOptions.STYLE]: { name: 'Style', shortcode: 'style', icon: 'style' },
  [IssueTypeOptions.DOCUMENTATION]: { name: 'Documentation', shortcode: 'doc', icon: 'doc' }
}

export const IssueProductTypesMap: Record<ProductTypeOptions, IssueFilterChoice> = {
  [ProductTypeOptions.STATIC_ANALYSIS]: {
    name: 'Static Analysis',
    shortcode: 'static_analysis',
    icon: 'static-analysis',
    subCategories: [
      IssueCategoryTypesMap[IssueTypeOptions.PERFORMANCE],
      IssueCategoryTypesMap[IssueTypeOptions.BUG_RISK],
      IssueCategoryTypesMap[IssueTypeOptions.ANTI_PATTERN],
      IssueCategoryTypesMap[IssueTypeOptions.STYLE],
      IssueCategoryTypesMap[IssueTypeOptions.DOCUMENTATION]
    ]
  },
  [ProductTypeOptions.SAST]: {
    name: 'SAST',
    shortcode: 'sast',
    icon: 'security'
  },
  [ProductTypeOptions.COVERAGE]: {
    name: 'Code Coverage',
    shortcode: 'coverage',
    icon: 'coverage'
  },
  [ProductTypeOptions.IAC_ANALYSIS]: {
    name: 'IaC Analysis',
    shortcode: 'iac_analysis',
    icon: 'iac-analysis',
    subCategories: [
      IssueCategoryTypesMap[IssueTypeOptions.SECURITY],
      IssueCategoryTypesMap[IssueTypeOptions.BUG_RISK],
      IssueCategoryTypesMap[IssueTypeOptions.ANTI_PATTERN],
      IssueCategoryTypesMap[IssueTypeOptions.STYLE]
    ]
  },
  [ProductTypeOptions.AUDIT_REQUIRED]: {
    name: 'Audit required',
    shortcode: 'audit_required',
    icon: 'file-question'
  }
}

export const issueTypeDistributionList: Array<IssueFilterChoice> = [
  IssueBaseTypesMap[BaseTypeOptions.ALL],
  IssueBaseTypesMap[BaseTypeOptions.RECOMMENDED],
  IssueCategoryTypesMap[IssueTypeOptions.BUG_RISK],
  IssueCategoryTypesMap[IssueTypeOptions.ANTI_PATTERN],
  IssueCategoryTypesMap[IssueTypeOptions.SECURITY],
  IssueCategoryTypesMap[IssueTypeOptions.PERFORMANCE],
  IssueCategoryTypesMap[IssueTypeOptions.TYPECHECK],
  IssueCategoryTypesMap[IssueTypeOptions.COVERAGE],
  IssueCategoryTypesMap[IssueTypeOptions.STYLE],
  IssueCategoryTypesMap[IssueTypeOptions.DOCUMENTATION]
]

export const productDistributionList: Array<IssueFilterChoice> = [
  IssueBaseTypesMap[BaseTypeOptions.ALL],
  IssueBaseTypesMap[BaseTypeOptions.RECOMMENDED],
  IssueProductTypesMap[ProductTypeOptions.STATIC_ANALYSIS],
  IssueProductTypesMap[ProductTypeOptions.SAST],
  IssueProductTypesMap[ProductTypeOptions.COVERAGE],
  IssueProductTypesMap[ProductTypeOptions.IAC_ANALYSIS],
  IssueProductTypesMap[ProductTypeOptions.AUDIT_REQUIRED]
]

type FilterOptions =
  | {
      all: boolean
    }
  | {
      recommended: boolean
    }
  | {
      auditRequired: boolean
    }
  | {
      category: string
    }
  | {
      product: string
    }

export const IssueCategoryTypeFilterMap: Record<string, FilterOptions> = {
  [BaseTypeOptions.ALL]: { all: true },
  [BaseTypeOptions.RECOMMENDED]: { recommended: true },
  [IssueTypeOptions.BUG_RISK]: {
    category: IssueCategoryTypesMap[IssueTypeOptions.BUG_RISK].shortcode
  },
  [IssueTypeOptions.ANTI_PATTERN]: {
    category: IssueCategoryTypesMap[IssueTypeOptions.ANTI_PATTERN].shortcode
  },
  [IssueTypeOptions.SECURITY]: {
    category: IssueCategoryTypesMap[IssueTypeOptions.SECURITY].shortcode
  },
  [IssueTypeOptions.STYLE]: {
    category: IssueCategoryTypesMap[IssueTypeOptions.STYLE].shortcode
  },
  [IssueTypeOptions.PERFORMANCE]: {
    category: IssueCategoryTypesMap[IssueTypeOptions.PERFORMANCE].shortcode
  },
  [IssueTypeOptions.DOCUMENTATION]: {
    category: IssueCategoryTypesMap[IssueTypeOptions.DOCUMENTATION].shortcode
  },
  [IssueTypeOptions.TYPECHECK]: {
    category: IssueCategoryTypesMap[IssueTypeOptions.TYPECHECK].shortcode
  },
  [IssueTypeOptions.COVERAGE]: {
    category: IssueCategoryTypesMap[IssueTypeOptions.COVERAGE].shortcode
  }
}

export const ProductTypeFilterMap: Record<string, FilterOptions> = {
  [ProductTypeOptions.STATIC_ANALYSIS]: {
    product: IssueProductTypesMap[ProductTypeOptions.STATIC_ANALYSIS].shortcode
  },
  [ProductTypeOptions.SAST]: {
    product: IssueProductTypesMap[ProductTypeOptions.SAST].shortcode
  },
  [ProductTypeOptions.COVERAGE]: {
    product: IssueProductTypesMap[ProductTypeOptions.COVERAGE].shortcode
  },
  [ProductTypeOptions.IAC_ANALYSIS]: {
    product: IssueProductTypesMap[ProductTypeOptions.IAC_ANALYSIS].shortcode
  },
  [ProductTypeOptions.AUDIT_REQUIRED]: {
    auditRequired: true
  }
}

export interface IssueLink {
  to: string
  label: string
}
