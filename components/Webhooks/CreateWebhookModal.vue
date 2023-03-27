<template>
  <z-modal title="Add new endpoint" @onClose="onModalClose">
    <fieldset class="p-4 space-y-4">
      <label for="title" class="block text-sm font-medium text-vanilla-400">
        <span class="mb-2 sr-only">Endpoint URL</span>
        <z-input id="Title" v-model="url" placeholder="URL of the endpoint" :required="true" />
      </label>
      <toggle-input
        v-model="enableApiSigning"
        input-width="xx-small"
        label="Enable API signing"
        input-id="enable-api-signing"
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
          <div class="absolute flex top-1 right-1 gap-x-1 bg-ink-400">
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
      <div class="space-y-2 overflow-y-scroll max-h-52">
        <label
          v-for="event in webhookEventTypes"
          :key="event.shortcode"
          class="block p-3 border rounded-md cursor-pointer"
          :class="
            selectedEvents.includes(event.shortcode)
              ? 'border-slate-400 bg-ink-200'
              : 'border-slate-400'
          "
        >
          <div class="flex items-center mb-1">
            <z-checkbox
              v-model="selectedEvents"
              :value="event.shortcode"
              :name="event.shortcode"
              size="small"
            />
            <code class="text-sm">{{ event.shortcode }}</code>
          </div>
          <p class="ml-6 text-xs text-vanilla-400">{{ event.shortDescription }}</p>
        </label>
      </div>
    </section>
    <template #footer="{ close }">
      <div class="p-4 space-x-4 text-right text-vanilla-100 border-slate-400">
        <z-button
          :is-loading="savingWebhookEndpoint"
          :disabled="savingWebhookEndpoint || selectedEvents.length === 0"
          icon="plus"
          class="modal-primary-action"
          button-type="primary"
          size="small"
          label="Add endpoint"
          loading-label="Adding endpoint"
          @click="saveConfig(close)"
        />
      </div>
    </template>
  </z-modal>
</template>
<script lang="ts">
import { Component, Watch, mixins } from 'nuxt-property-decorator'
import { ZModal, ZInput, ZCheckbox, ZToggle, ZButton } from '@deepsource/zeal'
import WebhookMixin from '~/mixins/webhookMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import Shifty from '@deepsource/shifty'

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
  engine: Shifty

  /**
   * Nuxt Fetch hook
   *
   * @return {any}
   */
  async fetch() {
    await this.fetchWebhookEventTypesList()
  }

  /**
   * Mounted hook to generate secret
   *
   * @return {any}
   */
  mounted() {
    this.generateSecret()
  }

  /**
   * Validate config, save it, and refetch
   *
   * @param close close modal method
   *
   * @return {Promise<void>}
   */
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
      this.logErrorForUser(e as Error, 'webhook endpoint creation', args)
    } finally {
      this.savingWebhookEndpoint = false
    }
  }

  /**
   * Generate secret using shifty
   *
   * @return {void}
   */
  generateSecret(): void {
    if (!this.engine) this.engine = new Shifty(false, 32)

    this.secret = this.engine.generate()
    if (this.isSecretHidden) {
      this.isSecretHidden = false
      setTimeout(() => {
        this.isSecretHidden = true
      }, 1000)
    }
  }

  /**
   * Toggle secret visibility
   *
   * @return {void}
   */
  toggleSecretVisibility(): void {
    this.isSecretHidden = !this.isSecretHidden
  }

  /**
   * Hide secret and emit
   * @return {void}
   */
  onModalClose(): void {
    if (!this.isSecretHidden) this.isSecretHidden = true
    this.$emit('close')
  }

  /**
   * Close modal on route change
   *
   * @return {void}
   */
  @Watch('$route.path')
  closeModal(): void {
    this.$emit('close')
  }
}
</script>
