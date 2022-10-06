<template>
  <div class="flex gap-x-8 font-semibold text-xs">
    <chart-stat
      v-for="severity in severityList"
      :key="severity.title"
      :title="severity.title"
      :loading="loading"
    >
      <div v-if="!loading" class="flex items-center gap-x-2">
        <z-icon :icon="severity.icon" :color="severity.iconColor" size="x-small" />
        <span class="text-xs font-semibold">{{ severity.value }}</span>
      </div>
    </chart-stat>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsourcelabs/zeal'
import { shortenLargeNumber } from '~/utils/string'

interface SeverityT {
  title: string
  icon: string
  iconColor: string
  value: number
}

/**
 * Component to show total severity levels
 */
@Component({ components: { ZIcon }, methods: { shortenLargeNumber } })
export default class SeverityCounts extends Vue {
  @Prop({ default: 0 })
  high: number

  @Prop({ default: 0 })
  medium: number

  @Prop({ default: 0 })
  low: number

  @Prop({ default: false })
  loading: boolean

  get severityList(): Array<SeverityT> {
    return [
      {
        title: 'critical',
        icon: 'issue-critical',
        iconColor: 'cherry',
        value: this.high
      },
      {
        title: 'major',
        icon: 'issue-major',
        iconColor: 'honey',
        value: this.medium
      },
      {
        title: 'minor',
        icon: 'issue-minor',
        iconColor: 'vanilla-400',
        value: this.high
      }
    ]
  }
}
</script>
