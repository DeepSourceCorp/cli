<template>
  <div>
    <z-button @click="toggleModal" size="small" button-type="secondary" icon="send">
      Send test payload
    </z-button>
    <portal to="modal">
      <z-confirm v-if="showTestModal" @onClose="showTestModal = false">
        <div class="mb-2 text-base leading-relaxed text-vanilla-100">Send a test payload</div>
        <div class="text-sm leading-relaxed text-vanilla-400">
          We will send a test payload that looks like this:
          <div class="p-3 text-xs rounded-md my-3 bg-ink-200">
            <highlightjs language="json" :code="testPayload" />
          </div>
        </div>
        <template #footer="{ close }">
          <div class="mt-6 space-x-4 text-right text-vanilla-100 flex items-center justify-end">
            <z-button button-type="ghost" class="text-vanilla-100" size="small" @click="close">
              Cancel
            </z-button>
            <z-button
              icon="send"
              :is-loading="testing"
              loading-label="Sending test payload"
              class="modal-primary-action"
              size="small"
              @click="sendTestPayload(close)"
              >Send test payload</z-button
            >
          </div>
        </template>
      </z-confirm>
    </portal>
  </div>
</template>

<script lang="ts">
import { Component, mixins, Prop } from 'nuxt-property-decorator'
import { ZConfirm, ZButton } from '@deepsource/zeal'

import ActiveUserMixin from '~/mixins/activeUserMixin'
import WebhookMixin from '~/mixins/webhookMixin'

@Component({
  components: {
    ZConfirm,
    ZButton
  }
})
export default class DeleteWebhookEndpoint extends mixins(WebhookMixin, ActiveUserMixin) {
  public testing = false
  public showTestModal = false
  get testPayload(): string {
    return `{
  "id": "370440586387259393",
  "type": "test.event",
  "created": "${new Date().toISOString()}",
  "version": "v1.0.0",
  "data": {
    "Test": true
  }
}`
  }

  toggleModal(): void {
    this.showTestModal = !this.showTestModal
  }

  async sendTestPayload(close: () => void): Promise<void> {
    const { webhookId } = this.$route.params
    this.testing = true
    try {
      const response = await this.testEndpoint({ webhookId: webhookId })
      if (response.ok) {
        this.$toast.success('Sent the test payload successfully.')
        close()
      }
    } catch (e) {
      this.$toast.danger(e.message.replace('GraphQL error: ', ''))
    } finally {
      this.testing = false
    }
  }

  close(): void {
    this.showTestModal = false
  }
}
</script>
