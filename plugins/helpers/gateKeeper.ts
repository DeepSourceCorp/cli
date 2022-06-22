// Team Permission Levels: https://deepsource.io/docs/access-control/people-access
// Repository Permission Levels: https://deepsource.io/docs/access-control/repository-access
// Usage: `this.$gateKeeper.team(TeamPerms.CHANGE_PLAN, 'ADMIN')`

import { Inject, Context } from '@nuxt/types/app'
import { TeamPerms, RepoPerms, AppFeatures } from '~/types/permTypes'
import {
  RepositoryCollaboratorPermission,
  TeamMemberRoleChoices,
  VcsProviderChoices
} from '~/types/types'

declare interface GateKeeperInterface {
  team(perm: TeamPerms | TeamPerms[], role: TeamMemberRoleChoices, strict?: boolean): boolean
  repo(
    perm: RepoPerms | RepoPerms[],
    role: RepositoryCollaboratorPermission,
    strict?: boolean
  ): boolean
  provider(feature: AppFeatures | AppFeatures[], provider?: VcsProviderChoices | string): boolean
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
  // skipcq: JS-0387
  interface Store<S> {
    $gateKeeper: GateKeeperInterface
  }
}

const TEAM_PERMS_MAP = {
  [TeamPerms.CHANGE_PLAN]: [TeamMemberRoleChoices.Admin],
  [TeamPerms.UPDATE_SEATS]: [TeamMemberRoleChoices.Admin],
  [TeamPerms.UPDATE_BILLING_DETAILS]: [TeamMemberRoleChoices.Admin],
  [TeamPerms.MANAGE_TEAM_MEMEBERS]: [TeamMemberRoleChoices.Admin],
  [TeamPerms.VIEW_ACCESS_CONTROL_DASHBOARD]: [TeamMemberRoleChoices.Admin],
  [TeamPerms.GENERATE_OWNER_SSH_KEY_PAIR]: [TeamMemberRoleChoices.Admin],
  [TeamPerms.DELETE_TEAM_ACCOUNT]: [TeamMemberRoleChoices.Admin],
  [TeamPerms.ONBOARD_ACCOUNT]: [TeamMemberRoleChoices.Admin],
  [TeamPerms.SET_GRANUALAR_IGNORE_PERMISSION]: [TeamMemberRoleChoices.Admin],
  [TeamPerms.ACTIVATE_ANALYSIS]: [TeamMemberRoleChoices.Admin, TeamMemberRoleChoices.Member],
  [TeamPerms.SYNC_REPO_LIST]: [TeamMemberRoleChoices.Admin, TeamMemberRoleChoices.Member],
  [TeamPerms.VIEW_TEAM_HOME]: [
    TeamMemberRoleChoices.Admin,
    TeamMemberRoleChoices.Member,
    TeamMemberRoleChoices.Contributor
  ],
  [TeamPerms.AUTO_ONBOARD_CRUD_FOR_TEMPLATE]: [TeamMemberRoleChoices.Admin],
  [TeamPerms.AUTO_ONBOARD_VIEW_TEMPLATE]: [
    TeamMemberRoleChoices.Admin,
    TeamMemberRoleChoices.Member
  ],
  [TeamPerms.AUTO_ONBOARD_REPOSITORIES]: [
    TeamMemberRoleChoices.Admin,
    TeamMemberRoleChoices.Member
  ],
  [TeamPerms.MANAGE_WEBHOOKS]: [TeamMemberRoleChoices.Admin],
  [TeamPerms.MANAGE_OWNER_ISSUE_PRIORITY]: [TeamMemberRoleChoices.Admin],
  [TeamPerms.MANAGE_INTEGRATIONS]: [TeamMemberRoleChoices.Admin]
}

