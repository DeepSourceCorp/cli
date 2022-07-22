<template>
  <div class="h-8 md:w-40 z-20">
    <z-select
      v-model="modelValue"
      :disabled="disabled"
      background-class="bg-ink-300"
      border-class="border-ink-300"
    >
      <template #icon>
        <z-icon :color="disabled ? 'slate' : 'vanilla-400'" icon="duration-30" />
      </template>
      <z-option
        v-for="(opt, key) in dateRangeOptions"
        :key="key"
        :label="`Last ${opt.count} ${opt.durationType}`"
        :value="key"
      />
    </z-select>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, ModelSync } from 'nuxt-property-decorator'
import { ZIcon, ZSelect, ZOption } from '@deepsourcelabs/zeal'
import { DateRangeOptionT } from '~/types/reportTypes'

/**
 * Component to show date range options for reports.
 */
@Component({
  components: {
    ZIcon,
    ZSelect,
    ZOption
  }
})
export default class DateRangePicker extends Vue {
  @ModelSync('selectedFilter', 'change', { type: String, default: '' })
  readonly modelValue: string

  @Prop({ default: () => {} })
  dateRangeOptions: Record<string, DateRangeOptionT>

  @Prop({ default: false, type: Boolean })
  disabled: boolean
}
</script>
