<template>
  <div class="max-w-3xl p-4 space-y-2">
    <page-title
      class="max-w-3xl"
      title="SSH Access"
      description-width-class="max-w-2xl"
      description="If your repositories have external private dependencies, you need to grant DeepSource access to fetch those dependencies via this public key."
    />
    <section v-if="owner.ownerSetting.publicKey">
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
        {{ owner.ownerSetting.publicKey }}
      </div>
      <div class="flex justify-between mt-2 space-x-2">
        <z-button
          button-type="secondary"
          :icon="clipboardIcon"
          size="small"
          class="w-28"
          iconColor="vanilla-100"
          @click="copyKeys()"
          >{{ clipboardLabel }}</z-button
        >
        <div class="space-x-2">
          <z-button
            button-type="secondary"
            size="small"
            icon="refresh-ccw"
            @click="showGenerateConfirmModal = true"
          >
            Regenerate
          </z-button>
          <z-button
            button-type="danger"
            size="small"
            icon="trash-2"
            @click="showRemoveConfirmModal = true"
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
          :is-loading="updatePending"
          @click="generateSSHKeyPair()"
          icon="plus"
        >
          Generate SSH key pair
        </z-button>
      </template>
    </empty-state>
    <portal to="modal">
      <z-confirm
        v-if="showGenerateConfirmModal"
        @onClose="showGenerateConfirmModal = false"
        title="Confirm regenerate SSH keys?"
        subtitle="This action is irreversible and will invalidate the old key pair. You must replace the old key with the new one everywhere you're using it."
      >
        <template v-slot:footer="{ close }">
          <div class="flex items-center justify-end mt-6 space-x-4 text-right text-vanilla-100">
            <z-button button-type="ghost" class="text-vanilla-100" size="small" @click="close">
              Cancel
            </z-button>
            <z-button
              :is-loading="updatePending"
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
        v-if="showRemoveConfirmModal"
        @onClose="showRemoveConfirmModal = false"
        title="Confirm delete SSH keys?"
        subtitle="This action is irreversible. You will have to generate a new key pair and add them to all your private dependencies again."
      >
        <template v-slot:footer="{ close }">
          <div class="flex items-center justify-end mt-6 space-x-4 text-right text-vanilla-100">
            <z-button button-type="ghost" class="text-vanilla-100" size="small" @click="close">
              Cancel
            </z-button>
            <z-button
              :is-loading="updatePending"
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
    </portal>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import { ZTextarea, ZButton, ZConfirm } from '@deepsourcelabs/zeal'

@Component({
  components: {
    ZTextarea,
    ZButton,
    ZConfirm
  },
  layout: 'dashboard'
})
export default class SSHAccess extends mixins(OwnerDetailMixin) {
  public updatePending = false
  public showGenerateConfirmModal = false
  public showRemoveConfirmModal = false
  public clipboardIcon = 'clipboard'
  public clipboardLabel = 'Copy'

  public copyKeys(): void {
    if (this.owner.ownerSetting?.publicKey) {
      this.$copyToClipboard(this.owner.ownerSetting?.publicKey)
      this.clipboardIcon = 'check'
      this.clipboardLabel = 'Copied'
      setTimeout(() => {
        this.clipboardIcon = 'clipboard'
        this.clipboardLabel = 'Copy'
      }, 1000)
    }
  }

  async fetch(): Promise<void> {
    const { owner, provider } = this.$route.params

    await this.fetchOwnerSSHKey({
      login: owner,
      provider
    })
  }

  async generateSSHKeyPair(close?: () => Promise<void>): Promise<void> {
    this.updatePending = true
    try {
      await this.generateOwnerSSHKey({ ownerId: this.owner.id })
      await this.$fetch()
      if (close && typeof close === 'function') {
        close()
      } else {
        this.showGenerateConfirmModal = false
      }
    } catch (e) {
      this.$toast.danger((e as Error).message.replace('GraphQL error: ', ''))
    } finally {
      this.updatePending = false
    }
  }

  async deleteSSHKeyPair(close?: () => Promise<void>): Promise<void> {
    this.updatePending = true
    try {
      await this.removeOwnerSSHKey({ ownerId: this.owner.id })
      await this.$fetch()
      if (close) {
        close()
      } else {
        this.showRemoveConfirmModal = false
      }
    } catch (e) {
      this.$toast.danger((e as Error).message.replace('GraphQL error: ', ''))
    } finally {
      this.updatePending = false
    }
  }
}
</script>
