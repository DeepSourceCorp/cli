<template>
  <div class="max-w-2xl space-y-7 p-4 pb-24">
    <section class="space-y-5">
      <div>
        <h2 class="text-lg font-medium leading-8">General</h2>
        <p class="mt-0.5 text-sm leading-6 text-vanilla-400">Manage your workspace settings.</p>
      </div>

      <!-- VCS Connections -->

      <div
        v-if="fetchingVCSData"
        class="h-vcs-connections w-full animate-pulse rounded-md bg-ink-300"
      ></div>

      <vcs-connections v-else v-bind="vcsConnectionsProps" />
    </section>

    <!-- Preferences -->
    <section v-if="canManagePreferences" class="space-y-5">
      <h3 class="text-sm">Preferences</h3>

      <div
        v-if="fetchingOwnerPreferences"
        class="h-owner-preferences w-full animate-pulse rounded-md bg-ink-300"
      ></div>

      <div v-else class="rounded-md border border-ink-200 bg-ink-300 p-4">
        <toggle-input
          label="Fail checks when data isn't reported"
          input-width="xx-small"
          input-id="enable-api-signing"
          :value="ownerShouldTimeoutDataTrigger"
          :disabled="disableTimeoutTriggerToggle"
          :remove-y-padding="true"
          @input="updateDataTimeoutTrigger"
        >
          <template #description>
            Checks will be initiated with the run and will be marked as
            <span class="font-medium text-vanilla-200">failed</span> if no data is reported.
            <span class="font-medium text-vanilla-200">We recommend enabling this.</span>
          </template>
        </toggle-input>
      </div>
    </section>

    <!-- SSH Access -->
    <template v-if="showSshKey">
      <div
        v-if="fetchingSshKey"
        class="h-ssh-keys w-full animate-pulse rounded-md bg-ink-300"
      ></div>

      <div v-else class="rounded-md border border-ink-200 bg-ink-300 p-4">
        <template v-if="ownerPublicKey">
          <h4 class="text-sm leading-4 tracking-wide text-vanilla-300">SSH access</h4>
          <p class="mt-1.5 mb-2.5 text-xs leading-6 text-vanilla-400">
            If your repositories have external private dependencies, you need to grant DeepSource
            access to fetch those dependencies via this public key.
          </p>
          <div
            class="break-all rounded-sm border border-ink-200 bg-ink-400 p-3 font-mono text-xs text-vanilla-400"
          >
            {{ ownerPublicKey }}
          </div>
          <div class="mt-3 flex flex-col justify-between gap-2 sm:flex-row">
            <button class="auxillary-button w-full text-xs sm:w-auto" @click="copySshKey">
              <z-icon :icon="copySshBtnIcon" size="x-small" color="vanilla-100" />
              {{ copySshBtnLabel }}
            </button>
            <div v-if="canMutateSshKey" class="flex flex-wrap gap-2 sm:flex-nowrap">
              <z-button
                button-type="danger"
                size="small"
                icon="trash-2"
                class="w-full sm:w-auto"
                @click="showRemoveKeyConfirmModal = true"
              >
                Remove Key
              </z-button>
              <button
                class="auxillary-button w-full text-xs sm:w-auto"
                @click="showGenerateKeyConfirmModal = true"
              >
                <z-icon icon="refresh-ccw" size="x-small" color="vanilla-100" />
                Regenerate key
              </button>
            </div>
          </div>
        </template>

        <lazy-empty-state
          v-else
          :use-v2="true"
          :png-image-path="require('~/assets/images/ui-states/SSH-Key-136px.png')"
          :webp-image-path="require('~/assets/images/ui-states/SSH-Key-136px.webp')"
          title="No SSH key pair found"
          subtitle="Create a new key pair and use the public key to enable DeepSource access to your private dependencies."
        >
          <template #action>
            <z-button
              :disabled="updatingPublicKey"
              :is-loading="updatingPublicKey"
              size="small"
              loading-label="Generating SSH key pair"
              icon="plus"
              @click="generateSSHKeyPair"
            >
              Generate SSH key pair
            </z-button>
          </template>
        </lazy-empty-state>
      </div>
    </template>

    <delete-team-accordion
      v-if="canDeleteTeam"
      class="rounded-md border border-ink-200 bg-ink-300"
      @open-delete-team-confirm="showDeleteTeamConfirm = true"
    />

    <portal to="modal">
      <z-confirm
        v-if="showGenerateKeyConfirmModal"
        title="Confirm regenerate SSH keys?"
        subtitle="This action is irreversible and will invalidate the old key pair. You must replace the old key with the new one everywhere you're using it."
        @onClose="showGenerateKeyConfirmModal = false"
      >
        <template #footer="{ close }">
          <div class="mt-6 flex items-center justify-end space-x-4 text-right text-vanilla-100">
            <z-button button-type="ghost" class="text-vanilla-100" size="small" @click="close">
              Cancel
            </z-button>
            <z-button
              :is-loading="updatingPublicKey"
              icon="refresh-ccw"
              loading-label="Generating a new key pair"
              size="small"
              @click="generateSSHKeyPair(close)"
            >
              Confirm and regenerate keys
            </z-button>
          </div>
        </template>
      </z-confirm>
      <z-confirm
        v-if="showRemoveKeyConfirmModal"
        title="Confirm delete SSH keys?"
        subtitle="This action is irreversible. You will have to generate a new key pair and add them to all your private dependencies again."
        @onClose="showRemoveKeyConfirmModal = false"
      >
        <template #footer="{ close }">
          <div class="mt-6 flex items-center justify-end space-x-4 text-right text-vanilla-100">
            <z-button button-type="ghost" class="text-vanilla-100" size="small" @click="close">
              Cancel
            </z-button>
            <z-button
              :is-loading="updatingPublicKey"
              icon="trash-2"
              button-type="danger"
              loading-label="Removing the SSH key pair"
              size="small"
              @click="deleteSSHKeyPair(close)"
            >
              Confirm and remove keys
            </z-button>
          </div>
        </template>
      </z-confirm>

      <delete-team-confirm
        v-if="showDeleteTeamConfirm"
        :team-name="teamName"
        :deleting-team="deletingTeam"
        @close="showDeleteTeamConfirm = false"
        @delete-team="triggerTeamDeletion"
      />
    </portal>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZAvatar, ZIcon, ZButton, ZConfirm } from '@deepsource/zeal'

