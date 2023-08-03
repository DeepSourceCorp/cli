<template>
  <section
    :class="isWidget ? 'max-h-92 overflow-y-auto' : 'rounded-md border border-slate-400'"
    class="overflow-x-auto leading-normal"
  >
    <table class="cursor w-full table-fixed">
      <thead class="border-b border-slate-400">
        <tr class="text-xs font-semibold uppercase text-vanilla-400">
          <th :class="isWidget ? 'pl-5' : 'pl-4 sm:w-auto'" class="w-48 py-2.5 text-left">
            Repository
          </th>
          <th :class="[isWidget ? 'w-28' : 'w-40 pr-2']" class="text-right">
            <z-button button-type="ghost" size="x-small" color="vanilla-400" :disabled="true">
              <div class="flex items-center gap-x-2 font-semibold">
                <span class="uppercase">{{ isWidget ? 'Line' : 'Line Coverage' }}</span>
                <z-icon icon="arrow-up-down" />
              </div>
            </z-button>
          </th>
          <th :class="[isWidget ? 'w-28 pr-5' : 'w-48 pr-2']" class="text-right">
            <z-button button-type="ghost" size="x-small" color="vanilla-400" :disabled="true">
              <div class="flex items-center gap-x-2 font-semibold">
                <span class="uppercase">{{ isWidget ? 'Branch' : 'Branch Coverage' }}</span>
                <z-icon icon="arrow-up-down" />
              </div>
            </z-button>
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-ink-200">
        <tr v-for="idx in rowCount" :key="idx" class="h-11">
          <td :class="isWidget ? 'pl-5' : 'pl-4'" class="py-2.5 text-left">
            <div class="mb-px h-5 w-48 animate-pulse rounded-md bg-ink-300"></div>
          </td>

          <td class="py-2.5 pl-16 pr-4 text-right">
            <div class="mb-px h-5 animate-pulse rounded-md bg-ink-300"></div>
          </td>

          <td :class="isWidget ? 'pr-5' : 'pr-4'" class="py-2.5 pl-24 text-right">
            <div class="mb-px h-5 animate-pulse rounded-md bg-ink-300"></div>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

/**
 * Loading state component for code coverage report table
 */
@Component({})
export default class CodeCoverageTableLoading extends Vue {
  @Prop({ default: false })
  isWidget: boolean

  @Prop({ default: 20 })
  rowCount: number
}
</script>