const REPO_PERMS_MAP = {
  [RepoPerms.VIEW_BADGES]: [
    RepositoryCollaboratorPermission.Admin,
    RepositoryCollaboratorPermission.Write,
    RepositoryCollaboratorPermission.Read
  ],
  [RepoPerms.VIEW_ISSUES]: [
    RepositoryCollaboratorPermission.Admin,
    RepositoryCollaboratorPermission.Write,
    RepositoryCollaboratorPermission.Read
  ],
  [RepoPerms.VIEW_PAST_RUNS]: [
    RepositoryCollaboratorPermission.Admin,
    RepositoryCollaboratorPermission.Write,
    RepositoryCollaboratorPermission.Read
  ],
  [RepoPerms.VIEW_METRICS]: [
    RepositoryCollaboratorPermission.Admin,
    RepositoryCollaboratorPermission.Write,
    RepositoryCollaboratorPermission.Read
  ],
  [RepoPerms.VIEW_OVERVIEW_WIDGETS]: [
    RepositoryCollaboratorPermission.Admin,
    RepositoryCollaboratorPermission.Write,
    RepositoryCollaboratorPermission.Read
  ],
  [RepoPerms.ALLOW_STAR]: [
    RepositoryCollaboratorPermission.Admin,
    RepositoryCollaboratorPermission.Write,
    RepositoryCollaboratorPermission.Read
  ],
  [RepoPerms.CUSTOMIZE_OVERVIEW_WIDGETS]: [
    RepositoryCollaboratorPermission.Admin,
    RepositoryCollaboratorPermission.Write
  ],
  [RepoPerms.INSTALL_AUTOFIX_APP]: [
    RepositoryCollaboratorPermission.Admin,
    RepositoryCollaboratorPermission.Write
  ],
  [RepoPerms.CREATE_AUTOFIXES]: [
    RepositoryCollaboratorPermission.Admin,
    RepositoryCollaboratorPermission.Write
  ],
  [RepoPerms.VIEW_DSN]: [
    RepositoryCollaboratorPermission.Admin,
    RepositoryCollaboratorPermission.Write
  ],
  [RepoPerms.GENERATE_SSH_KEY_PAIR]: [
    RepositoryCollaboratorPermission.Admin,
    RepositoryCollaboratorPermission.Write
  ],
  [RepoPerms.CHANGE_DEFAULT_ANALYSIS_BRANCH]: [
    RepositoryCollaboratorPermission.Admin,
    RepositoryCollaboratorPermission.Write
  ],
  [RepoPerms.CHANGE_ISSUE_TYPES_TO_REPORT]: [
    RepositoryCollaboratorPermission.Admin,
    RepositoryCollaboratorPermission.Write
  ],
  [RepoPerms.CHANGE_ISSUES_TO_TYPE_TO_BLOCK_PRS_ON]: [
    RepositoryCollaboratorPermission.Admin,
    RepositoryCollaboratorPermission.Write
  ],
  [RepoPerms.CHANGE_PRIORITY_SETTINGS_TO_REPORT]: [RepositoryCollaboratorPermission.Admin],
  [RepoPerms.CHANGE_PRIORITY_SETTINGS_TO_BLOCK_PRS_ON]: [RepositoryCollaboratorPermission.Admin],
  [RepoPerms.DEACTIVATE_ANALYSIS_ON_REPOSITORY]: [
    RepositoryCollaboratorPermission.Admin,
    RepositoryCollaboratorPermission.Write
  ],
  [RepoPerms.ADD_REMOVE_MEMBERS]: [RepositoryCollaboratorPermission.Admin],
  [RepoPerms.UPDATE_ROLE_OF_EXISTING_MEMBERS]: [RepositoryCollaboratorPermission.Admin],
  [RepoPerms.IGNORE_ISSUES]: [RepositoryCollaboratorPermission.Admin],
  [RepoPerms.VIEW_AUDIT_LOGS]: [RepositoryCollaboratorPermission.Admin],
  [RepoPerms.READ_REPO]: [
    RepositoryCollaboratorPermission.Admin,
    RepositoryCollaboratorPermission.Write,
    RepositoryCollaboratorPermission.Read
  ],
  [RepoPerms.ACTIVATE_REPOSITORY]: [
    RepositoryCollaboratorPermission.Admin,
    RepositoryCollaboratorPermission.Write
  ],
  [RepoPerms.CHANGE_ISSUE_PRIORITY]: [RepositoryCollaboratorPermission.Admin],
  [RepoPerms.CHANGE_INTEGRATION_SETTINGS]: [RepositoryCollaboratorPermission.Admin]
}

const FEATURES_PROVIDER_MAP = {
  [AppFeatures.AUTOFIX]: [
    VcsProviderChoices.Github,
    VcsProviderChoices.GithubEnterprise,
    VcsProviderChoices.Bitbucket,
    VcsProviderChoices.Gitlab
  ],
  [AppFeatures.TRANSFORMS]: [
    VcsProviderChoices.Github,
    VcsProviderChoices.GithubEnterprise,
    VcsProviderChoices.Bitbucket,
    VcsProviderChoices.Gitlab
  ],
  [AppFeatures.WEBHOOKS]: [
    VcsProviderChoices.Github,
    VcsProviderChoices.GithubEnterprise,
    VcsProviderChoices.Bitbucket,
    VcsProviderChoices.Gitlab,
    VcsProviderChoices.Gsr
  ],
  [AppFeatures.AUTO_ONBOARD]: [VcsProviderChoices.Github, VcsProviderChoices.GithubEnterprise],
  [AppFeatures.SYNC_ACCESS_SETTINGS]: [
    VcsProviderChoices.Github,
    VcsProviderChoices.GithubEnterprise
  ],
  [AppFeatures.CREATE_ISSUE_ON_VCS]: [
    VcsProviderChoices.Github,
    VcsProviderChoices.GithubEnterprise,
    VcsProviderChoices.Gitlab
  ]
}

export default ({ $providerMetaMap, route }: Context, inject: Inject): void => {
  const gateKeeper: GateKeeperInterface = {
    team(perm: TeamPerms | TeamPerms[], role: TeamMemberRoleChoices, strict = false): boolean {
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
    repo(
      perm: RepoPerms | RepoPerms[],
      role: RepositoryCollaboratorPermission,
      strict = false
    ): boolean {
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
    },
    provider(
      feature: AppFeatures | AppFeatures[],
      provider?: VcsProviderChoices | string
    ): boolean {
      let providerToTest: VcsProviderChoices

      if (!provider && route.params.provider) {
        provider = route.params.provider as string
      }

      if (provider && Object.keys($providerMetaMap).includes(provider)) {
        providerToTest = $providerMetaMap[provider].value
      } else {
        return false
      }

      if (Array.isArray(feature)) {
        const allowedMap = feature.map((feature) => {
          if (feature in FEATURES_PROVIDER_MAP) {
            return FEATURES_PROVIDER_MAP[feature].includes(providerToTest)
          }
          return true
        })

        return allowedMap.indexOf(true) > -1 ? true : false
      }

      return FEATURES_PROVIDER_MAP[feature].includes(providerToTest)
    }
  }
  inject('gateKeeper', gateKeeper)
}
