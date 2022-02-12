<template>
  <div
    v-tooltip="`Priority: ${priorityLabel}`"
    class="flex items-center gap-x-1 uppercase bg-ink-200 rounded-full px-1.5 py-1 cursor"
  >
    <span v-if="badgeType" class="h-2 rounded-full w-2" :class="badgeType" />
    <z-icon v-else icon="ellipsis-small" size="x-small" class="-mx-0.5" />
    <span class="text-xxs text-vanilla-400 tracking-wide font-medium">
      {{ priorityLabel }}
    </span>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsourcelabs/zeal'

/**
 * Component to show priority level for an issue.
 */
@Component({
  name: 'PriorityTypeBadge',
  components: {
    ZIcon
  }
})
export default class PriorityTypeBadge extends Vue {
  @Prop({ default: '' })
  priority!: string

  get badgeType() {
    switch (this.priority) {
      case 'high':
        return 'bg-cherry'
      case 'medium':
        return 'bg-honey'
      case 'low':
        return 'bg-vanilla-400'
      default:
        return ''
    }
  }

  get priorityLabel() {
    switch (this.priority) {
      case 'high':
        return 'High'
      case 'medium':
        return 'Medium'
      case 'low':
        return 'Low'
      case 'noop':
        return 'No priority'
      default:
        return ''
    }
  }
}
</script>
