<template>
  <div class="p-4 space-y-6">
    <h2 class="text-lg font-medium">Access control</h2>
    <form-group v-if="allowSyncAccessSettings" label="Provider Permissions">
      <toggle-input
        :label="`Automatically sync access settings from ${providerName}`"
        input-id="team-settings-access-sync"
        v-model="syncPermissionsWithVcs"
      >
        <template #description>
          <p>
            DeepSource allows some access settings to be synced automatically from
            {{ providerName }}.
            <a
              href="https://deepsource.io/docs/access-control/team-members#automatic-sync-with-github"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center text-juniper hover:underline focus:underline"
            >
              <span>Learn more</span>
              <z-icon icon="arrow-up-right" size="x-small" color="juniper" />
            </a>
          </p>

          <z-button
            :is-loading="isSyncing"
            :disabled="isSyncing"
            icon="refresh-cw"
            label="Sync manually"
            loading-label="Sync in progress..."
            button-type="secondary"
            icon-size="x-small"
            size="small"
            class="mt-2 border border-slate-400"
            @click="triggerUpdateSettings"
          />
        </template>
      </toggle-input>
    </form-group>
    <form-group label="Access permissions">
      <radio-group-input
        v-model="basePerm"
        label="Member base permissions"
        input-id="team-settings-access-base-perms"
        input-width="wide"
        :options="basePermOptions"
        @change="updateBasePerms"
      />
      <check-input
        v-model="issuePerms"
        label="Issue permissions"
        input-id="team-settings-access-issue-perms"
        input-width="wide"
        :options="issuePermOptions"
        @change="updateBasePerms"
      />
      <check-input
        v-model="metricPerms"
        label="Metric thresholds permission"
        input-id="team-settings-access-metric-perms"
        input-width="wide"
        :options="metricPermOptions"
        @change="updateBasePerms"
      />
      <check-input
        v-model="metricSuppressionPerms"
        label="Suppress metric permission"
        input-id="team-settings-access-metric-suppress"
        input-width="wide"
        :options="metricSuppressOptions"
        @change="updateBasePerms"
        @value="(e) => $toast.success(e)"
      />
    </form-group>
    <portal to="modal">
      <confirm-sync-modal
        v-if="showSyncModal"
        :provider-name="providerName"
        :team-member-role-updated-count="teamMemberRoleUpdatedCount"
        :repo-collaborator-updated-count="repoCollaboratorUpdatedCount"
        @close-sync-modal="closeSyncModal"
        @sync-access-settings="syncAccessSettings"
      />
    </portal>
  </div>
</template>

<script lang="ts">
import { Component, Watch, mixins } from 'nuxt-property-decorator'
import { ZButton, ZConfirm, ZIcon } from '@deepsource/zeal'

import { CheckInput, FormGroup, RadioGroupInput, ToggleInput } from '~/components/Form'

import TeamDetailMixin from '~/mixins/teamDetailMixin'

import modifiedPermsCount from '~/apollo/queries/team/modifiedPermsCount.gql'

