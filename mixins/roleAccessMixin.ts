// Team Permission Levels: https://deepsource.io/docs/access-control/people-access/permission-levels.html
// Repository Permission Levels: https://deepsource.io/docs/access-control/repository-access/permission-levels.html

import { Component, mixins } from 'nuxt-property-decorator'
import RepoDetailMixin from './repoDetailMixin'
import AuthMixin from './authMixin'
import ActiveUserMixin, { DashboardContext } from './activeUserMixin'
import { RepositoryCollaboratorPermission, TeamMemberRoleChoices } from '~/types/types'

export interface RepoPermissions {
  canIgnoreIssues: boolean
  canModifyThresholds: boolean
  permission: RepositoryCollaboratorPermission
}

export interface TeamPermissions {
  permission: TeamMemberRoleChoices
  canAddMember: boolean
  isPrimaryUser: boolean
  hasAllRepoAccess: boolean
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

  get teamPerms(): TeamPermissions {
    const context = this.activeDashboardContext as DashboardContext
    return {
      permission: context.role,
      canAddMember: context.can_add_member,
      isPrimaryUser: context.is_primary_user_for_owner,
      hasAllRepoAccess: context.has_granted_all_repo_access
    }
  }
}
