<template>
  <div class="flex items-center gap-x-3">
    <div class="hidden sm:flex items-center gap-x-1 pr-3 border-r border-r-ink-200">
      <z-tag
        v-if="low"
        v-tooltip="{ content: 'Minor issues', delay: { show: 200, hide: 100 } }"
        bg-color="transparent"
        size="x-small"
        spacing="py-0 px-2"
        icon-left="issue-minor"
        text-size="xs"
        class="border border-slate-400 gap-x-1"
      >
        {{ shortenLargeNumber(low) }}
      </z-tag>
      <z-tag
        v-if="medium"
        v-tooltip="{ content: 'Major issues', delay: { show: 200, hide: 100 } }"
        bg-color="transparent"
        size="x-small"
        spacing="py-0 px-2"
        icon-left="issue-major"
        icon-color="honey"
        text-size="xs"
        class="border border-slate-400 gap-x-1"
      >
        {{ shortenLargeNumber(medium) }}
      </z-tag>
      <z-tag
        v-if="high"
        v-tooltip="{ content: 'Critical issues', delay: { show: 200, hide: 100 } }"
        bg-color="transparent"
        size="x-small"
        spacing="py-0 px-2"
        icon-left="issue-critical"
        icon-color="cherry"
        text-size="xs"
        class="border border-slate-400 gap-x-1"
      >
        {{ shortenLargeNumber(high) }}
      </z-tag>
    </div>

    <span class="text-vanilla-100 text-sm font-semibold text-right min-w-10">
      {{ shortenLargeNumber(total) }}
    </span>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { shortenLargeNumber } from '~/utils/string'

import { ZTag } from '@deepsource/zeal'

/**
 * Component to show issue level wise tags and total value.
 */
@Component({ components: { ZTag }, methods: { shortenLargeNumber } })
export default class OccurrenceTags extends Vue {
  @Prop({ required: true })
  public total: number

  @Prop({ default: 0 })
  public high: number

  @Prop({ default: 0 })
  public medium: number

  @Prop({ default: 0 })
  public low: number
}
</script>
