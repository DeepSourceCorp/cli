<template>
  <div
    class="flex p-2 overflow-x-scroll border-b sm:block sm:border-0 border-ink-200 hide-scroll sm:space-y-2"
  >
    <div
      v-for="(metric, index) in dataPoints"
      :key="metric.shortcode"
      @click="toggleMetric(index)"
      :class="index == selectedIndex ? 'bg-ink-300' : 'cursor-pointer hover:bg-ink-300'"
      class="flex flex-col rounded-md p-2 space-y-4"
    >
      <div class="flex flex-row items-center justify-between flex-grow space-x-2">
        <h5
          class="block overflow-hidden text-sm leading mb-px whitespace-nowrap overflow-ellipsis tracking-snug"
          :class="{
            'text-vanilla-400': index !== selectedIndex,
            'text-vanilla-200 text-base font-semibold': index === selectedIndex
          }"
        >
          {{ metric.name }}
        </h5>
        <div
          v-if="index !== selectedIndex"
          class="hidden text-lg font-bold text-vanilla-400 sm:block"
        >
          {{ metric.display }}
        </div>
      </div>
      <div
        v-if="index == selectedIndex"
        class="flex-row items-end justify-between hidden mt-2 sm:flex"
      >
        <span class="text-lg font-bold leading-none text-vanilla-100">
          {{ metric.display }}
        </span>
        <div class="text-xs text-vanilla-400 space-x-0.5 text-right hidden sm:block">
          <z-icon
            class="inline"
            v-for="namespace in metric.namespaces.slice(0, 2)"
            :key="namespace.shortcode"
            :icon="namespace.shortcode"
            size="small"
          ></z-icon>
          <span class="inline" v-if="metric.namespaces.length > 2">
            and {{ metric.namespaces.length - 2 }} more runs
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Model } from 'nuxt-property-decorator'
import { Metrics } from '~/store/repository/detail'

import { ZIcon } from '@deepsourcelabs/zeal'

@Component({
  components: {
    ZIcon
  }
})
export default class GraphDataSelector extends Vue {
  @Prop({ default: () => [] })
  dataPoints: Array<Metrics>

  @Model('toggleMetric', { type: Number })
  readonly selectedIndex!: number

  toggleMetric(index: number): void {
    this.$emit('toggleMetric', index)
  }
}
</script>
