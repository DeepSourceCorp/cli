import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { OrgGroupsActions, OrgGroupsGetters } from '~/store/control-panel/groups'
import TEAM_PERMS from '~/utils/teamPerms'
import { EnterpriseGroup, TeamMemberRoleChoices } from '~/types/types'
import MutationFailedError from '~/utils/mutationFailedError'

const groupManagementStore = namespace('control-panel/groups')

@Component
export default class AddTeamToGroupMixin extends Vue {
  @groupManagementStore.Getter(OrgGroupsGetters.TEAMS_TO_ADD)
  groupTeamsToAdd: EnterpriseGroup

  @groupManagementStore.Action(OrgGroupsActions.FETCH_TEAMS_TO_ADD)
  fetchTeamsToAdd: (args: { groupId: string; q?: string; refetch?: boolean }) => Promise<void>

  @groupManagementStore.Action(OrgGroupsActions.ADD_TEAM_TO_GROUP)
  addTeamToGroup: (args: {
    groupId: string
    teamId: string
    role: TeamMemberRoleChoices
  }) => Promise<boolean>

  @groupManagementStore.Action(OrgGroupsActions.UPDATE_GROUP_TEAM_ROLE)
  updateGroupTeamRole: (args: { groupId: string; teamId: string; role: string }) => Promise<boolean>

  refetch = true
  TEAM_PERMS = TEAM_PERMS
  DEFAULT_TEAM_GROUP_ROLE = TeamMemberRoleChoices.Member

  /**
   * Dummy function to be overridden on pages that need to refetch data locally within page
   *
   * @param  {{ refetchAddTeams?: boolean }} refetchParams
   * @returns Promise<void>
   */
  // skipcq: JS-0387
  async refetchData(refetchParams?: { refetchAddTeams?: boolean }): Promise<void> {
    // Do nothing.
  }

  async addTeamToOrgGroup(
    groupId: string,
    teamId: string,
    role: TeamMemberRoleChoices
  ): Promise<void> {
    try {
      const response = await this.addTeamToGroup({ groupId, teamId, role })
      if (!response) {
        throw new MutationFailedError('An error occured while adding team, please try again.')
      }
      this.$toast.success('Team added to group succesfully.')
    } catch (e) {
      this.$toast.danger((e as Error).message)
    } finally {
      this.refetch = true
      this.$fetch()
      this.$emit('refetch')
    }
  }

  async updateTeamRole(
    groupId: string,
    teamId: string,
    role: TeamMemberRoleChoices
  ): Promise<void> {
    try {
      const response = await this.updateGroupTeamRole({
        groupId,
        teamId,
        role
      })
      if (!response) {
        throw new MutationFailedError(
          'An error occured while updating team role, please try again.'
        )
      }
      this.$toast.success('Successfully updated role for team.')
    } catch (e) {
      this.$toast.danger((e as Error).message)
    } finally {
      this.refetch = true
      this.$fetch()
      this.$emit('refetch', { refetchAddTeams: true })
      if (this.refetchData) await this.refetchData({ refetchAddTeams: true })
    }
  }
}
