<template>
  <z-modal
    :title="showSuccess ? 'Token generated successfully!' : 'Generate a new token'"
    @onClose="$emit('close')"
  >
    <section v-if="showSuccess" class="min-h-40 space-y-4 p-5">
      <!-- <h3 class="text-lg font-semibold text-center">Token generated successfully</h3> -->
      <p class="text-sm text-vanilla-400">
        <template v-if="generatedToken && generatedToken.expirationStatus === 'DOES_NOT_EXPIRE'">
          The token is set to <b class="text-vanilla-100">never expire</b>. We recommend you rotate
          this token periodically.
        </template>
        <template v-else>
          This token will expire on
          <b class="font-semibold text-vanilla-100">{{ generatedTokenExpiry }}</b
          >. Remember to rotate this token manually to prevent any service disruption.
        </template>
      </p>
      <div class="flex items-center justify-between rounded-md bg-ink-400 py-1 pl-4 pr-1 text-sm">
        <div>{{ generatedToken.token }}</div>
        <copy-button :value="generatedToken.token" button-type="secondary" class="w-24" />
      </div>
      <z-alert type="warning">
        Make sure to copy your Personal Access Token now. You won’t be able to see it again!
      </z-alert>
    </section>
    <fieldset v-else class="space-y-4 p-4">
      <p class="text-sm text-vanilla-400">
        Tokens you have generated can be used to access the DeepSource API. Services using your
        tokens have the same privileges as you.
      </p>
      <label for="title" class="block space-y-2 text-sm text-vanilla-200">
        <p class="ml-px text-sm font-semibold text-vanilla-300">Token label</p>
        <z-input
          id="title"
          v-model="label"
          v-focus
          max-length="32"
          placeholder="What’s this token for?"
          :required="true"
          class="rounded-md border-slate-400"
        />
      </label>
      <label for="expiry" class="block space-y-2 text-sm text-vanilla-200">
        <p class="ml-px text-sm font-semibold text-vanilla-300">Expiration</p>
        <div class="h-10">
          <z-select v-model="expiry" class="rounded-md bg-ink-400">
            <z-option
              v-for="dayOpt in expiryOptions"
              :key="dayOpt"
              :label="isFinite(dayOpt) ? `${dayOpt} days` : dayOpt"
              :value="dayOpt"
            />
          </z-select>
        </div>
        <p class="ml-px text-xs text-honey">
          <template v-if="isFinite(expiry)">Expires on {{ expiryDate }}</template>
          <template v-else>We recommend setting an expiry!</template>
        </p>
      </label>
    </fieldset>
    <template v-if="!showSuccess">
      <div class="space-x-4 border-slate-400 p-4 text-right text-vanilla-100">
        <z-button
          :is-loading="savingToken"
          :disabled="disableAction"
          icon="check"
          button-type="primary"
          size="small"
          label="Generate"
          loading-label="Generating"
          class="modal-primary-action"
          @click="saveToken"
        />
      </div>
    </template>
  </z-modal>
</template>
<script lang="ts">
import { Component, Watch, mixins } from 'nuxt-property-decorator'

import AccessTokenMixin, { CreatedAccessToken } from '~/mixins/accessTokenMixin'
import { formatDate, parseISODate } from '~/utils/date'
import dayjs from 'dayjs'

/**
 * Create user PAT modal
 */
@Component({})
export default class CreateTokenModal extends mixins(AccessTokenMixin) {
  public expiry = 7
  public label = ''
  public savingToken = false
  public showSuccess = false
  public generatedToken?: CreatedAccessToken = undefined
  readonly expiryOptions = [7, 15, 30, 60, 90, 'Never expire']

  /**
   * wrapper for save token mutation
   *
   * @return {Promise<void>}
   */
  async saveToken(): Promise<void> {
    this.savingToken = true
    this.generatedToken = await this.createUserAccessToken({
      description: this.label,
      expiryDays: isFinite(this.expiry) && this.expiry > 0 ? this.expiry : undefined
    })

    this.$emit('refetch')

    this.savingToken = false
    this.showSuccess = true
  }

  get generatedTokenExpiry(): string {
    if (this.generatedToken) {
      return formatDate(parseISODate(this.generatedToken.expiresAt), 'll')
    }

    return ''
  }

  get disableAction(): boolean {
    return this.savingToken || this.label === '' || !this.expiry
  }

  get expiryDate(): string {
    return formatDate(dayjs(Date.now()).add(this.expiry, 'days').toDate())
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
