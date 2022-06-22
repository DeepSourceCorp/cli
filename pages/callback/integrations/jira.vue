<template>
  <integration-callback-wrapper
    integration-logo="integration.logo"
    @triggerInstall="validateAndTriggerInstallation"
    :is-installing="isIntegrationInstalling"
    :primary-disabled="!isConfigValid"
  >
    <template #notice>
      <notice class="h-8 gap-x-3">
        <template #indicator>
          <span class="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-honey"></span>
        </template>
        <!-- Duck Norris lover Jira Aloo -->
        <p class="text-xs">Installing DeepSource for Jira Cloud</p>
      </notice>
    </template>

    <select-input
      v-model="selectedCloudId"
      label="Atlassian site"
      input-id="jira-default-cloud-id"
      input-width="x-small"
      placeholder="Select a site"
      description="Issues would be created under projects in this Atlassian site unless specified in repository settings."
      :options="cloudIdOptions"
    />

    <select-input
      v-model="selectedProject"
      label="Default project"
      input-id="jira-default-project"
      :disabled="!selectedCloudId"
      input-width="x-small"
      description="Issues would be created under the default project unless specified in repo settings."
      :options="projectOptions"
    />

    <select-input
      v-model="selectedIssueType"
      label="Default issue type"
      input-id="jira-default-issue-type"
      :disabled="!selectedCloudId"
      input-width="x-small"
      description="Issues would be created with the default issue type unless specified in repo settings."
      :options="issueTypeOptions"
    />
  </integration-callback-wrapper>
</template>

<script lang="ts">
import { Component, Watch, mixins } from 'nuxt-property-decorator'

import { JiraCookieKeys } from '~/mixins/integrationsDetailMixin'
import { TeamPerms } from '~/types/permTypes'
import { Context } from '@nuxt/types'
import { IntegrationsDetailActions } from '~/store/integrations/detail'
import {
  InstallIntegrationPayload,
  IntegrationInstallationStep,
  IntegrationSettingsLevel
} from '~/types/types'
import JiraIntegrationMixin from '~/mixins/jiraIntegrationMixin'

/**
 * Intermediary page where the integration installation happens
 */
@Component({
  middleware: [
    'perm',
    async function ({ redirect, route, store, $cookies }) {
      // Grab code and state from query params
      const { code, error, state } = route.query as Record<string, string>

      // Grab provider and owner information from cookies
      const provider = $cookies.get(JiraCookieKeys.PROVIDER)
      const owner = $cookies.get(JiraCookieKeys.OWNER)
      const ownerId = $cookies.get(JiraCookieKeys.OWNER_ID)

      // Redirect to the dashboard if any among provider, owner, or owner-id
      // is not set in cookies
      if (!provider || !owner || !ownerId) {
        return redirect('/dashboard')
      }

      const integrationsPagePath = `/${provider}/${owner}/settings/integrations/jira`

      if (!code || error || !state) {
        // Redirect to the integrations page if there is an error,
        // or if anyone among code or state query params are not available
        return redirect(integrationsPagePath)
      }

      // Trigger the GQL mutation to install the integration
      const { nextStep, options } = (await store.dispatch(
        `integrations/detail/${IntegrationsDetailActions.INSTALL_INTEGRATION}`,
        {
          step: IntegrationInstallationStep.Install,
          shortcode: 'jira',
          ownerId,
          code,
          state
        }
      )) as InstallIntegrationPayload

      // Redirect to the integrations page for Jira if the user performs a full reload
      // Triggering `installIntegration` GQL mutation `INSTALL` step would fail
      // The code send wouldn’t be valid while exchanging it for an access token
      if (!nextStep || !options) {
        return redirect(integrationsPagePath)
      }

      // Redirect to the integrations page for Jira if the URL has expired
      if (nextStep === IntegrationInstallationStep.Expired) {
        return redirect(integrationsPagePath)
      }

      await store.dispatch(
        `integrations/detail/${IntegrationsDetailActions.FETCH_INTEGRATION_LOGO_URL}`,
        { shortcode: 'jira', level: IntegrationSettingsLevel.Owner, ownerId }
      )
    }
  ],
  meta: {
    auth: {
      strict: true,
      teamPerms: [TeamPerms.MANAGE_INTEGRATIONS],
      metaDataHook: ({ $cookies }: Context) => {
        const provider = $cookies?.get(JiraCookieKeys.PROVIDER) as string
        const owner = $cookies?.get(JiraCookieKeys.OWNER) as string
        return { owner, provider }
      }
    }
  }
})
export default class JiraCallback extends mixins(JiraIntegrationMixin) {
  selectedCloudId = ''
  selectedProject = ''
  selectedIssueType = ''
  isIntegrationInstalling = false
  nextStep: IntegrationInstallationStep = IntegrationInstallationStep.Install

  /**
   * Fetch hook
   *
   * @returns {void}
   */
  fetch(): void {
    const { nextStep, options } = this.installIntegrationPayload

    if (nextStep) {
      this.nextStep = nextStep
      this.integrationOptions = options
    }
  }

  get ownerId(): string {
    return this.$cookies.get(JiraCookieKeys.OWNER_ID)
  }

  get isConfigValid(): boolean {
    try {
      this.validateJiraConfig()
      return true
    } catch {
      return false
    }
  }

  /**
   * Validate the JIRA config ang trigger installation
   *
   * @return {Promise<void>}
   */
  async validateAndTriggerInstallation(): Promise<void> {
    const { code, state } = this.$route.query as Record<string, string>

    this.isIntegrationInstalling = true

    try {
      this.validateJiraConfig()
      const response = await this.installIntegration({
        step: this.nextStep,
        shortcode: 'jira',
        ownerId: this.ownerId,
        state,
        code,
        settings: {
          project_key: this.selectedProject,
          issue_type: this.selectedIssueType,
          cloud_id: this.selectedCloudId
        }
      })
      if (response?.nextStep) {
        if (response.nextStep === IntegrationInstallationStep.Expired) {
          this.$toast.danger('Installation failed, URL expired. Please try again.')
        }

        if (response.nextStep === IntegrationInstallationStep.Complete) {
          // Refetch integration details on successfully completing the installation
          await this.fetchIntegrationDetails({
            shortcode: 'jira',
            level: IntegrationSettingsLevel.Owner,
            ownerId: this.ownerId,
            refetch: true
          })
          this.isIntegrationInstalling = false
          this.$toast.success('Installation succeeded.')
          this.redirectToIntegrationsPage()
        }
      }
    } catch (e) {
      this.isIntegrationInstalling = false
      this.$toast.danger((e as Error).message)
    }
  }

  /**
   * Redirect to the integrations page for Jira
   *
   * @returns {void}
   */
  redirectToIntegrationsPage(): void {
    // Grab provider and owner information from cookies
    const provider = this.$cookies.get(JiraCookieKeys.PROVIDER)
    const owner = this.$cookies.get(JiraCookieKeys.OWNER)

    this.$cookies.remove(JiraCookieKeys.PROVIDER)
    this.$cookies.remove(JiraCookieKeys.OWNER)

    // Redirect to the integrations page
    this.$nuxt.$router.push(`/${provider}/${owner}/settings/integrations/jira`)
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
}
</script>
