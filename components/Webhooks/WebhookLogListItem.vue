<template>
  <nuxt-link
    :to="$generateRoute(['settings', 'webhooks', $route.params.webhookId, 'log', id])"
    as="li"
    class="grid h-12 grid-cols-6 items-center px-3 text-sm hover:bg-ink-300"
  >
    <span>
      <z-tag
        v-if="Number.isFinite(httpStatusCode)"
        bg-color="ink-400 bg-opacity-20"
        text-size="xs"
        spacing="px-2 py-0.5"
        class="border font-semibold tracking-wider"
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
    <span v-tooltip="createdAt" class="col-span-2 text-right leading-none text-vanilla-400">
      {{ fromNow(createdAt) }}
    </span>
    <span v-if="finishedIn" class="col-span-1 text-right text-vanilla-400">
      {{ finishedIn }}s
    </span>
  </nuxt-link>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { WebhookEventTypes } from '~/types/types'
import { fromNow } from '~/utils/date'

@Component({
  methods: { fromNow }
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
}
</script>
