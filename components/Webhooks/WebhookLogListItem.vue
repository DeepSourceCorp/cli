<template>
  <nuxt-link
    :to="$generateRoute(['settings', 'webhooks', $route.params.webhookId, 'log', id])"
    as="li"
    class="h-12 items-center px-3 grid grid-cols-6 text-sm hover:bg-ink-300"
  >
    <span>
      <z-tag
        v-if="httpStatusCode"
        bgColor="ink-400 bg-opacity-20"
        textSize="xs"
        spacing="px-2 py-0.5"
        class="tracking-wider font-semibold border"
        :class="{
          'border-juniper': httpStatusCode >= 200 && httpStatusCode < 300,
          'border-honey': httpStatusCode >= 300 && httpStatusCode < 400,
          'border-cherry': httpStatusCode >= 400
        }"
      >
        {{ httpStatusCode }}
      </z-tag>
    </span>
    <code class="col-span-2 leading-none text-vanilla-100">
      <template v-if="eventType && eventType.name">
        {{ eventType.shortcode }}
      </template>
      <template v-else>
        {{ id }}
      </template>
    </code>
    <span class="col-span-2 leading-none text-vanilla-400 text-right" v-tooltip="createdAt">
      {{ fromNow(createdAt) }}
    </span>
    <span v-if="finishedIn" class="col-span-1 text-right text-vanilla-400">
      {{ finishedIn }}s
    </span>
  </nuxt-link>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZTag } from '@deepsourcelabs/zeal'
import { WebhookEventTypes } from '~/types/types'
import { fromNow } from '~/utils/date'

@Component({
  components: {
    ZTag
  }
})
export default class WebhookLogListItem extends Vue {
  @Prop({ required: true })
  id: string

  @Prop({ default: null })
  httpStatusCode: number

  @Prop({ required: true })
  eventType: WebhookEventTypes

  @Prop({ required: true })
  createdAt: string

  @Prop({ required: true })
  finishedIn: string

  public fromNow = fromNow
}
</script>
