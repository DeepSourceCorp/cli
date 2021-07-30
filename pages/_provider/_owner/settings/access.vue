<template>
  <div class="p-5 space-y-6">
    <h2 class="text-lg font-medium">Access control</h2>
    <form-group label="Provider Permissions">
      <toggle-input
        label="Automatically sync access settings from GitHub"
        description="Issues would be reported only for lines that have been added or modified across all the files affected."
        inputId="team-settings-access-sync"
        v-model="syncPermissionsWithVcs"
      >
        <template slot="description">
          <p>GitHub allows access settings to be synced automatically.</p>
          <z-button buttonType="secondary" size="small" class="mt-2" @click="triggerUpdateSettings"
            >Manually sync access settings</z-button
          >
        </template>
      </toggle-input>
    </form-group>
    <form-group label="Member Permissions">
      <radio-group-input
        label="Base Permissions"
        inputId="team-settings-access-base-perms"
        inputWidth="wide"
        :options="basePermOptions"
        v-model="basePerm"
      ></radio-group-input>
      <check-input
        label="Issue Permissions"
        inputId="team-settings-access-issue-perms"
        inputWidth="wide"
        :options="issuePermOptions"
        v-model="issuePerms"
      ></check-input>
    </form-group>
    <portal to="modal">
      <z-confirm
        v-if="showSyncModal"
        @onClose="closeSyncModal"
        title="Proceed with sync?"
        primaryActionLabel="Sync access settings"
        primaryActionIcon="alert-circle"
        @primaryAction="syncAccessSettings"
      >
        <div class="mb-2 text-base leading-relaxed text-vanilla-100 flex items-center">
          Confirm and sync
        </div>
        <p class="text-sm leading-relaxed text-vanilla-400">
          Doing this will sync the organization’s access settings from
          {{ $providerMetaMap[this.$route.params.provider].text }} and override any changes that you
          might have done on DeepSource.
          <b class="text-vanilla-100">This action cannot be undone.</b>
        </p>
      </z-confirm>
    </portal>
  </div>
</template>

<script lang="ts">
import { Component, Watch, mixins } from 'nuxt-property-decorator'
import TeamDetailMixin from '~/mixins/teamDetailMixin'
import { ZButton, ZConfirm } from '@deepsourcelabs/zeal'
import { CheckInput, FormGroup, RadioGroupInput, ToggleInput } from '~/components/Form'

import { TeamBasePermissionSetDefaultRepositoryPermission, Maybe } from '~/types/types'
import { TeamPerms } from '~/types/permTypes'

@Component({
  components: {
    CheckInput,
    FormGroup,
    RadioGroupInput,
    ToggleInput,
    ZButton,
    ZConfirm
  },
  middleware: ['teamOnly', 'perm'],
  validate({ params }): boolean {
    return ['gh', 'gl', 'bb'].includes(params.provider)
  },
  meta: {
    auth: {
      strict: true,
      teamPerms: [TeamPerms.VIEW_ACCESS_CONTROL_DASHBOARD, TeamPerms.DELETE_TEAM_ACCOUNT]
    }
  },
  layout: 'dashboard'
})
export default class AccessControlSettings extends mixins(TeamDetailMixin) {
  private syncPermissionsWithVcs = true
  private issuePerms: Record<string, boolean | undefined> = {
    canMembersIgnoreIssues: false,
    canContributorsIgnoreIssues: false
  }
  private basePerm: TeamBasePermissionSetDefaultRepositoryPermission =
    TeamBasePermissionSetDefaultRepositoryPermission.Write

  private isFetching = false
  private showSyncModal = false

  closeSyncModal() {
    this.showSyncModal = false
  }

  triggerUpdateSettings() {
    this.showSyncModal = true
  }

  async syncAccessSettings() {
    await this.syncVcsPermissionss({
      teamId: this.team.id
    })
  }

  async fetch(): Promise<void> {
    this.isFetching = true
    const { owner, provider } = this.$route.params
    await this.fetchTeamSettings({
      login: owner,
      provider
    })
    this.syncPermissionsWithVcs = this.team.syncPermissionsWithVcs
    if (this.team.basePermissionSet?.defaultRepositoryPermission) {
      this.basePerm = this.team.basePermissionSet?.defaultRepositoryPermission
    }
    this.issuePerms = {
      canMembersIgnoreIssues: this.team.basePermissionSet?.canMembersIgnoreIssues,
      canContributorsIgnoreIssues: this.team.basePermissionSet?.canContributorsIgnoreIssues
    }
    this.isFetching = false
  }

  @Watch('syncPermissionsWithVcs', { immediate: false })
  updateVcsPermSync(newVal: boolean, oldVal: boolean) {
    if (!this.isFetching && newVal !== oldVal) {
      this.updateAccessControlSettings({
        teamId: this.team.id,
        syncPermissionsWithVcs: newVal
      })
    }
  }

  @Watch('issuePerms', { immediate: false, deep: true })
  @Watch('basePerm', { immediate: false })
  updateBasePerms() {
    if (!this.isFetching) {
      this.updateTeamBasePermissions({
        teamId: this.team.id,
        defaultRepositoryPermission: this.basePerm,
        canMembersIgnoreIssues: this.issuePerms.canMembersIgnoreIssues || false,
        canContributorsIgnoreIssues: this.issuePerms.canContributorsIgnoreIssues || false
      })
    }
  }

  private basePermOptions = [
    {
      value: TeamBasePermissionSetDefaultRepositoryPermission.Read,
      label: 'Read Only',
      description: `Members will be able to only view the issues and metrics on all repositories they have access to, but won't be able to take any actions on issues or create Autofixes. You'll need to give each Member additional access to individual repositories from the repository's settings.`
    },
    {
      value: TeamBasePermissionSetDefaultRepositoryPermission.Write,
      label: 'Maintain',
      description: `Members will have full access to all repositories which they have access to, except the ability to add new Members and deactivating or activating analysis on it.`
    },
    {
      value: TeamBasePermissionSetDefaultRepositoryPermission.Admin,
      label: 'Administrator',
      description: `Members will have full access to all repositories which they have access to, including the ability to add new Members and deactivating or activating analysis on it.`
    }
  ]

  private issuePermOptions = [
    { value: 'canMembersIgnoreIssues', label: 'Allow members to ignore issues' },
    { value: 'canContributorsIgnoreIssues', label: 'Allow members to modify metric thresholds ' }
  ]
}
</script>
