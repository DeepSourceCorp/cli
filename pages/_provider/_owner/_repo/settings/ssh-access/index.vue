<template>
  <div class="flex flex-col p-4 space-y-6">
    <!-- title -->
    <div class="text-lg font-medium text-vanilla-100">SSH Access</div>
    <!-- Public key description -->
    <div class="flex gap-x-4">
      <div class="flex flex-grow max-w-2xl">
        <div class="flex-1 text-sm text-vanilla-100">Public key</div>
        <div class="flex flex-col w-2/3 space-y-3">
          <div class="flex flex-col w-full space-y-2" v-if="repository.encPublicKey">
            <div class="h-36">
              <z-textarea
                class="
                  w-full
                  h-full
                  p-2
                  text-xs
                  bg-transparent
                  border
                  outline-none
                  resize-none
                  border-ink-200
                  text-vanilla-400
                  hide-scroll
                "
                v-model="this.repository.encPublicKey"
              >
              </z-textarea>
            </div>
            <div class="flex justify-between space-x-2">
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
          </div>
          <div v-else class="flex flex-col justify-center w-full space-y-3">
            <p class="text-small">
              An SSH key pair has not been generated for this repository yet.
            </p>
            <z-button buttonType="secondary" icon="plus" @click="generateKeyPair()">
              Generate SSH key pair
            </z-button>
          </div>
        </div>
      </div>
      <div class="hidden lg:block">
        <info-banner>
          <div>
            If your repository has external private dependencies, you need to grant DeepSource
            access to fetch those dependencies via this repository's public key.
          </div>
        </info-banner>
      </div>
    </div>
    <portal to="modal">
      <z-confirm
        v-if="isGenerateSSHConfirmModalOpen"
        @onClose="isGenerateSSHConfirmModalOpen = false"
        title="Confirm regenerate SSH keys for this repository?"
        subtitle="This action is irreversible, and will invalidate the old keys. You must replace the old keys with the new one everywhere you're using it."
        primaryActionLabel="Confirm and regenerate keys"
        @primaryAction="generateKeyPair"
      >
      </z-confirm>
      <z-confirm
        v-if="isRemoveSSHConfirmModalOpen"
        @onClose="isRemoveSSHConfirmModalOpen = false"
        title="Confirm delete SSH keys for this repository?"
        subtitle="This action is irreversible. You will have to generate a new key pair and add them to all your private dependencies again."
        primaryActionLabel="Confirm and remove keys"
        primaryActionType="danger"
        primaryActionIcon="trash-2"
        @primaryAction="removeKeyPair"
      >
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

  public async generateKeyPair(): Promise<void> {
    await this.generateSSHKey({
      repositoryId: this.repository.id
    })
    this.isGenerateSSHConfirmModalOpen = false
    await this.fetchRepositorySettingsSsh({ id: this.repository.id, refetch: true })
  }

  public async removeKeyPair(): Promise<void> {
    await this.deleteSSHKey({
      repositoryId: this.repository.id
    })
    this.isRemoveSSHConfirmModalOpen = false
    await this.fetchRepositorySettingsSsh({ id: this.repository.id, refetch: true })
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
