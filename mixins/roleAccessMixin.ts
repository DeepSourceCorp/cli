// Team Permission Levels: https://deepsource.io/docs/access-control/people-access/permission-levels.html
// Repository Permission Levels: https://deepsource.io/docs/access-control/repository-access/permission-levels.html

import { Component, mixins } from 'nuxt-property-decorator'
import RepoDetailMixin from './repoDetailMixin'
import AuthMixin from './authMixin'
import ActiveUserMixin from './activeUserMixin'
import { RepositoryCollaboratorPermission } from '~/types/types'

export interface RepoPermissions {
  canIgnoreIssues: boolean
  canModifyThresholds: boolean
  permission: RepositoryCollaboratorPermission
}

@Component
export default class RoleAccessMixin extends mixins(RepoDetailMixin, AuthMixin, ActiveUserMixin) {
  async fetch(): Promise<void> {
    await this.fetchRepoPerms(this.baseRouteParams)
  }

  get repoPerms(): RepoPermissions {
    return {
      canIgnoreIssues: this.repository.userPermissionMeta?.can_ignore_issues,
      canModifyThresholds: this.repository.userPermissionMeta?.can_modify_metric_thresholds,
      permission: this.repository.userPermissionMeta?.permission
    }
  }
}