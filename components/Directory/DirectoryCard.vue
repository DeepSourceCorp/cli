<template>
  <component
    :is="infoObj.shortcode ? 'nuxt-link' : 'div'"
    :to="
      isAnalyzer
        ? `/directory/analyzers/${infoObj.shortcode}`
        : `/directory/transformers/${infoObj.shortcode}`
    "
    class="flex min-h-48 flex-col rounded-md border border-slate-400 p-4"
    :class="{ 'hover:cursor-pointer hover:bg-ink-300': infoObj.shortcode }"
  >
    <div class="flex justify-between space-x-2">
      <div class="flex h-15 w-15 flex-shrink-0 place-items-center rounded-md bg-ink-200 p-2">
        <img
          v-if="isAnalyzer ? infoObj.analyzerLogo : infoObj.logo"
          :src="isAnalyzer ? infoObj.analyzerLogo : infoObj.logo"
          :alt="infoObj.name"
          class="m-px h-auto w-11"
        />
        <img v-else src="~/assets/images/analyzer-dir/placeholder.svg" class="opacity-40" />
      </div>
      <div class="flex-grow space-x-1.5 space-y-1.5 text-right">
        <z-tag v-if="isNew" spacing="px-2.5 py-1" text-size="xxs" bg-color="robin"> New </z-tag>
      </div>
    </div>
    <h6 class="mt-5 text-lg font-semibold">
      {{ infoObj.name }}
    </h6>
    <div v-if="infoObj.owner" class="text-xs text-vanilla-400">By {{ infoObj.owner }}</div>
    <div v-else class="h-5"></div>
    <div v-if="isAnalyzer" class="mt-4 flex">
      <div class="flex-auto">
        <div class="text-xs text-vanilla-400">Issues</div>
        <div class="text-lg">{{ infoObj.issuesCount }}</div>
      </div>
      <div v-if="infoObj.autofixableIssuesCount" class="flex-auto">
        <div class="text-xs text-vanilla-400">Autofix</div>
        <div class="text-lg">{{ infoObj.autofixableIssuesCount }}</div>
      </div>
    </div>
    <div class="mt-3 py-1 text-xs leading-none">
      <span v-if="isAnalyzer && infoObj.category" class="flex items-center">
        <z-icon icon="box" size="x-small" class="mr-1" />
        {{ infoObj.category }}
      </span>
      <span v-else-if="infoObj.language" class="flex items-center">
        <img
          v-if="infoObj.analyzer && infoObj.analyzer.analyzerLogo"
          :src="infoObj.analyzer.analyzerLogo"
          :alt="`${infoObj.language}'s logo`"
          class="mr-1 h-3 w-3"
        />
        <z-icon v-else icon="box" size="x-small" class="mr-1" />
        {{ infoObj.language }}
      </span>
    </div>
  </component>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { getDateDiffInDays } from '~/utils/date'
import { Analyzer, TransformerTool } from '~/types/types'

@Component({
  name: 'DirectoryCard'
})
export default class DirectoryCard extends Vue {
  @Prop()
  infoObj!: Analyzer | TransformerTool

  @Prop({ default: 'analyzer' })
  type!: string

  get isAnalyzer(): boolean {
    return this.type === 'analyzer'
  }

  get isNew(): boolean {
    return getDateDiffInDays(Date.now(), this.infoObj.createdAt) <= 30
  }
}
</script>