import ActiveUserMixin from '~/mixins/activeUserMixin'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'

import { getDefaultAvatar } from '~/utils/ui'
import { AppFeatures, TeamPerms } from '~/types/permTypes'

@Component({
  components: { ZAvatar, ZIcon, ZButton, ZConfirm },
  layout: 'dashboard',
  middleware: ['teamOnly', 'perm', 'validateProvider'],
  meta: {
    auth: {
      strict: true,
      teamPerms: [
        TeamPerms.VIEW_TEAM_GENERAL_SETTINGS,
        TeamPerms.DELETE_TEAM_ACCOUNT,
        TeamPerms.VIEW_OWNER_SSH_KEY_PAIR,
        TeamPerms.MUTATE_OWNER_SSH_KEY_PAIR,
        TeamPerms.MANAGE_PREFERENCES
      ]
    }
  },
  methods: { getDefaultAvatar }
})
export default class GeneralSettings extends mixins(ActiveUserMixin, OwnerDetailMixin) {
  fetchingVCSData = false

  // Data properties for owner preferences
  fetchingOwnerPreferences = false
  disableTimeoutTriggerToggle = false

  // Data properties for SSH section
  fetchingSshKey = false
  updatingPublicKey = false
  showGenerateKeyConfirmModal = false
  showRemoveKeyConfirmModal = false

  // Data properties for delete team section
  showDeleteTeamConfirm = false
  deletingTeam = false

  hasCopiedSshKey = false

