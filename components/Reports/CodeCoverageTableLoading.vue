<template>
  <section class="overflow-x-auto rounded-md border border-ink-200 leading-normal">
    <table class="table-fixed cursor w-full">
      <thead class="border-b border-ink-200">
        <tr class="uppercase text-vanilla-400 text-xs font-semibold">
          <th class="pl-4 py-2.5 text-left w-48 sm:w-auto">Repository</th>
          <th class="pr-2 w-40 text-right">
            <z-button button-type="ghost" size="x-small" color="vanilla-400" :disabled="true">
              <div class="flex items-center gap-x-2 font-semibold">
                <span class="uppercase">Line Coverage</span>
                <z-icon icon="arrow-up-down" />
              </div>
            </z-button>
          </th>
          <th class="pr-2 w-48 text-right">
            <z-button button-type="ghost" size="x-small" color="vanilla-400" :disabled="true">
              <div class="flex items-center gap-x-2 font-semibold">
                <span class="uppercase">Branch Coverage</span>
                <z-icon icon="arrow-up-down" />
              </div>
            </z-button>
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-ink-200">
        <tr v-for="idx in rowCount" :key="idx" class="h-11">
          <td class="py-2.5 pl-4 text-left">
            <div class="bg-ink-300 animate-pulse rounded-md h-5 mb-px w-48"></div>
          </td>

          <td class="py-2.5 pr-4 pl-16 text-right">
            <div class="bg-ink-300 animate-pulse rounded-md h-5 mb-px"></div>
          </td>

          <td class="py-2.5 pr-4 pl-24 text-right">
            <div class="bg-ink-300 animate-pulse rounded-md h-5 mb-px"></div>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon, ZButton } from '@deepsourcelabs/zeal'

/**
 * Loading state component for code coverage report table
 */
@Component({
  components: { ZIcon, ZButton }
})
export default class CodeCoverageTableLoading extends Vue {
  @Prop({ default: 20 })
  rowCount: number
}
</script>
