<template>
  <div>
    <breadcrumb-container
      :links="[
        { label: 'Integrations', route: $generateRoute(['settings', 'integrations']) },
        { label: 'Vanta' }
      ]"
    />

    <div v-if="$fetchState.pending" class="p-4 pb-32 md:max-w-2xl">
      <div class="mb-4 h-8 animate-pulse rounded-md bg-ink-200 bg-opacity-50"></div>
      <div class="mb-8 h-28 animate-pulse rounded-md bg-ink-200 bg-opacity-50"></div>
      <div class="h-52 animate-pulse rounded-md bg-ink-200 bg-opacity-50"></div>
    </div>

    <div v-else class="p-4 pb-32 md:max-w-2xl">
      <div class="mb-4 flex flex-col justify-between gap-4 sm:flex-row">
        <integration-title :logo="integration.logo" name="Vanta" />

        <integration-installed-on
          v-if="integration.installed"
          :installed-on="integration.installedOn"
        />

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

      <z-divider v-if="integration.installed" margin="my-4" />

      <integration-installed-by
        v-if="integration.installed"
        :avatar="avatar"
        :user-name="userName"
        :email="email"
        :enabled-on="integration.enabledOn"
        class="mb-4"
      />

      <z-divider margin="my-4" />

      <integration-info :description="integrationDescription" />

      <z-divider v-if="integration.installed" margin="my-4" />

      <div
        v-if="integration.installed"
        class="flex flex-col gap-y-4 md:flex-row md:justify-between md:gap-y-0"
      >
        <div class="max-w-sm space-y-2">
          <h2 class="text-sm text-vanilla-300">Uninstall integration</h2>
          <p class="text-xs text-vanilla-400">
            Uninstalling the Vanta integration will stop security issue reporting to your Vanta
            workspace.
          </p>
        </div>

        <z-button
          icon="x"
          button-type="danger"
          color="ink-300"
          label="Uninstall Vanta"
          size="small"
          @click="showDeleteConfirmation = true"
        />
      </div>
    </div>

    <portal to="modal">
      <z-confirm
        v-if="showDeleteConfirmation"
        title="Are you sure you want to uninstall Vanta?"
        @onClose="showDeleteConfirmation = false"
      >
        <template #footer="{ close }">
          <div class="mt-6 flex items-center justify-end space-x-4 text-right text-vanilla-100">
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
              >Yes, uninstall Vanta</z-button
            >
          </div>
        </template>
      </z-confirm>
    </portal>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'

import IntegrationsDetailMixin, { IntegrationShortcodes } from '~/mixins/integrationsDetailMixin'

import { TeamPerms } from '~/types/permTypes'

const SHORTCODE = IntegrationShortcodes.VANTA

/**
 * Owner-level integrations page for Vanta
 */
@Component({
  middleware: ['perm', 'teamOnly'],
  meta: {
    auth: {
      strict: true,
      teamPerms: [TeamPerms.MANAGE_INTEGRATIONS]
    }
  },
  layout: 'dashboard'
})
export default class VantaIntegration extends mixins(IntegrationsDetailMixin) {
  integrationDescription = `DeepSource periodically reports security issues found in the default branch of all your
    repositories to Vanta, making it easier for you to keep track of your organization's source
    code compliance.`

  /**
   * The fetch hook
   *
   *  @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    await this.fetchIntegrationData(SHORTCODE)
  }

  mounted(): void {
    this.fetchInstallationUrl(SHORTCODE)
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
   * Trigger the `uninstallIntegration` GQL mutation, and refetch the integrations list
   *
   * @returns {Promise<void>}
   */
  async uninstallIntegrationHandler(): Promise<void> {
    await this.uninstallIntegrationWrapper(SHORTCODE)
  }
}
</script>
