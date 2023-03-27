<template>
  <z-modal
    ref="udpate-billing-details-modal"
    title="Update billing details"
    class="ph-no-capture"
    width="narrow"
    @onClose="() => $emit('onClose')"
  >
    <div class="p-4 space-y-4">
      <fieldset class="text-sm space-y-1">
        <label class="leading-loose text-vanilla-400"
          >Billing email
          <z-input
            v-model="billingEmail"
            :required="true"
            type="email"
            size="small"
            :is-invalid="emailEmpty || !validBillingEmail"
            :validate-on-blur="true"
            placeholder="jane@deepsource.io"
            class="mt-0.5"
            @blur="(ev) => validateEmail(ev.target)"
          />
        </label>
        <p v-if="emailEmpty" class="text-xs text-cherry">This field is required.</p>
        <p v-else-if="!validBillingEmail" class="text-xs text-cherry">
          Please enter a valid email.
        </p>
      </fieldset>
      <fieldset class="text-sm space-y-1">
        <label for="billing-address" class="leading-loose text-vanilla-400">Billing address</label>
        <z-textarea
          id="billing-address"
          v-model="billingAddress"
          :placeholder="`Avengers Tower \n200 Park Avenue, New York`"
          class="focus-within:border-vanilla-400 border-slate-400 bg-ink-400 text-vanilla-300"
        />
      </fieldset>
    </div>
    <template slot="footer">
      <div class="p-4 space-x-2 text-right text-vanilla-100">
        <z-button
          :button-type="loading ? 'secondary' : 'primary'"
          size="small"
          :disable="loading"
          @click="updateDetails"
        >
          <div v-if="loading" class="flex items-center space-x-1.5">
            <z-icon class="animate-spin" icon="spin-loader" color="juniper" />
            <span>Updating Details</span>
          </div>
          <div v-else class="flex items-center space-x-1.5">
            <z-icon icon="check" color="ink-400" />
            <span>Confirm and update</span>
          </div>
        </z-button>
      </div>
    </template>
  </z-modal>
</template>
<script lang="ts">
import { Vue, Component, mixins } from 'nuxt-property-decorator'
import { ZButton, ZInput, ZIcon, ZModal, ZTextarea } from '@deepsource/zeal'

import OwnerBillingMixin from '~/mixins/ownerBillingMixin'

interface ZModalInterface extends Vue {
  close?: () => void
}

@Component({
  components: {
    ZButton,
    ZInput,
    ZIcon,
    ZModal,
    ZTextarea
  }
})
export default class UpdateBillingDetailsModal extends mixins(OwnerBillingMixin) {
  private billingEmail = ''
  private billingAddress = ''
  private validBillingEmail = true
  private emailEmpty = false
  private loading = false

  async fetch(): Promise<void> {
    const { owner, provider } = this.$route.params
    await this.fetchOwnerDetails({
      login: owner,
      provider
    })

    this.billingEmail = this.owner.billingEmail || ''
    this.billingAddress = this.owner.billingAddress || ''
  }

  validateEmail(el: HTMLInputElement): void {
    this.validBillingEmail = el.checkValidity()
    if (!this.billingEmail) {
      this.emailEmpty = true
      return
    }
    this.emailEmpty = false
  }

  async updateDetails(): Promise<void> {
    const modal = this.$refs['udpate-billing-details-modal'] as ZModalInterface
    if (!this.billingEmail) {
      this.emailEmpty = true
      return
    }

    if (this.billingEmail && this.validBillingEmail) {
      const { owner, provider } = this.$route.params
      this.loading = true
      try {
        await this.updateBillingInfo({
          billingEmail: this.billingEmail,
          billingAddress: this.billingAddress,
          login: owner,
          provider
        })
        this.$toast.success('Billing email and address updated successfully.')
        if (modal && modal.close) {
          modal.close()
        } else {
          this.$emit('onClose')
        }
      } catch (e) {
        this.$toast.danger('Unable to update billing info. Please verify the details entered.')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
