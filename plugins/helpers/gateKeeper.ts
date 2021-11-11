// Team Permission Levels: https://deepsource.io/docs/access-control/people-access
// Repository Permission Levels: https://deepsource.io/docs/access-control/repository-access
// Usage: `this.$gateKeeper.team(TeamPerms.CHANGE_PLAN, 'ADMIN')`

import { Inject, Context } from '@nuxt/types/app'
import { TeamPerms, RepoPerms } from '~/types/permTypes'
import { RepositoryCollaboratorPermission, TeamMemberRoleChoices } from '~/types/types'

declare interface GateKeeperInterface {
  team(perm: TeamPerms | TeamPerms[], role: TeamMemberRoleChoices, strict?: boolean): boolean
  repo(
    perm: RepoPerms | RepoPerms[],
    role: RepositoryCollaboratorPermission,
    strict?: boolean
  ): boolean
}

declare module 'vue/types/vue' {
  interface Vue {
    $gateKeeper: GateKeeperInterface
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $gateKeeper: GateKeeperInterface
  }
  interface Context {
    $gateKeeper: GateKeeperInterface
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $gateKeeper: GateKeeperInterface
  }
}

const TEAM_PERMS_MAP = {
  [TeamPerms.CHANGE_PLAN]: ['ADMIN'],
  [TeamPerms.UPDATE_SEATS]: ['ADMIN'],
  [TeamPerms.UPDATE_BILLING_DETAILS]: ['ADMIN'],
  [TeamPerms.MANAGE_TEAM_MEMEBERS]: ['ADMIN'],
  [TeamPerms.VIEW_ACCESS_CONTROL_DASHBOARD]: ['ADMIN'],
  [TeamPerms.GENERATE_OWNER_SSH_KEY_PAIR]: ['ADMIN'],
  [TeamPerms.DELETE_TEAM_ACCOUNT]: ['ADMIN'],
  [TeamPerms.ONBOARD_ACCOUNT]: ['ADMIN'],
  [TeamPerms.SET_GRANUALAR_IGNORE_PERMISSION]: ['ADMIN'],
  [TeamPerms.ACTIVATE_ANALYSIS]: ['ADMIN', 'MEMBER'],
  [TeamPerms.SYNC_REPO_LIST]: ['ADMIN', 'MEMBER'],
  [TeamPerms.VIEW_TEAM_HOME]: ['ADMIN', 'MEMBER', 'CONTRIBUTOR'],
  [TeamPerms.AUTO_ONBOARD_CRUD_FOR_TEMPLATE]: ['ADMIN'],
  [TeamPerms.AUTO_ONBOARD_VIEW_TEMPLATE]: ['ADMIN', 'MEMBER'],
  [TeamPerms.AUTO_ONBOARD_REPOSITORIES]: ['ADMIN', 'MEMBER'],
  [TeamPerms.MANAGE_WEBHOOKS]: ['ADMIN']
}

const REPO_PERMS_MAP = {
  [RepoPerms.VIEW_BADGES]: ['ADMIN', 'WRITE', 'READ'],
  [RepoPerms.VIEW_ISSUES]: ['ADMIN', 'WRITE', 'READ'],
  [RepoPerms.VIEW_PAST_RUNS]: ['ADMIN', 'WRITE', 'READ'],
  [RepoPerms.VIEW_METRICS]: ['ADMIN', 'WRITE', 'READ'],
  [RepoPerms.VIEW_OVERVIEW_WIDGETS]: ['ADMIN', 'WRITE', 'READ'],
  [RepoPerms.ALLOW_STAR]: ['ADMIN', 'WRITE', 'READ'],
  [RepoPerms.CUSTOMIZE_OVERVIEW_WIDGETS]: ['ADMIN', 'WRITE'],
  [RepoPerms.INSTALL_AUTOFIX_APP]: ['ADMIN', 'WRITE'],
  [RepoPerms.CREATE_AUTOFIXES]: ['ADMIN', 'WRITE'],
  [RepoPerms.VIEW_DSN]: ['ADMIN', 'WRITE'],
  [RepoPerms.GENERATE_SSH_KEY_PAIR]: ['ADMIN', 'WRITE'],
  [RepoPerms.CHANGE_DEFAULT_ANALYSIS_BRANCH]: ['ADMIN', 'WRITE'],
  [RepoPerms.CHANGE_ISSUE_TYPES_TO_REPORT]: ['ADMIN', 'WRITE'],
  [RepoPerms.CHANGE_ISSUES_TO_TYPE_TO_BLOCK_PRS_ON]: ['ADMIN', 'WRITE'],
  [RepoPerms.DEACTIVATE_ANALYSIS_ON_REPOSITORY]: ['ADMIN', 'WRITE'],
  [RepoPerms.ADD_REMOVE_MEMBERS]: ['ADMIN'],
  [RepoPerms.UPDATE_ROLE_OF_EXISTING_MEMBERS]: ['ADMIN'],
  [RepoPerms.IGNORE_ISSUES]: ['ADMIN'],
  [RepoPerms.VIEW_AUDIT_LOGS]: ['ADMIN'],
  [RepoPerms.READ_REPO]: ['ADMIN', 'WRITE', 'READ'],
  [RepoPerms.ACTIVATE_REPOSITORY]: ['ADMIN', 'WRITE']
}

export default (context: Context, inject: Inject): void => {
  const gateKeeper: GateKeeperInterface = {
    team(
      perm: TeamPerms | TeamPerms[],
      role: 'ADMIN' | 'MEMBER' | 'CONTRIBUTOR',
      strict = false
    ): boolean {
      if (Array.isArray(perm)) {
        const allowedMap = perm.map((permItem) => {
          if (permItem in TEAM_PERMS_MAP) {
            return TEAM_PERMS_MAP[permItem].includes(role)
          }
          return true
        })

        if (strict) {
          // Don't allow unless all perms are available
          return allowedMap.indexOf(false) > -1 ? false : true
        }
        return allowedMap.indexOf(true) > -1 ? true : false
      }

      return TEAM_PERMS_MAP[perm].includes(role)
    },
    repo(perm: RepoPerms | RepoPerms[], role: 'ADMIN' | 'WRITE' | 'READ', strict = false): boolean {
      if (Array.isArray(perm)) {
        const allowedMap = perm.map((permItem) => {
          if (permItem in REPO_PERMS_MAP) {
            return REPO_PERMS_MAP[permItem].includes(role)
          }
          return true
        })

        if (strict) {
          // Don't allow unless all perms are available
          return allowedMap.indexOf(false) > -1 ? false : true
        }
        return allowedMap.indexOf(true) > -1 ? true : false
      }

      return REPO_PERMS_MAP[perm].includes(role)
    }
  }
  inject('gateKeeper', gateKeeper)
}
