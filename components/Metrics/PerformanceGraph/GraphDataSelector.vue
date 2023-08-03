<template>
  <div
    class="hide-scroll flex overflow-x-scroll border-b border-slate-400 p-2 sm:block sm:space-y-2 sm:border-0"
  >
    <div
      v-for="(metric, index) in dataPoints"
      :key="metric.shortcode"
      :class="index == selectedIndex ? 'bg-ink-300' : 'cursor-pointer hover:bg-ink-300'"
      class="flex flex-col space-y-4 rounded-md p-2"
      @click="toggleMetric(index)"
    >
      <div class="flex flex-grow flex-row items-center justify-between space-x-2">
        <h5
          class="leading mb-px block overflow-hidden overflow-ellipsis whitespace-nowrap text-sm tracking-snug"
          :class="{
            'text-vanilla-400': index !== selectedIndex,
            'text-base font-semibold text-vanilla-200': index === selectedIndex
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
        class="mt-2 hidden flex-row items-end justify-between sm:flex"
      >
        <span class="text-lg font-bold leading-none text-vanilla-100">
          {{ metric.display }}
        </span>
        <div class="hidden space-x-0.5 text-right text-xs text-vanilla-400 sm:block">
          <z-icon
            v-for="namespace in metric.namespaces.slice(0, 2)"
            :key="namespace.shortcode"
            class="inline"
            :icon="namespace.shortcode"
            size="small"
          />
          <span v-if="metric.namespaces.length > 2" class="inline">
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

@Component({})
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
