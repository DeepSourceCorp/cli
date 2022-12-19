<template>
  <div
    v-tooltip="{ content: `${label} severity`, delay: { show: 200, hide: 100 } }"
    class="flex items-center"
    :class="[spacing]"
  >
    <z-icon :icon="iconType" size="x-small" :color="iconColor"></z-icon>
    <span class="text-sm text-vanilla-400 tracking-wide capitalize">{{ label }}</span>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsource/zeal'
import { IssueSeverity } from '~/types/types'

/**
 * Component to severity wise tag
 */
@Component({
  components: {
    ZIcon
  }
})
export default class IssueSeverityTag extends Vue {
  @Prop()
  severity: IssueSeverity

  @Prop({ default: 'gap-x-1.5' })
  spacing: string

  get label(): string {
    switch (this.severity) {
      case IssueSeverity.Critical:
        return 'Critical'
      case IssueSeverity.Major:
        return 'Major'
      case IssueSeverity.Minor:
        return 'Minor'
      default:
        // skipcq: TCV-001
        return ''
    }
  }

  get iconType(): string {
    switch (this.severity) {
      case IssueSeverity.Critical:
        return 'issue-critical'
      case IssueSeverity.Major:
        return 'issue-major'
      case IssueSeverity.Minor:
        return 'issue-minor'
      default:
        // skipcq: TCV-001
        return ''
    }
  }

  get iconColor(): string {
    switch (this.severity) {
      case IssueSeverity.Critical:
        return 'cherry'
      case IssueSeverity.Major:
        return 'honey'
      default:
        return ''
    }
  }
}
</script>
