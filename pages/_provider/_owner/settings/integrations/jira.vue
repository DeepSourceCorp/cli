<template>
  <div>
    <breadcrumb-container
      :links="[
        { label: 'Integrations', route: $generateRoute(['settings', 'integrations']) },
        { label: 'Jira Cloud' }
      ]"
    />

    <div v-if="$fetchState.pending" class="p-4 pb-32 md:max-w-2xl">
      <div class="grid grid-cols-3">
        <div class="h-8 bg-opacity-50 rounded-md animate-pulse bg-ink-200"></div>
        <div></div>
        <div class="h-8 bg-opacity-50 rounded-md animate-pulse bg-ink-200"></div>
      </div>
      <z-divider class="opacity-50 animate-pulse" />
      <div
        v-for="ii in 3"
        :key="ii"
        class="mb-6 bg-opacity-50 rounded-md h-15 animate-pulse bg-ink-200"
      ></div>
      <z-divider class="opacity-50 animate-pulse" />
      <div class="mb-6 bg-opacity-50 rounded-md h-15 animate-pulse bg-ink-200"></div>
    </div>

    <div v-else class="p-4 pb-32 space-y-4 md:max-w-2xl">
      <div class="flex flex-col justify-between gap-4 mb-4 sm:flex-row">
        <integration-title :logo="integration.logo" name="Jira Cloud" />
        <integration-installed-on v-if="integration.installed" :installed-on="installedOn" />
        <z-button
          v-else
          :is-loading="installingIntegration"
          icon="play-circle"
          label="Install integration"
          loading-label="Installing integration"
          size="small"
          class="w-44"
          @click="installIntegrationHandler"
        />
      </div>

      <z-divider />

      <integration-installed-by
        v-if="integration.installed"
        :avatar="avatar"
        :user-name="userName"
        :email="email"
        :enabled-on="integration.enabledOn"
      />

      <z-alert v-if="isAlertVisible" type="neutral" :dismissible="true" @dismiss="hideAlert">
        <div class="space-y-2">
          <h2 class="text-sm font-medium text-vanilla-100">How does it work?</h2>
          <p class="text-xs leading-relaxed text-vanilla-400">
            Create new Jira issues for issues detected by DeepSource on your codebase.
          </p>
        </div>
      </z-alert>

      <section class="space-y-8 sm:space-y-7" v-if="integration.installed">
        <select-input
          v-model="selectedCloudId"
          :disabled="updatingIntegration"
          :options="cloudIdOptions"
          :remove-y-padding="true"
          label="Atlassian site"
          input-id="jira-default-cloud-id"
          input-width="small"
          placeholder="Select a site"
          description="Issues would be created under projects in this Atlassian site unless specified in repo settings."
        />

        <select-input
          v-model="selectedProject"
          :disabled="!selectedCloudId || updatingIntegration"
          :is-invalid="!isProjectValid"
          :remove-y-padding="true"
          error-message="Select a valid project"
          :options="projectOptions"
          label="Default project"
          input-id="jira-default-project"
          input-width="small"
          placeholder="Select a project"
          description="Issues would be created under the default project unless specified in repo settings."
        />

        <select-input
          v-model="selectedIssueType"
          :disabled="!selectedCloudId || updatingIntegration"
          :is-invalid="!isIssueTypeValid"
          :remove-y-padding="true"
          error-message="Select a valid issue type"
          :options="issueTypeOptions"
          label="Default issue type"
          input-id="jira-default-issue-type"
          input-width="small"
          placeholder="Select an issue type"
          description="Issues would be created with the default issue type unless specified in repo settings."
        />
      </section>
      <z-divider v-if="integration.installed" />

      <button-input
        v-if="integration.installed"
        :remove-y-padding="true"
        label="Uninstall integration"
        description="Uninstalling this integration from your account would stop letting you create issues
              to your Jira Cloud instance."
      >
        <z-button
          button-type="danger"
          color="ink-300"
          icon="x"
          class="w-full sm:w-auto"
          size="small"
          @click="showDeleteConfirmation = true"
        >
          Uninstall Jira Cloud
        </z-button>
      </button-input>
      <template v-else> <p class="text-xs text-vanilla-400">Not installed</p> </template>
    </div>

    <portal to="modal">
      <z-confirm
        v-if="showDeleteConfirmation"
        title="Are you sure you want to uninstall Jira Cloud?"
        subtitle="Uninstalling this integration from your account would stop letting you create
              issues to your Jira Cloud instance."
        @onClose="showDeleteConfirmation = false"
      >
        <template #footer="{ close }">
          <div class="flex items-center justify-end mt-6 space-x-4 text-right text-vanilla-100">
            <z-button button-type="ghost" size="small" class="text-vanilla-100" @click="close">
              Cancel
            </z-button>
            <z-button
              :is-loading="removingIntegration"
              button-type="danger"
              icon="x"
              size="small"
              class="modal-primary-action"
              @click="uninstallIntegrationHandler"
            >
              Yes, uninstall Jira Cloud
            </z-button>
          </div>
        </template>
      </z-confirm>
    </portal>
  </div>
