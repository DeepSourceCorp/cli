<template>
  <div
    v-tooltip="`This issue is marked as ${priority} priority`"
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
import { IssuePriorityTypes, IssuePriorityTypesVerbose } from '~/types/issuePriorityTypes'

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

  @Prop({ default: false })
  verboseTitle: boolean

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
    if (this.verboseTitle) {
      switch (this.priority) {
        case 'high':
          return IssuePriorityTypesVerbose.HIGH
        case 'medium':
          return IssuePriorityTypesVerbose.MEDIUM
        case 'low':
          return IssuePriorityTypesVerbose.LOW
        case 'noop':
          return IssuePriorityTypesVerbose.NOOP
        default:
          return ''
      }
    } else {
      switch (this.priority) {
        case 'high':
          return IssuePriorityTypes.HIGH
        case 'medium':
          return IssuePriorityTypes.MEDIUM
        case 'low':
          return IssuePriorityTypes.LOW
        case 'noop':
          return IssuePriorityTypes.NOOP
        default:
          return ''
      }
    }
  }
}
</script>
