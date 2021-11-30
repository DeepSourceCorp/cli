<template>
  <div class="max-w-3xl p-4 space-y-2">
    <!-- title -->
    <page-title
      class="max-w-3xl"
      title="SSH Access"
      description-width-class="max-w-2xl"
      description="If your repository has external private dependencies, you need to grant DeepSource access to fetch those dependencies via this public key."
    />
    <!-- Public key description -->
    <section v-if="repository.encPublicKey">
      <div
        class="
          max-w-3xl
          p-3
          font-mono
          text-sm
          break-words
          border
          rounded-md
          border-ink-200
          text-vanilla-400
        "
      >
        {{ this.repository.encPublicKey }}
      </div>

      <div class="flex justify-between mt-2 space-x-2">
        <z-button
          buttonType="secondary"
          :icon="clipboardIcon"
          size="small"
          class="w-28"
          iconColor="vanilla-100"
          @click="copyKeys()"
          >{{ clipboardLabel }}</z-button
        >
        <div class="space-x-2">
          <z-button
            buttonType="secondary"
            size="small"
            icon="refresh-ccw"
            @click="isGenerateSSHConfirmModalOpen = true"
          >
            Regenerate
          </z-button>
          <z-button
            buttonType="danger"
            size="small"
            icon="trash-2"
            @click="isRemoveSSHConfirmModalOpen = true"
          >
            Remove Keys
          </z-button>
        </div>
      </div>
    </section>

    <empty-state
      v-else-if="!$fetchState.pending"
      class="py-20 border-2 border-dashed rounded-lg border-ink-200"
      subtitle="An SSH key pair has not been generated yet."
    >
      <template slot="action">
        <z-button
          size="small"
          :disabled="updatePending"
          :is-loading="updatePending"
          loading-label="Generating SSH key pair"
          @click="generateKeyPair()"
          icon="plus"
        >
          Generate SSH key pair
        </z-button>
      </template>
    </empty-state>
    <portal to="modal">
      <z-confirm
        v-if="isGenerateSSHConfirmModalOpen"
        @onClose="isGenerateSSHConfirmModalOpen = false"
        title="Confirm regenerate SSH keys for this repository?"
        subtitle="This action is irreversible, and will invalidate the old keys. You must replace the old keys with the new one everywhere you're using it."
      >
        <template v-slot:footer="{ close }">
          <div class="flex items-center justify-end mt-6 space-x-4 text-right text-vanilla-100">
            <z-button button-type="ghost" class="text-vanilla-100" size="small" @click="close">
              Cancel
            </z-button>
            <z-button
              :disabled="updatePending"
              :is-loading="updatePending"
              icon="refresh-ccw"
              loading-label="Generating a new key pair"
              size="small"
              @click="generateKeyPair(close)"
            >
              Confirm and regenerate keys
            </z-button>
          </div>
        </template>
      </z-confirm>
      <z-confirm
        v-if="isRemoveSSHConfirmModalOpen"
        @onClose="isRemoveSSHConfirmModalOpen = false"
        title="Confirm delete SSH keys for this repository?"
        subtitle="This action is irreversible. You will have to generate a new key pair and add them to all your private dependencies again."
      >
        <template v-slot:footer="{ close }">
          <div class="flex items-center justify-end mt-6 space-x-4 text-right text-vanilla-100">
            <z-button button-type="ghost" class="text-vanilla-100" size="small" @click="close">
              Cancel
            </z-button>
            <z-button
              :disabled="updatePending"
              :is-loading="updatePending"
              icon="trash-2"
              button-type="danger"
              loading-label="Removing the SSH key pair"
              size="small"
              @click="removeKeyPair(close)"
            >
              Confirm and remove keys
            </z-button>
          </div>
        </template>
      </z-confirm>
    </portal>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZButton, ZTextarea, ZConfirm } from '@deepsourcelabs/zeal'
import { RepositoryDetailActions } from '~/store/repository/detail'
import { InfoBanner } from '@/components/Settings/index'
import { RepoPerms } from '~/types/permTypes'
import RepoDetailMixin from '~/mixins/repoDetailMixin'

@Component({
  components: {
    ZIcon,
    ZButton,
    ZTextarea,
    ZConfirm,
    InfoBanner
  },
  layout: 'repository',
  middleware: ['perm'],
  meta: {
    auth: {
      strict: true,
      repoPerms: [RepoPerms.GENERATE_SSH_KEY_PAIR]
    }
  }
})
export default class SettingsAutofix extends mixins(RepoDetailMixin) {
  public updatePending = false
  public isGenerateSSHConfirmModalOpen = false
  public isRemoveSSHConfirmModalOpen = false

  public clipboardIcon = 'clipboard'
  public clipboardLabel = 'Copy'

  public hideContents = true

  async fetch(): Promise<void> {
    if (!this.repository.id) {
      await this.fetchBasicRepoDetails(this.baseRouteParams)
    }
    await this.fetchRepositorySettingsSsh({ id: this.repository.id })
  }

  public async generateKeyPair(close?: () => Promise<void>): Promise<void> {
    this.updatePending = true

    try {
      await this.generateSSHKey({
        repositoryId: this.repository.id
      })
      await this.fetchRepositorySettingsSsh({ id: this.repository.id, refetch: true })

      if (close && typeof close === 'function') {
        close()
      } else {
        this.isGenerateSSHConfirmModalOpen = false
      }
    } catch (e) {
      this.$toast.danger((e as Error).message.replace('GraphQL error: ', ''))
    } finally {
      this.updatePending = false
    }
  }

  public async removeKeyPair(close?: () => Promise<void>): Promise<void> {
    this.updatePending = true
    try {
      await this.deleteSSHKey({
        repositoryId: this.repository.id
      })
      await this.fetchRepositorySettingsSsh({ id: this.repository.id, refetch: true })
      if (close) {
        close()
      } else {
        this.isRemoveSSHConfirmModalOpen = false
      }
    } catch (e) {
      this.$toast.danger((e as Error).message.replace('GraphQL error: ', ''))
    } finally {
      this.updatePending = false
    }
  }

  public copyKeys(): void {
    if (this.repository.encPublicKey) {
      this.$copyToClipboard(this.repository.encPublicKey)
      this.clipboardIcon = 'check'
      this.clipboardLabel = 'Copied'
      setTimeout(() => {
        this.clipboardIcon = 'clipboard'
        this.clipboardLabel = 'Copy'
      }, 1000)
    }
  }

  public showContents(): void {
    this.hideContents = false
  }
}
</script>
