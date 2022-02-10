<template>
  <component
    :is="infoObj.shortcode ? 'nuxt-link' : 'div'"
    :to="
      isAnalyzer
        ? `/directory/analyzers/${infoObj.shortcode}`
        : `/directory/transformers/${infoObj.shortcode}`
    "
    class="flex flex-col p-4 border rounded-md border-ink-200 min-h-48"
    :class="{ 'hover:bg-ink-300 hover:cursor-pointer': infoObj.shortcode }"
  >
    <div class="flex justify-between space-x-2">
      <div class="flex flex-shrink-0 p-2 rounded-md h-15 w-15 place-items-center bg-ink-200">
        <img
          v-if="isAnalyzer ? infoObj.analyzerLogo : infoObj.logo"
          :src="isAnalyzer ? infoObj.analyzerLogo : infoObj.logo"
          :alt="infoObj.name"
          class="m-px"
        />
        <img v-else src="~/assets/images/analyzer-dir/placeholder.svg" class="opacity-40" />
      </div>
      <div class="flex-grow text-right space-x-1.5 space-y-1.5">
        <z-tag v-if="isNew" spacing="px-2.5 py-1" text-size="xxs" bg-color="robin"> New </z-tag>
      </div>
    </div>
    <h6 class="mt-5 text-lg font-semibold">
      {{ infoObj.name }}
    </h6>
    <div v-if="infoObj.owner" class="text-xs text-vanilla-400">By {{ infoObj.owner }}</div>
    <div v-else class="h-5"></div>
    <div v-if="isAnalyzer" class="flex mt-4">
      <div class="flex-auto">
        <div class="text-xs text-vanilla-400">Issues</div>
        <div class="text-lg">{{ infoObj.issuesCount }}</div>
      </div>
      <div v-if="infoObj.autofixableIssuesCount" class="flex-auto">
        <div class="text-xs text-vanilla-400">Autofix</div>
        <div class="text-lg">{{ infoObj.autofixableIssuesCount }}</div>
      </div>
    </div>
    <div class="py-1 mt-3 text-xs leading-none">
      <span v-if="isAnalyzer && infoObj.category" class="flex items-center">
        <z-icon icon="box" size="x-small" class="mr-1" />
        {{ infoObj.category }}
      </span>
      <span v-else-if="infoObj.language" class="flex items-center">
        <img
          v-if="infoObj.analyzer && infoObj.analyzer.analyzerLogo"
          :src="infoObj.analyzer.analyzerLogo"
          :alt="`${infoObj.language}'s logo`"
          class="w-3 h-3 mr-1"
        />
        <z-icon v-else icon="box" size="x-small" class="mr-1" />
        {{ infoObj.language }}
      </span>
    </div>
  </component>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZTag, ZIcon } from '@deepsourcelabs/zeal'
import { getDateDiffInDays } from '~/utils/date'
import { Analyzer, TransformerTool } from '~/types/types'

@Component({
  components: {
    ZIcon,
    ZTag
  },
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
