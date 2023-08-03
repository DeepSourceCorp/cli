<template>
  <div class="flex flex-col gap-y-4 md:flex-row md:justify-between md:gap-y-0">
    <label class="text-sm text-vanilla-100 md:place-self-center"> Notification channel </label>

    <div class="h-8 w-full md:w-48">
      <!-- Loading state -->
      <div v-if="pending" class="h-8 animate-pulse rounded-md bg-ink-300"></div>
      <z-select
        v-else
        v-model="modelValue"
        :disabled="!hasChannelList"
        :placeholder="placeholder"
        :truncate="true"
        spacing="pl-2.5 pr-2 py-2"
        class="text-sm"
      >
        <z-option v-for="option in channelList" :key="option" :value="option">
          <div class="inline-flex flex-row gap-x-1">
            <span> # </span><span> {{ option }} </span>
          </div>
        </z-option>
      </z-select>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins, ModelSync, Prop } from 'nuxt-property-decorator'

import IntegrationsDetailMixin from '~/mixins/integrationsDetailMixin'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import { IntegrationProvider } from '~/types/types'

@Component({})

/**
 * Component that is responsible to render `Notification channel` section
 */
export default class NotificationChannelSection extends mixins(
  IntegrationsDetailMixin,
  OwnerDetailMixin,
  RepoDetailMixin
) {
  @ModelSync('channel', 'change', { type: String })
  readonly modelValue: string

  @Prop({ default: false })
  pending: boolean

  @Prop({ required: false })
  availableChannels: Array<IntegrationProvider>

  get hasChannelList(): boolean | undefined {
    if (!this.pending) {
      return (
        Boolean(this.integration.options?.channel?.length) ||
        Boolean(this.availableChannels?.length)
      )
    }
  }

  get placeholder(): string {
    // Set the placeholder text as the model value only if the channel list is available
    if (this.modelValue && this.hasChannelList) {
      return this.modelValue
    }

    return this.hasChannelList ? 'Select a channel' : 'No channels found'
  }

  get channelList(): string[] {
    // Fallback to the channel list supplied via `availableChannels` prop
    return this.integration.options?.channel || this.availableChannels || []
  }
}
</script>
