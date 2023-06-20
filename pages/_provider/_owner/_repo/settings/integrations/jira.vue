<template>
  <div>
    <breadcrumb-container
      :links="[
        { label: 'Integrations', route: $generateRoute(['settings', 'integrations']) },
        { label: 'Jira Cloud' }
      ]"
    />

    <div class="max-w-2xl space-y-6 p-4 pb-32">
      <div class="mb-4 flex flex-col justify-between gap-4 sm:flex-row">
        <integration-title
          :logo="integration.logo"
          :pending="$fetchState.pending"
          name="Jira Cloud"
        />
        <div v-if="$fetchState.pending">
          <div class="h-8 w-60 animate-pulse rounded-md bg-ink-200 bg-opacity-50"></div>
        </div>
        <integration-installed-on v-else :installed-on="installedOn" />
      </div>
      <section class="space-y-8 sm:space-y-7">
        <select-input
          v-model="selectedCloudId"
          :disabled="updatingIntegration"
          :options="cloudIdOptions"
          :remove-y-padding="true"
          :is-loading="$fetchState.pending"
          label="Atlassian site"
          input-id="jira-default-cloud-id"
          input-width="small"
          placeholder="Select a site"
        >
          <template #description>
            Issues would be created under projects in this Atlassian site unless specified in repo
            settings.
          </template>
        </select-input>

        <select-input
          v-model="selectedProject"
          :disabled="!selectedCloudId || updatingIntegration"
          :is-invalid="!isProjectValid"
          :remove-y-padding="true"
          :is-loading="$fetchState.pending"
          error-message="Select a valid project"
          :options="projectOptions"
          label="Default project"
          input-id="jira-default-project"
          input-width="small"
          placeholder="Select a project"
        >
          <template #description>
            Issues from <span class="text-vanilla-100">{{ $route.params.repo }}</span> will be
            created under the selected project.
          </template>
        </select-input>
        <select-input
          v-model="selectedIssueType"
          :disabled="!selectedCloudId || updatingIntegration"
          :is-invalid="!isIssueTypeValid"
          :remove-y-padding="true"
          :is-loading="$fetchState.pending"
          error-message="Select a valid issue type"
          :options="issueTypeOptions"
          label="Default issue type"
          input-id="jira-default-issue-type"
          input-width="small"
          placeholder="Select an issue type"
        >
          <template #description>
            Issues created from <span class="text-vanilla-100">{{ $route.params.repo }}</span> will
            have the selected issue type.
          </template>
        </select-input>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins, Watch } from 'nuxt-property-decorator'

import { IntegrationShortcodes } from '~/mixins/integrationsDetailMixin'
import JiraIntegrationMixin from '~/mixins/jiraIntegrationMixin'
import RepoDetailMixin from '~/mixins/repoDetailMixin'

import { RepoPerms } from '~/types/permTypes'
import { IntegrationSettingsLevel, UpdateIntegrationSettingsInput } from '~/types/types'

const SHORTCODE = IntegrationShortcodes.JIRA

/**
 * Repository level integrations page for Jira
 */
@Component({
  middleware: ['perm', 'teamOnly'],
  meta: {
    strict: true,
    repoPerms: [RepoPerms.CHANGE_INTEGRATION_SETTINGS]
  },
  layout: 'repository'
})
export default class RepoLevelJiraIntegrationPage extends mixins(
  RepoDetailMixin,
  JiraIntegrationMixin
) {
  updatingIntegration = false

  /**
   * Fetch hook for the component
   *
   * @return {Promise<void>}
   */
  async fetch(): Promise<void> {
    if (!this.repository.id) {
      // Fetch repository ID if not available
      const { provider, owner, repo } = this.$route.params
      await this.fetchRepoID({ provider, owner, name: repo })
    }

    await this.fetchIntegrationDetails({
      shortcode: SHORTCODE,
      level: IntegrationSettingsLevel.Repository,
      repositoryId: this.repository.id
    })

    // Set the channel preference if available
    if (this.integration.installed) {
      this.integrationOptions = this.integration.options
      this.selectedCloudId = this.integration.settings.cloud_id
      this.selectedProject = this.integration.settings.project_key
      this.selectedIssueType = this.integration.settings.issue_type
    }
  }

  /**
   * Validate the Jira config and update preferences for the user
   * This triggers everytime a value is changed
   *
   * @param {string} newValue - new value of the parameter
   * @param {string} oldValue - old value of the parameter
   *
   * @return {void}
   */
  @Watch('selectedCloudId')
  @Watch('selectedProject')
  @Watch('selectedIssueType')
  async validateAndUpdatePreferences(newValue: string, oldValue: string): Promise<void> {
    if (this.$fetchState.pending) return
    if (!newValue && !oldValue) return

    try {
      this.validateJiraConfig()
    } catch (e) {
      return
    }

    const args = {
      shortcode: SHORTCODE,
      level: IntegrationSettingsLevel.Repository,
      repositoryId: this.repository.id,
      settings: {
        cloud_id: this.selectedCloudId,
        project_key: this.selectedProject,
        issue_type: this.selectedIssueType
      }
    } as UpdateIntegrationSettingsInput

    // Dispatch the Vuex action that invokes the GQL mutation aimed at updating integration settings
    this.updatingIntegration = true
    const { ok } = await this.updateIntegrationSettings(args)

    // Show success toast on successfully updating the channel preference
    if (ok) {
      this.$toast.success(`Successfully updated the configuration for ${this.$route.params.repo}.`)
    }
    this.updatingIntegration = false
  }
}
</script>