import { DefaultRepositoryPermissionChoices, Team } from '~/types/types'
import { AppFeatures, TeamPerms } from '~/types/permTypes'
import { GraphqlQueryResponse } from '~/types/apolloTypes'

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
    ZConfirm,
    ZIcon
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
  syncPermissionsWithVcs = true
  issuePerms: Record<string, boolean | undefined> = {
    canMembersIgnoreIssues: false,
    canContributorsIgnoreIssues: false
  }
  metricPerms: Record<string, boolean | undefined> = {
    canMembersModifyMetricThresholds: false,
    canContributorsModifyMetricThresholds: false
  }
  metricSuppressionPerms: Record<string, boolean | undefined> = {
    canMembersIgnoreFailingMetrics: false,
    canContributorsIgnoreFailingMetrics: false
  }
  basePerm: DefaultRepositoryPermissionChoices = DefaultRepositoryPermissionChoices.Write

  isFetching = false
  showSyncModal = false
  isSyncing = false

  teamMemberRoleUpdatedCount = 0
  repoCollaboratorUpdatedCount = 0

  /**
   * Fetch hook for AccessControlSettings page.
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    await Promise.all([this.refetchPerms(false), this.fetchModifiedPermsCount()])
  }

  get providerName(): string {
    return this.$providerMetaMap[this.$route.params.provider].text
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
   * @param {boolean} overrideChangesMadeOnDeepsource
   * @returns {Promise<void>} Promise<void>
   */
  async syncAccessSettings(overrideChangesMadeOnDeepsource: boolean): Promise<void> {
    this.isSyncing = true
    await this.syncVcsPermissionss({
      teamId: this.team.id,
      overrideChangesMadeOnDeepsource
    })
    this.isSyncing = false
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
    this.metricSuppressionPerms = {
      canMembersIgnoreFailingMetrics: this.team.basePermissionSet?.canMembersIgnoreFailingMetrics,
      canContributorsIgnoreFailingMetrics:
        this.team.basePermissionSet?.canContributorsIgnoreFailingMetrics
    }

    // this.metricSuppressionPerms = {
    //   canMembersIgnoreFailingMetrics: this.team.basePermissionSet?.canMembersIgnoreFailingMetrics,
    //   canContributorsIgnoreFailingMetrics:
    //     this.team.basePermissionSet?.canContributorsIgnoreFailingMetrics
    // }
    this.isFetching = false
  }

  /**
   * Method to fetch count of updated perms
   *
   * @returns {Promise<void>}
   */
  async fetchModifiedPermsCount(): Promise<void> {
    try {
      const response: GraphqlQueryResponse = await this.$fetchGraphqlData(modifiedPermsCount, {
        login: this.$route.params.owner,
        provider: this.$providerMetaMap[this.$route.params.provider].value,
        isRoleFromVcs: false,
        first: 10
      })
      const team = response?.data?.team as Team

      this.teamMemberRoleUpdatedCount = team.teamMembers?.totalCount ?? 0
      this.repoCollaboratorUpdatedCount = team.repositoryCollaborators?.totalCount ?? 0
    } catch (e) {
      this.$logErrorAndToast(e as Error, 'Unable to fetch team data. Please conatct support.')
    }
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
            this.metricPerms.canContributorsModifyMetricThresholds || false,
          canMembersIgnoreFailingMetrics:
            this.metricSuppressionPerms.canMembersIgnoreFailingMetrics || false,
          canContributorsIgnoreFailingMetrics:
            this.metricSuppressionPerms.canContributorsIgnoreFailingMetrics || false
        })

        if (res?.ok) {
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

  basePermOptions = [
    {
      value: DefaultRepositoryPermissionChoices.None,
      label: 'No permission',
      description: `Members will have read-only access to public repositories. For private repositories, you'll need to give each Member additional access to individual repositories from the repository's settings.`
    },
    {
      value: DefaultRepositoryPermissionChoices.Read,
      label: 'Read Only',
      description: `Members will be able to only view the issues and metrics on all repositories they have access to, but won't be able to take any actions on issues. You'll need to give each Member additional access to individual repositories from the repository's settings.`
    },
    {
      value: DefaultRepositoryPermissionChoices.Write,
      label: 'Maintain',
      description: `Members will have full access to all repositories which they have access to, <b>except</b> the ability to add new Members and deactivating or activating analysis on it.`
    },
    {
      value: DefaultRepositoryPermissionChoices.Admin,
      label: 'Administrator',
      description: `Members will have full access to all repositories which they have access to, <b>including</b> the ability to add new Members and deactivating or activating analysis on it.`
    }
  ]

  issuePermOptions = [
    { value: 'canMembersIgnoreIssues', label: 'Allow members to ignore issues' },
    { value: 'canContributorsIgnoreIssues', label: 'Allow contributors to ignore issues' }
  ]

  metricPermOptions = [
    {
      value: 'canMembersModifyMetricThresholds',
      label: 'Allow members to modify metric thresholds'
    },
    {
      value: 'canContributorsModifyMetricThresholds',
      label: 'Allow contributors to modify metric thresholds'
    }
  ]

  metricSuppressOptions = [
    {
      value: 'canMembersIgnoreFailingMetrics',
      label: 'Allow members to suppress a failed metric'
    },
    {
      value: 'canContributorsIgnoreFailingMetrics',
      label: 'Allow contributors to suppress a failed metric'
    }
  ]
}
</script>
