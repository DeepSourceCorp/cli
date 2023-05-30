<template>
  <div>
    <slot :toggle-modal="toggleModal"></slot>
    <portal to="modal">
      <z-confirm v-if="showEnableModal" @onClose="showEnableModal = false">
        <div class="mb-2 text-base leading-relaxed text-vanilla-100">
          Send a test payload to enable this endpoint
        </div>
        <div class="text-sm leading-relaxed text-vanilla-400">
          We will send a test payload that looks like this:
          <div class="p-3 text-xs rounded-md my-3 bg-ink-200">
            <highlightjs language="json" :code="testPayload" />
          </div>
          <alert-box>
            The webhook will be activated once it's verified that the endpoint is properly
            configured.
          </alert-box>
        </div>
        <template #footer="{ close }">
          <div class="mt-6 space-x-4 text-right text-vanilla-100 flex items-center justify-end">
            <z-button button-type="ghost" class="text-vanilla-100" size="small" @click="close">
              Cancel
            </z-button>
            <z-button
              icon="send"
              :is-loading="enabling"
              loading-label="Sending test payload"
              class="modal-primary-action"
              size="small"
              @click="sendTestPayload(close)"
              >Verify and activate</z-button
            >
          </div>
        </template>
      </z-confirm>
    </portal>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
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
  public enabling = false
  public showEnableModal = false
  get testPayload(): string {
    return `{
  "id": "370847944204618991",
  "type": "test.event",
  "createdAt": 1642070207,
  "data": {
    "test": true
  }
}`
  }

  toggleModal(): void {
    this.showEnableModal = !this.showEnableModal
  }

  async sendTestPayload(close: () => void): Promise<void> {
    const { webhookId } = this.$route.params
    this.enabling = true
    try {
      const response = await this.testEndpoint({ webhookId: webhookId })
      if (response.ok) {
        await this.fetchSingleEndpoint({ webhookId, refetch: true })
        await this.refetchEndpointList()
        this.$emit('reset')
        this.$toast.success('Successfully enabled the webhook.')
        close()
      } else {
        throw new Error(
          'Unable to enable the webhook endpoint. If this issue persists, contact support.'
        )
      }
    } catch (e) {
      const err = e as Error
      this.$toast.danger(`${err.message.replace('GraphQL error: ', '')}.`)
    } finally {
      this.enabling = false
    }
  }

  close(): void {
    this.showEnableModal = false
  }
}
</script>
