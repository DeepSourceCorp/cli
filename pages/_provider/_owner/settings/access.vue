<template>
  <div class="p-4 space-y-6">
    <h2 class="text-lg font-medium">Access control</h2>
    <form-group v-if="allowSyncAccessSettings" label="Provider Permissions">
      <toggle-input
        label="Automatically sync access settings from GitHub"
        description="Issues would be reported only for lines that have been added or modified across all the files affected."
        input-id="team-settings-access-sync"
        v-model="syncPermissionsWithVcs"
      >
        <template slot="description">
          <p>GitHub allows access settings to be synced automatically.</p>
          <z-button
            :is-loading="isSyncing"
            :disabled="isSyncing"
            icon="refresh-cw"
            label="Manually sync access settings"
            loading-label="Sync in progress..."
            button-type="secondary"
            size="small"
            class="mt-2"
            @click="triggerUpdateSettings"
          />
        </template>
      </toggle-input>
    </form-group>
    <form-group label="Access permissions">
      <radio-group-input
        label="Member Base Permissions"
        input-id="team-settings-access-base-perms"
        input-width="wide"
        :options="basePermOptions"
        @change="updateBasePerms"
        v-model="basePerm"
      ></radio-group-input>
      <check-input
        label="Issue Permissions"
        input-id="team-settings-access-issue-perms"
        input-width="wide"
        :options="issuePermOptions"
        @change="updateBasePerms"
        v-model="issuePerms"
      ></check-input>
      <check-input
        label="Metric Thresholds Permission"
        input-id="team-settings-access-metric-perms"
        input-width="wide"
        :options="metricPermOptions"
        @change="updateBasePerms"
        v-model="metricPerms"
      ></check-input>
    </form-group>
    <portal to="modal">
      <z-confirm
        v-if="showSyncModal"
        @onClose="closeSyncModal"
        title="Proceed with sync?"
        primary-action-label="Sync access settings"
        primary-action-icon="alert-circle"
        @primaryAction="syncAccessSettings"
      >
        <div class="flex items-center mb-2 text-base leading-relaxed text-vanilla-100">
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
import { AppFeatures, TeamPerms } from '~/types/permTypes'

/**
 * Class for `AccessControlSettings` page. Handles controls for provider permissions and access permissions.
 */
