<template>
  <div class="flex flex-col max-w-2xl p-4 gap-y-2">
    <!-- title -->
    <page-title
      class="max-w-2xl"
      title="SSH Access"
      description-width-class="max-w-2xl"
      description="If your repository has external private dependencies, you need to grant DeepSource access to fetch those dependencies via this public key."
    />

    <!-- Skeleton loader -->
    <div v-if="$fetchState.pending" class="w-full h-40 bg-ink-300 animate-pulse"></div>

    <!-- Public key description -->
    <section v-else-if="repository.encPublicKey">
      <div
        class="p-3 font-mono text-sm break-all border rounded-md border-ink-200 text-vanilla-400"
      >
        {{ this.repository.encPublicKey }}
      </div>

      <div class="flex flex-col md:flex-row justify-between gap-2 mt-2">
        <copy-button
          :value="repository.encPublicKey"
          :disabled="!repository.encPublicKey"
          class="w-full md:w-28"
        />
        <div class="flex flex-wrap md:flex-nowrap gap-2">
          <z-button
            buttonType="secondary"
            size="small"
            icon="refresh-ccw"
            class="w-full md:w-auto"
            @click="isGenerateSSHConfirmModalOpen = true"
          >
            Regenerate
          </z-button>
          <z-button
            buttonType="danger"
            size="small"
            icon="trash-2"
            class="w-full md:w-auto"
            @click="isRemoveSSHConfirmModalOpen = true"
          >
            Remove Keys
          </z-button>
        </div>
      </div>
    </section>

    <lazy-empty-state
      v-else-if="!$fetchState.pending"
      :use-v2="true"
      :png-image-path="require('~/assets/images/ui-states/SSH-Key-136px.png')"
      :webp-image-path="require('~/assets/images/ui-states/SSH-Key-136px.webp')"
      :show-border="true"
      title="No SSH key pair found"
      subtitle="Create a new key pair and use the public key to enable DeepSource access to your private dependencies."
    >
      <template #action>
        <z-button
          :disabled="updatePending"
          :is-loading="updatePending"
          size="small"
          loading-label="Generating SSH key pair"
          icon="plus"
          @click="generateKeyPair"
        >
          Generate SSH key pair
        </z-button>
      </template>
    </lazy-empty-state>

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

  public showContents(): void {
    this.hideContents = false
  }
}
</script>
