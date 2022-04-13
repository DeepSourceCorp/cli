<template>
  <div>
    <button-input
      inputId="webhook-settings-toggle"
      buttonLabel="Delete endpoint"
      buttonType="danger"
      icon="trash-2"
      @click="showConfirmDelete = true"
    >
      <template slot="label">
        Delete <b>{{ title }}</b>
      </template>
      <template slot="description">
        Deleting this endpoint will disable all events and will delete all event logs.
        <span class="text-vanilla-200 font-medium">This action is not reversible.</span>
      </template>
    </button-input>
    <portal to="modal">
      <z-confirm
        v-if="showConfirmDelete"
        title="Are you sure you want to delete this endpoint?"
        subtitle="Once deleted, you won't be able to restore this endpoint"
        @onClose="showConfirmDelete = false"
      >
        <template v-slot:footer="{ close }">
          <div class="mt-6 space-x-4 text-right text-vanilla-100 flex items-center justify-end">
            <z-button buttonType="ghost" class="text-vanilla-100" size="small" @click="close">
              Cancel
            </z-button>
            <z-button
              icon="trash-2"
              class="modal-primary-action"
              buttonType="danger"
              size="small"
              @click="deleteTemplate(close)"
              >Yes, delete this endpoint</z-button
            >
          </div>
        </template>
      </z-confirm>
    </portal>
  </div>
</template>

<script lang="ts">
import { Component, mixins, Prop } from 'nuxt-property-decorator'
import { ZConfirm, ZButton } from '@deepsourcelabs/zeal'

import ActiveUserMixin from '~/mixins/activeUserMixin'
import WebhookMixin from '~/mixins/webhookMixin'

@Component({
  components: {
    ZConfirm,
    ZButton
  }
})
export default class DeleteWebhookEndpoint extends mixins(WebhookMixin, ActiveUserMixin) {
  @Prop()
  webhookId!: string

  @Prop()
  title!: string

  public deletingEndpoint = false
  public showConfirmDelete = false

  async deleteTemplate(close: () => void): Promise<void> {
    const { webhookId } = this.$route.params
    this.deletingEndpoint = true
    try {
      const response = await this.deleteEndpoint({ webhookId: webhookId })
      if (response.ok) {
        await this.refetchEndpointList()
        this.$router.push(this.$generateRoute(['settings', 'webhooks']))
        this.$toast.success('Successfully deleted the webhook.')
        close()
      } else {
        throw new Error(
          'Unable to delete webhook endpoint. If this issue persists, contact support'
        )
      }
    } catch (e) {
      this.logErrorForUser(e, 'Delete webhook', { webhookId: webhookId })
      this.$toast.danger(e.message.replace('GraphQL error: ', ''))
    } finally {
      this.deletingEndpoint = false
    }
  }

  close(): void {
    this.showConfirmDelete = false
  }
}
</script>