  /**
   * Fetch hook for the general settings page.
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    const { owner: login, provider } = this.$route.params
    this.fetchingOwnerPreferences = true
    this.fetchingSshKey = true
    this.fetchingVCSData = true

    await Promise.all([
      this.fetchTeamDetails(login, provider),
      this.fetchKeyPair(login, provider),
      this.fetchPreferences(login, provider)
    ])
  }

  /**
   * Method to fetch team details.
   *
   * @param {string} login
   * @param {string} provider
   *
   * @returns {Promise<void>}
   */
  async fetchTeamDetails(login: string, provider: string): Promise<void> {
    if (!this.fetchingVCSData) {
      this.fetchingVCSData = true
    }

    try {
      if (
        !this.owner?.autofixInstallationUrl ||
        !this.owner?.vcsInstallationId ||
        this.owner?.isAutofixEnabled === undefined
      ) {
        await this.fetchVCSData({
          login,
          provider,
          refetch: true
        })
      }
    } catch (e) {
      this.$logErrorAndToast(
        e as Error,
        'Unable to fetch data about your workspace. Please contact support.'
      )
    } finally {
      this.fetchingVCSData = false
    }
  }

  /**
   * Method to fetch SSH key pair.
   *
   * @param {string} login
   * @param {string} provider
   *
   * @returns {Promise<void>}
   */
  async fetchKeyPair(login: string, provider: string): Promise<void> {
    if (!this.fetchingSshKey) {
      this.fetchingSshKey = true
    }

    try {
      await this.fetchOwnerSSHKey({
        login,
        provider
      })
    } catch (e) {
      this.$logErrorAndToast(e as Error, 'Unable to fetch SSH key. Please contact support.')
    } finally {
      this.fetchingSshKey = false
    }
  }

  /**
   * Method to fetch owner preferences.
   *
   * @param {string} login
   * @param {string} provider
   * @param {boolean} [refetch=false]
   *
   * @returns {Promise<void>}
   */
  async fetchPreferences(login: string, provider: string, refetch = false): Promise<void> {
    try {
      await this.fetchShouldTimeoutDataTrigger({ login, provider, refetch })
    } catch (e) {
      this.$logErrorAndToast(e as Error, 'An error occured while fetching owner preferences.')
    } finally {
      this.fetchingOwnerPreferences = false
    }
  }

  /**
   * Set a new timeout trigger preference
   *
   * @param {boolean} newDataTimeoutTriggerValue
   * @returns {Promise<void>}
   */
  async updateDataTimeoutTrigger(newDataTimeoutTriggerValue: boolean): Promise<void> {
    const { owner: login, provider } = this.$route.params
    this.disableTimeoutTriggerToggle = true

    try {
      const res = await this.setDataTimeoutTrigger({
        ownerId: this.owner.id,
        shouldTimeoutDataTrigger: newDataTimeoutTriggerValue
      })

      if (res) {
        this.$toast.success('Successfully updated owner preferences.')
      } else {
        this.$toast.danger('An error occured while updating owner preferences.')
      }
    } catch (e) {
      this.$logErrorAndToast(e as Error, `An error occured while updating owner preferences.`)
    } finally {
      await this.fetchPreferences(login, provider, true)
      this.disableTimeoutTriggerToggle = false
    }
  }

  /**
   * Function to close the confirm sync modal
   *
   * @callback Callback
   * @returns {Promise<void>}
   */

  /**
   * Method to generate SSH key pair.
   *
   * @param {Callback} close
   *
   * @returns {Promise<void>}
   */
  async generateSSHKeyPair(close?: () => Promise<void>): Promise<void> {
    this.updatingPublicKey = true
    try {
      await this.generateOwnerSSHKey({ ownerId: this.owner.id })

      if (close && typeof close === 'function') {
        close()
      } else {
        this.showGenerateKeyConfirmModal = false
      }
    } catch (e) {
      this.$logErrorAndToast(
        e as Error,
        'There was a problem regenerating the SSH key pair, please try later.'
      )
    } finally {
      this.updatingPublicKey = false
    }
  }