</template>

<script lang="ts">
import {
  ZAlert,
  ZAvatar,
  ZBreadcrumb,
  ZBreadcrumbItem,
  ZButton,
  ZDivider,
  ZIcon,
  ZOption,
  ZSelect,
  ZTextarea,
  ZConfirm
} from '@deepsource/zeal'
import { Component, Watch, mixins } from 'nuxt-property-decorator'
import JiraIntegrationMixin from '~/mixins/jiraIntegrationMixin'

import { TeamPerms } from '~/types/permTypes'
import { IntegrationSettingsLevel, UpdateIntegrationSettingsInput } from '~/types/types'

const SHORTCODE = 'jira'

/**
 * Owner-level integrations page specific to an app
 */
@Component({
  components: {
    ZAlert,
    ZAvatar,
    ZButton,
    ZBreadcrumb,
    ZBreadcrumbItem,
    ZDivider,
    ZIcon,
    ZOption,
    ZSelect,
    ZTextarea,
    ZConfirm
  },
  middleware: ['perm', 'teamOnly'],
  meta: {
    auth: {
      strict: true,
      teamPerms: [TeamPerms.MANAGE_INTEGRATIONS]
    }
  },
  layout: 'dashboard'
})
export default class JiraIntegration extends mixins(JiraIntegrationMixin) {
  isAlertVisible = false
  updatingIntegration = false
  /**
   * The fetch hook
   *
   *  @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    await this.fetchIntegrationData(SHORTCODE)

    // Set the channel preference if available
    if (this.integration.installed) {
      this.integrationOptions = this.integration.options
      this.selectedCloudId = this.integration.settings.cloud_id
      this.selectedProject = this.integration.settings.project_key
      this.selectedIssueType = this.integration.settings.issue_type
    }
  }

  /**
   * Mounted hook
   *
   * @return {Promise<void>}
   */
  async mounted(): Promise<void> {
    this.isAlertVisible = !this.$localStore.get('integration-jira', 'is-alert-hidden') as boolean
    this.fetchInstallationUrl(SHORTCODE)
  }

  /**
   * Trigger the `uninstallIntegration` GQL mutation, and refetch the integrations list
   *
   * @returns {Promise<void>}
   */
  async uninstallIntegrationHandler(): Promise<void> {
    this.uninstallIntegrationWrapper(SHORTCODE)
  }

  /**
   * Fetch the integration installation URL, set provider, owner and owner ID information in cookies,
   * navigate to the installation URL
   *
   * @returns {Promise<void>}
   */
  async installIntegrationHandler(): Promise<void> {
    await this.getInstallationUrlSetCookiesAndRedirect(SHORTCODE)
  }

  /**
   * Reset values what the cloud ID is changed
   *
   * @param {string} newValue - new value of the cloudID
   * @param {string} oldValue - old value of the cloudID
   *
   * @return {void}
   */
  @Watch('selectedCloudId')
  resetValues(newValue: string, oldValue: string): void {
    if (this.$fetchState.pending) return
    if (newValue !== oldValue) {
      this.selectedProject = ''
      this.selectedIssueType = ''
    }
  }

  /**
   * Validate the Jira config and update preferences for the user
   * This triggeres everytime a value is changed
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
    if (!newValue) return
    if (!newValue && !oldValue) return

    try {
      this.validateJiraConfig()
    } catch {
      return
    }

    const args = {
      shortcode: SHORTCODE,
      level: IntegrationSettingsLevel.Owner,
      ownerId: this.owner.id,
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
      this.$toast.success(`Successfully updated the the configuration.`)
    }
    this.updatingIntegration = false
  }

  /**
   * Set the value of `is-alert-visible` key to `false` within `integration-slack` store (local storage)
   *
   * @returns {void}
   */
  hideAlert(): void {
    this.$localStore.set('integration-jira', 'is-alert-hidden', true)
    this.isAlertVisible = false
  }
}
</script>
