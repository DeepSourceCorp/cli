<template>
  <base-card
    :showInfo="false"
    :to="$generateRoute(['settings', 'webhooks', id])"
    :class="active ? '' : 'opacity-75'"
  >
    <template slot="title">
      <z-icon
        v-tooltip="active ? 'Enabled' : 'Disabled'"
        :icon="active ? 'check-circle' : 'pause-circle'"
        size="small"
        class="flex-shrink-0"
        :color="active ? 'juniper' : 'vanilla-400'"
      ></z-icon>
      <h3 class="text-base">{{ urlHost }}</h3>
    </template>
    <template slot="description">
      <div class="items-center space-y-1 md:space-y-0 md:flex md:space-x-4 mt-2">
        <div class="flex items-center space-x-1.5">
          <z-icon icon="calendar" size="x-small" color="vanilla-400"></z-icon>
          <span class="text-sm text-vanilla-400">
            Created {{ ghtf(createdAt) }}
            <template v-if="ghtf(createdAt) !== ghtf(modifiedAt)">
              &mdash; Modified {{ ghtf(modifiedAt) }}
            </template>
          </span>
        </div>
        <div class="flex items-center space-x-1.5">
          <z-icon icon="link-2" size="x-small" color="vanilla-400"></z-icon>
          <span class="text-sm text-vanilla-400">{{ formattedUrl }}</span>
        </div>
        <div v-if="eventsSubscribed.totalCount" class="flex items-center space-x-1.5">
          <z-icon icon="message-square" size="x-small" color="vanilla-400"></z-icon>
          <span class="text-sm text-vanilla-400">
            {{ eventsSubscribed.totalCount }}
            {{ eventsSubscribed.totalCount > 1 ? 'events' : 'event' }} subscribed
          </span>
        </div>
      </div>
    </template>
  </base-card>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon, ZButton } from '@deepsourcelabs/zeal'
import { WebhookEventTypesConnection } from '~/types/types'
import { getHumanizedTimeFromNow } from '~/utils/date'

@Component({
  components: {
    ZIcon,
    ZButton
  }
})
export default class WebhookCard extends Vue {
  @Prop({ required: true })
  id: string

  @Prop({ required: true })
  url: string

  @Prop({ required: false })
  active: string

  @Prop({ required: true })
  createdAt: string

  @Prop({ required: true })
  modifiedAt: string

  @Prop({ default: false })
  eventsSubscribed: WebhookEventTypesConnection

  public ghtf = getHumanizedTimeFromNow

  get urlHost(): string {
    const url = new URL(this.url)
    return url.hostname
  }

  get formattedUrl(): string {
    return this.url.length > 30 ? `${this.url.substr(0, 27)}...` : this.url
  }
}
</script>