  /**
   * Method to delete SSH key pair.
   *
   * @param {Callback} close
   *
   * @returns {Promise<void>}
   */
  async deleteSSHKeyPair(close?: () => Promise<void>): Promise<void> {
    this.updatingPublicKey = true
    try {
      await this.removeOwnerSSHKey({ ownerId: this.owner.id })

      if (close) {
        close()
      } else {
        this.showRemoveKeyConfirmModal = false
      }
    } catch (e) {
      this.$logErrorAndToast(
        e as Error,
        'There was a problem deleting the SSH key pair, please try later.'
      )
    } finally {
      this.updatingPublicKey = false
    }
  }

  /**
   * Method to trigger team deletion.
   *
   * @param {Callback} close
   *
   * @returns {Promise<void>}
   */
  async triggerTeamDeletion(close?: () => void): Promise<void> {
    const teamId = this.owner?.team?.id
    if (!teamId) {
      this.$toast.danger('Unable to delete team. Please contact support.')
      return
    }
    try {
      this.deletingTeam = true
      const resp = await this.deleteTeam({
        teamId
      })

      if (resp) {
        this.$router.push('/team-deleted')
      } else {
        this.$toast.danger('Unable to delete team. Please contact support.')
      }
    } catch (e) {
      this.$logErrorAndToast(e as Error, 'Unable to delete team. Please contact support.')
    } finally {
      this.deletingTeam = false
      close?.()
    }
  }

  get ownerShouldTimeoutDataTrigger(): boolean {
    return this.owner.ownerSetting?.shouldTimeoutDataTrigger ?? false
  }

  get vcsConnectionsProps() {
    const providerShortcode =
      this.activeDashboardContext?.vcs_provider ?? this.$route.params.provider

    const vcsInstallationUrl = this.activeDashboardContext?.app_configuration_url ?? ''

    const vcsProviderDisplay =
      this.activeDashboardContext?.vcs_provider_display ??
      this.$providerMetaMap[this.$route.params.provider].text

    const vcsProviderIcon = this.$providerMetaMap[providerShortcode].icon

    const teamName = this.teamName

    const autofixAvailable = this.$gateKeeper.provider(AppFeatures.AUTOFIX, this.activeProvider)

    const autofixEnabled = this.owner?.isAutofixEnabled ?? false

    const autofixInstallationUrl = this.owner?.autofixInstallationUrl ?? ''

    return {
      vcsInstallationUrl,
      vcsProviderDisplay,
      vcsProviderIcon,
      teamName,
      autofixAvailable,
      autofixEnabled,
      autofixInstallationUrl
    }
  }

  get teamName(): string {
    return this.activeDashboardContext?.team_name ?? this.$route.params.owner
  }

  get showSshKey(): boolean {
    return this.$gateKeeper.team(TeamPerms.VIEW_OWNER_SSH_KEY_PAIR, this.teamPerms.permission)
  }

  get canMutateSshKey(): boolean {
    return this.$gateKeeper.team(TeamPerms.MUTATE_OWNER_SSH_KEY_PAIR, this.teamPerms.permission)
  }

  get ownerPublicKey(): string {
    return this.owner?.ownerSetting?.publicKey ?? ''
  }

  get canDeleteTeam(): boolean {
    return this.$gateKeeper.team(TeamPerms.DELETE_TEAM_ACCOUNT, this.teamPerms.permission)
  }

  get canManagePreferences(): boolean {
    return this.$gateKeeper.team(TeamPerms.MANAGE_PREFERENCES, this.teamPerms.permission)
  }

  get copySshBtnLabel(): string {
    return this.hasCopiedSshKey ? 'Copied' : 'Copy'
  }

  get copySshBtnIcon(): string {
    return this.hasCopiedSshKey ? 'check' : 'copy'
  }

  /**
   * Method to copy ssh key to user's clipboard
   *
   * @returns {void}
   */
  copySshKey(): void {
    if (this.ownerPublicKey) {
      this.$copyToClipboard(this.ownerPublicKey)
      this.hasCopiedSshKey = true
      setTimeout(() => {
        this.hasCopiedSshKey = false
      }, 1000)
    }
  }
}
</script>

<style scoped>
.h-owner-preferences {
  height: 95px;
}

.h-ssh-keys {
  height: 262px;
}

.h-vcs-connections {
  height: 164px;
}
</style>
