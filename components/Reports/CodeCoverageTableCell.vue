<template>
  <td class="text-right text-xs font-medium">
    <component
      :is="linkedCell ? 'nuxt-link' : 'div'"
      :to="$generateRoute([repoName, 'metrics', 'LCV'])"
      :class="isWidget ? 'pr-5' : 'pr-4'"
      class="block py-2.5"
    >
      <div v-if="isPassing !== null" class="flex font-medium justify-end">
        <ticker
          v-tooltip="{
            content: isPassing ? 'Threshold passing' : 'Threshold failing',
            delay: { show: 200, hide: 100 }
          }"
          icon-size="x-small"
          :icon="isPassing ? 'metric-high' : 'metric-low'"
          :trend-positive="isPassing"
          :trend-value="parsedValue"
          :class="{ 'cursor-pointer': linkedCell }"
        />
      </div>
      <span
        v-else-if="value !== null"
        v-tooltip="{
          content: 'Threshold not set',
          delay: { show: 200, hide: 100 }
        }"
        class="pr-1"
      >
        {{ parsedValue }}
      </span>
      <span v-else class="text-slate pr-1.5">—</span>
    </component>
  </td>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

/**
 * Table cell component for code coverage report
 */
@Component({})
export default class CodeCoverageTableCell extends Vue {
  @Prop({ default: null })
  isPassing: boolean

  @Prop({ default: false })
  isWidget: boolean

  @Prop({ default: null })
  value: number | string

  @Prop({ required: true })
  repoName: string

  @Prop({ default: false })
  linkedCell: string

  get parsedValue(): string {
    return `${this.value}%`
  }
}
</script>
