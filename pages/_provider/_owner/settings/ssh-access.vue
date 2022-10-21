<template>
  <div class="max-w-3xl p-4 space-y-2">
    <page-title
      class="max-w-3xl"
      title="SSH Access"
      description-width-class="max-w-2xl"
      description="If your repositories have external private dependencies, you need to grant DeepSource access to fetch those dependencies via this public key."
    />

    <!-- Skeleton loader -->
    <div v-if="$fetchState.pending" class="w-full h-40 bg-ink-300 animate-pulse"></div>

    <section v-else-if="owner.ownerSetting.publicKey">
      <div
        class="p-3 font-mono text-sm break-all border rounded-md border-ink-200 text-vanilla-400"
      >
        {{ owner.ownerSetting.publicKey }}
      </div>
      <div class="flex flex-col md:flex-row justify-between gap-2 mt-2">
        <copy-button :value="ownerPublicKey" :disabled="!ownerPublicKey" class="w-full md:w-28" />
        <div class="flex flex-wrap md:flex-nowrap gap-2">
          <z-button
            button-type="secondary"
            size="small"
            icon="refresh-ccw"
            class="w-full md:w-auto"
            @click="showGenerateConfirmModal = true"
          >
            Regenerate
          </z-button>
          <z-button
            button-type="danger"
            size="small"
            icon="trash-2"
            class="w-full md:w-auto"
            @click="showRemoveConfirmModal = true"
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
      title="An SSH key pair has not been generated yet."
      subtitle=" Generate SSH key pair."
    >
      <template #action>
        <z-button
          :disabled="updatePending"
          :is-loading="updatePending"
          size="small"
          loading-label="Generating SSH key pair"
          icon="plus"
          @click="generateSSHKeyPair"
        >
          Generate SSH key pair
        </z-button>
      </template>
    </lazy-empty-state>
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

  async fetch(): Promise<void> {
    const { owner, provider } = this.$route.params

    await this.fetchOwnerSSHKey({
      login: owner,
      provider
    })
  }

  get ownerPublicKey(): string {
    return this.owner.ownerSetting?.publicKey || ''
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
