import { Component, mixins } from 'nuxt-property-decorator'
import { ModelSync } from 'vue-property-decorator'
import RepoDetailMixin from './repoDetailMixin'

export interface IssueCategoryChoice {
  name: string
  shortcode: string
  icon?: string
}

export const issuesSortOrder = [
  'all',
  'recommended',
  'bug-risk',
  'antipattern',
  'security',
  'performance',
  'typecheck',
  'coverage',
  'style',
  'doc'
]

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

/**
 * Mixin to add utilities that help with issue filtering in a  repo
 */
@Component
export default class IssueCategoryMixin extends mixins(RepoDetailMixin) {
  @ModelSync('selectedCategory', 'updateCategory', { type: String, default: 'recommended' })
  readonly modelValue: string

  iconMap: Record<string, string> = {
    recommended: 'star',
    all: 'all'
  }

  get issueCategories(): IssueCategoryChoice[] {
    if (this.repository.issueTypeDistribution) {
      return this.repository.issueTypeDistribution
        .map(({ name, shortcode, count }) => {
          return {
            name,
            shortcode,
            count,
            icon: this.iconMap[shortcode] ?? shortcode
          }
        })
        .sort((curr, next) => {
          const currIndex = issuesSortOrder.indexOf(curr.shortcode)
          const nextIndex = issuesSortOrder.indexOf(next.shortcode)
          return currIndex - nextIndex
        })
    }

    return []
  }
}
