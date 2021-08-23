import { Component, Vue, namespace } from 'nuxt-property-decorator'
import { TeamActions } from '~/store/team/detail'
import { Team, TeamBasePermissionSetDefaultRepositoryPermission } from '~/types/types'

const teamStore = namespace('team/detail')

@Component
export default class TeamDetailMixin extends Vue {
  @teamStore.State
  team: Team

  @teamStore.State('loading')
  teamLoading: Team

  @teamStore.Action(TeamActions.FETCH_TEAM_INFO)
  fetchTeam: (
    args: {
      login: string
      provider: string
      limit: number
      currentPage: number
      query: string
      refetch?: boolean
    },
    refetch?: boolean
  ) => Promise<void>

  @teamStore.Action(TeamActions.FETCH_TEAM_SETTINGS)
  fetchTeamSettings: (args: { login: string; provider: string }) => Promise<void>

  @teamStore.Action(TeamActions.FETCH_INVITED_USERS)
  fetchInvitedUsers: (args: {
    login: string
    provider: string
    limit: number
    currentPage: number
  }) => Promise<void>

  @teamStore.Action(TeamActions.UPDATE_MEMBER_ROLE)
  updateMemberRole: (args: { ownerId: string; email: string; role: string }) => Promise<void>

  @teamStore.Action(TeamActions.REMOVE_MEMBER)
  removeMemberFromTeam: (args: { ownerId: string; email: string }) => Promise<void>

  @teamStore.Action(TeamActions.INVITE_MEMBERS)
  inviteAll: (args: {
    ownerId: string
    invitees: { email: string; role: string }[]
    login: string
    provider: string
    limit: number
    currentPage: number
  }) => Promise<void>

  @teamStore.Action(TeamActions.INVITE_SINGLE)
  inviteSingle: (args: {
    ownerId: string
    email: string
    role: string
    login: string
    provider: string
    limit: number
    currentPage: number
  }) => Promise<void>

  @teamStore.Action(TeamActions.CANCEL_INVITE)
  cancelInvite: (args: {
    ownerId: string
    email: string
    login: string
    provider: string
    limit: number
    currentPage: number
  }) => Promise<void>

  @teamStore.Action(TeamActions.FETCH_INVITE_LINK)
  fetchInviteUrl: (args: { login: string; provider: string }) => Promise<void>

  @teamStore.Action(TeamActions.RESET_INVITE_LINK)
  resetInviteUrl: (args: { ownerId: string }) => Promise<void>

  // @teamStore.Action(TeamActions.FETCH_RECENT_ACTIVITY)
  // fetchRecentActivity: (args: {
  //   login: string
  //   provider: string
  //   limit: number
  //   currentPage: number
  // }) => Promise<void>

  @teamStore.Action(TeamActions.UPDATE_ACCESS_CONTROL_SETTINGS)
  updateAccessControlSettings: (args: {
    teamId: string
    syncPermissionsWithVcs: boolean
  }) => Promise<void>

  @teamStore.Action(TeamActions.UPDATE_TEAM_BASE_PERMS)
  updateTeamBasePermissions: (args: {
    teamId: string
    defaultRepositoryPermission: TeamBasePermissionSetDefaultRepositoryPermission
    canMembersIgnoreIssues: boolean
    canContributorsIgnoreIssues: boolean
  }) => Promise<void>

  @teamStore.Action(TeamActions.SYNC_VCS_PERMISSIONS)
  syncVcsPermissionss: (args: { teamId: string }) => Promise<void>
}
