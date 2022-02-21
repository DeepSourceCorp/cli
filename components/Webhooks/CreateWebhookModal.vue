<template>
  <z-modal title="Add new endpoint" @onClose="onModalClose">
    <fieldset class="p-4 space-y-4">
      <label for="title" class="block text-sm font-medium text-vanilla-400">
        <span class="mb-2 sr-only">Endpoint URL</span>
        <z-input
          v-model="url"
          placeholder="URL of the endpoint"
          id="Title"
          :required="true"
        ></z-input>
      </label>
      <toggle-input
        v-model="enableApiSigning"
        inputWidth="xx-small"
        label="Enable API signing"
        inputId="enable-api-signing"
        :remove-y-padding="true"
      >
        <template slot="description">
          Signing of the webhook payload allows you to verify incoming requests.
          <span class="font-medium text-vanilla-200">We recommend enabling this.</span>
        </template>
      </toggle-input>
      <label for="secret" class="block text-sm font-medium text-vanilla-400">
        <span class="mb-2 sr-only">Secret</span>
        <div class="relative">
          <z-input
            id="Title"
            :value="secret"
            :type="isSecretHidden ? 'password' : 'text'"
            :read-only="true"
            :required="enableApiSigning"
            :disabled="!enableApiSigning"
            placeholder="A randomly generated secret with at least 16 characters"
          />
          <div class="absolute top-1 right-1 flex gap-x-1 bg-ink-400">
            <z-button
              v-tooltip="isSecretHidden ? 'Reveal secret' : 'Hide secret'"
              button-type="secondary"
              :icon="isSecretHidden ? 'eye' : 'eye-off'"
              size="small"
              :disabled="!secret"
              @click="toggleSecretVisibility"
            />
            <z-button
              v-tooltip="'Generate new secret'"
              button-type="secondary"
              icon="refresh-cw"
              size="small"
              @click="generateSecret"
            />
            <copy-button
              v-tooltip="'Copy secret'"
              :icon-only="true"
              :disabled="!secret"
              :value="secret"
            />
          </div>
        </div>
      </label>
    </fieldset>
    <section class="p-4 pt-0 space-y-2">
      <h4 class="text-sm font-medium text-vanilla-400">Select events</h4>
      <!-- h-52 is the height of 3 cards (we had 3 cards at the time) -->
      <div class="max-h-52 overflow-y-scroll space-y-2">
        <label
          v-for="event in webhookEventTypes"
          :key="event.shortcode"
          class="block p-3 border rounded-md cursor-pointer"
          :class="
            selectedEvents.includes(event.shortcode)
              ? 'border-ink-100 bg-ink-200'
              : 'border-ink-200'
          "
        >
          <div class="flex items-center mb-1">
            <z-checkbox
              v-model="selectedEvents"
              :value="event.shortcode"
              :name="event.shortcode"
              size="small"
            >
            </z-checkbox>
            <code class="text-sm">{{ event.shortcode }}</code>
          </div>
          <p class="text-xs text-vanilla-400 ml-6">{{ event.shortDescription }}</p>
        </label>
      </div>
      <alert-box>
        Webhooks are still in beta, we're going to enable more events in the weeks to come.
      </alert-box>
    </section>
    <template v-slot:footer="{ close }">
      <div class="p-4 space-x-4 text-right text-vanilla-100 border-ink-200">
        <z-button
          :isLoading="savingWebhookEndpoint"
          :disabled="savingWebhookEndpoint || selectedEvents.length === 0"
          icon="plus"
          class="modal-primary-action"
          buttonType="primary"
          size="small"
          label="Add endpoint"
          loadingLabel="Adding endpoint"
          @click="saveConfig(close)"
        >
        </z-button>
      </div>
    </template>
  </z-modal>
</template>
<script lang="ts">
import { Component, Watch, mixins } from 'nuxt-property-decorator'
import { ZModal, ZInput, ZCheckbox, ZToggle, ZButton } from '@deepsourcelabs/zeal'
import WebhookMixin from '~/mixins/webhookMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'

@Component({
  components: {
    ZModal,
    ZInput,
    ZCheckbox,
    ZToggle,
    ZButton
  }
})
export default class CreateWebhookModal extends mixins(
  WebhookMixin,
  ActiveUserMixin,
  OwnerDetailMixin
) {
  public savingWebhookEndpoint = false
  public url = ''
  public secret = ''
  public enableApiSigning = true
  public isSecretHidden = true
  public selectedEvents: string[] = []

  async fetch() {
    await this.fetchWebhookEventTypesList()
  }

  async saveConfig(close: () => void): Promise<void> {
    try {
      this.validateWebhookForm(this.url, this.enableApiSigning, this.secret, this.selectedEvents)
    } catch (e) {
      this.$toast.info((e as Error).message)
      return
    }

    const args = {
      url: this.url,
      secret: this.enableApiSigning ? this.secret : '',
      apiSigning: this.enableApiSigning,
      eventsSubscribed: this.selectedEvents,
      ownerId: this.owner.id
    }

    this.savingWebhookEndpoint = true
    try {
      const response = await this.createEndpoint(args)
      const { owner, provider } = this.$route.params

      this.$toast.success('Webhook endpoint saved successfully.')
      if (response.webhook?.id) {
        this.$router.push(this.$generateRoute(['settings', 'webhooks', response.webhook?.id]))
      }
      await this.fetchWebhookEndpoints({
        login: owner,
        limit: 25,
        currentPage: 1,
        provider,
        refetch: true
      })
      close()
    } catch (e) {
      this.$toast.danger((e as Error).message)
      this.$toast.danger(
        'There was a problem saving this endpoint. If this issue persists, contact support.'
      )
      this.logSentryErrorForUser(e as Error, 'webhook endpoint creation', args)
    } finally {
      this.savingWebhookEndpoint = false
    }
  }

  async generateSecret(): Promise<void> {
    this.secret = await this.generateWebhookSecret()
    if (this.isSecretHidden) {
      this.isSecretHidden = false
      setTimeout(() => {
        this.isSecretHidden = true
      }, 1000)
    }
  }

  toggleSecretVisibility(): void {
    this.isSecretHidden = !this.isSecretHidden
  }

  onModalClose(): void {
    if (!this.isSecretHidden) this.isSecretHidden = true
    this.$emit('close')
  }

  @Watch('$route.path')
  closeModal(): void {
    this.$emit('close')
  }
}
</script>