@Component({
  components: {
    CheckInput,
    FormGroup,
    RadioGroupInput,
    ToggleInput,
    ZButton,
    ZConfirm
  },
  middleware: ['teamOnly', 'perm', 'validateProvider'],
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
  private metricPerms: Record<string, boolean | undefined> = {
    canMembersModifyMetricThresholds: false,
    canContributorsModifyMetricThresholds: false
  }
  private basePerm: TeamBasePermissionSetDefaultRepositoryPermission =
    TeamBasePermissionSetDefaultRepositoryPermission.Write

  private isFetching = false
  private showSyncModal = false
  private isSyncing = false

  /**
   * Fetch hook for AccessControlSettings page.
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    await this.refetchPerms(false)
  }

  /**
   * Mounted hook for AccessControlSettings page.
   *
   * @returns {void} void
   */
  mounted(): void {
    this.$socket.$on('permission-sync', this.toggleSyncingOff)
  }

  /**
   * BeforeDestroy hook for AccessControlSettings page.
   *
   * @returns {void} void
   */
  beforeDestroy(): void {
    this.$socket.$off('permission-sync', this.toggleSyncingOff)
  }

  get allowSyncAccessSettings(): boolean {
    const { provider } = this.$route.params
    return this.$gateKeeper.provider(AppFeatures.SYNC_ACCESS_SETTINGS, provider)
  }

  /**
   * Close the "Confirm and sync" modal.
   *
   * @returns {void} void
   */
  closeSyncModal(): void {
    this.showSyncModal = false
  }

  /**
   * Open the "Confirm and sync" modal.
   *
   * @returns {void} void
   */
  triggerUpdateSettings(): void {
    this.showSyncModal = true
  }

  /**
   * Show success/fail toast as per status in WebSocket event and toggle off the syncing state for "Manually sync access settings" button.
   *
   * @returns {void} void
   */
  toggleSyncingOff({ status }: { status: string }): void {
    if (status === 'success') {
      this.$toast.success('Access settings synced.')
    } else {
      this.$toast.danger('A problem occured while attempting to sync access settings.')
    }
    this.isSyncing = false
  }

  /**
   * Trigger mutation to manually sync access settings.
   *
   * @returns {Promise<void>} Promise<void>
   */
  async syncAccessSettings(): Promise<void> {
    this.isSyncing = true
    await this.syncVcsPermissionss({
      teamId: this.team.id
    })
  }

  /**
   * Refetches team settings for sync with provider and access permissions for members, issues, and metrics.
   *
   * @returns {Promise<void>} Promise<void>
   */
  async refetchPerms(refetch?: boolean): Promise<void> {
    this.isFetching = true
    const { owner, provider } = this.$route.params
    await this.fetchTeamSettings({
      login: owner,
      provider,
      refetch
    })
    this.syncPermissionsWithVcs = this.team.syncPermissionsWithVcs
    if (this.team.basePermissionSet?.defaultRepositoryPermission) {
      this.basePerm = this.team.basePermissionSet?.defaultRepositoryPermission
    }
    this.issuePerms = {
      canMembersIgnoreIssues: this.team.basePermissionSet?.canMembersIgnoreIssues,
      canContributorsIgnoreIssues: this.team.basePermissionSet?.canContributorsIgnoreIssues
    }
    this.metricPerms = {
      canMembersModifyMetricThresholds:
        this.team.basePermissionSet?.canMembersModifyMetricThresholds,
      canContributorsModifyMetricThresholds:
        this.team.basePermissionSet?.canContributorsModifyMetricThresholds
    }
    this.isFetching = false
  }

  /**
   * Watcher for `syncPermissionsWithVcs`. Triggers `updateAccessControlSettings` with the new value of `syncPermissionsWithVcs`.
   *
   * @returns {void} void
   */
  @Watch('syncPermissionsWithVcs', { immediate: false })
  updateVcsPermSync(newVal: boolean, oldVal: boolean): void {
    if (!this.isFetching && newVal !== oldVal) {
      this.updateAccessControlSettings({
        teamId: this.team.id,
        syncPermissionsWithVcs: newVal
      })
    }
  }

  /**
   * Updates base access permission for members and permissions for issue and metrics.
   *
   * @returns {Promise<void>} Promise<void>
   */
  async updateBasePerms(): Promise<void> {
    if (!this.isFetching) {
      try {
        const res = await this.updateTeamBasePermissions({
          teamId: this.team.id,
          defaultRepositoryPermission: this.basePerm,
          canMembersIgnoreIssues: this.issuePerms.canMembersIgnoreIssues || false,
          canContributorsIgnoreIssues: this.issuePerms.canContributorsIgnoreIssues || false,
          canMembersModifyMetricThresholds:
            this.metricPerms.canMembersModifyMetricThresholds || false,
          canContributorsModifyMetricThresholds:
            this.metricPerms.canContributorsModifyMetricThresholds || false
        })

        if (res.ok) {
          await this.refetchPerms(true)
          this.$toast.success('Access permissions updates successfully.')
        } else {
          throw new Error('Unable to update access permissions.')
        }
      } catch (e) {
        this.$toast.danger('Error while updating access permissions. Please try again.')
      }
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
      description: `Members will have full access to all repositories which they have access to, <b>except</b> the ability to add new Members and deactivating or activating analysis on it.`
    },
    {
      value: TeamBasePermissionSetDefaultRepositoryPermission.Admin,
      label: 'Administrator',
      description: `Members will have full access to all repositories which they have access to, <b>including</b> the ability to add new Members and deactivating or activating analysis on it.`
    }
  ]

  private issuePermOptions = [
    { value: 'canMembersIgnoreIssues', label: 'Allow members to ignore issues' },
    { value: 'canContributorsIgnoreIssues', label: 'Allow contributors to ignore issues' }
  ]

  private metricPermOptions = [
    {
      value: 'canMembersModifyMetricThresholds',
      label: 'Allow members to modify metric thresholds'
    },
    {
      value: 'canContributorsModifyMetricThresholds',
      label: 'Allow contributors to modify metric thresholds'
    }
  ]
}
</script>
