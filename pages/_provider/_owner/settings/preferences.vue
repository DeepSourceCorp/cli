<template>
  <div class="max-w-3xl p-4 space-y-2">
    <h1 class="text-lg font-medium text-vanilla-100">Preferences</h1>

    <toggle-input
      :value="ownerShouldTimeoutDataTrigger"
      input-width="xx-small"
      label="Fail checks when data isn't reported"
      input-id="enable-api-signing"
      :remove-y-padding="true"
      @input="updateDataTimeoutTrigger"
    >
      <template slot="description">
        Checks will be initiated with the run and will be marked as
        <span class="font-medium text-vanilla-200">failed</span> if no data is reported.
        <span class="font-medium text-vanilla-200">We recommend enabling this.</span>
      </template>
    </toggle-input>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { ZTextarea, ZButton, ZConfirm } from '@deepsource/zeal'
import { Owner } from '~/types/types'
import { OwnerDetailActions } from '~/store/owner/detail'

const ownerStore = namespace('owner/detail')

/**
 * ? Preferences page for Owner settings. Has:
 * ? - Toggle for artefact upload timeout.
 */
@Component({
  components: {
    ZTextarea,
    ZButton,
    ZConfirm
  },
  layout: 'dashboard'
})
export default class PreferencesPage extends Vue {
  @ownerStore.State
  owner: Owner

  @ownerStore.Action(OwnerDetailActions.FETCH_OWNER_PREFERENCES)
  fetchOwnerPreferences: (args: {
    login: string
    provider: string
    refetch?: boolean
  }) => Promise<void>

  @ownerStore.Action(OwnerDetailActions.SET_DATA_TIMEOUT_TRIGGER)
  setDataTimeoutTrigger: (args: {
    ownerId: string
    shouldTimeoutDataTrigger: boolean
  }) => Promise<boolean | undefined>

  /**
   * Fetch hook for the Preferences page.
   */
  async fetch(): Promise<void> {
    const { owner, provider } = this.$route.params
    await this.fetchOwnerPreferences({ login: owner, provider, refetch: true })
  }

  get ownerShouldTimeoutDataTrigger(): boolean {
    return this.owner.ownerSetting?.shouldTimeoutDataTrigger ?? false
  }

  /**
   * Set a new timeout trigger preference
   */
  async updateDataTimeoutTrigger(newDataTimeoutTriggerValue: boolean) {
    await this.setDataTimeoutTrigger({
      ownerId: this.owner.id,
      shouldTimeoutDataTrigger: newDataTimeoutTriggerValue
    })
  }
}
</script>
