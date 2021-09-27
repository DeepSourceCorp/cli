<template>
  <component
    :is="infoObj.shortcode ? 'nuxt-link' : 'div'"
    :to="
      isAnalyzer
        ? `/directory/analyzers/${infoObj.shortcode}`
        : `/directory/transformers/${infoObj.shortcode}`
    "
    class="flex flex-col border border-ink-200 rounded-md min-h-60 p-4"
    :class="{ 'hover:bg-ink-300 hover:cursor-pointer': infoObj.shortcode }"
  >
    <div class="flex justify-between space-x-2">
      <div class="h-15 w-15 flex place-items-center p-2 bg-ink-200 rounded-md flex-shrink-0">
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
    <h6 class="font-semibold mt-5 text-lg">
      {{ infoObj.name }}
    </h6>
    <div v-if="infoObj.owner" class="text-vanilla-400 text-xs">By {{ infoObj.owner }}</div>
    <div v-else class="h-5"></div>
    <p class="prose text-xs mt-2" v-html="infoObj.descriptionRendered"></p>
    <div class="flex-grow"></div>
    <div v-if="isAnalyzer" class="flex mt-4">
      <div class="w-20">
        <div class="text-xs text-vanilla-400">Total issues</div>
        <div class="text-lg">{{ infoObj.issuesCount }}</div>
      </div>
      <div>
        <div class="text-xs text-vanilla-400">Autofix issues</div>
        <div class="text-lg">{{ infoObj.autofixableIssuesCount }}</div>
      </div>
    </div>
    <div class="mt-3 flex items-center justify-between text-xs leading-none py-1">
      <span v-if="infoObj.category || infoObj.language" class="flex">
        <z-icon icon="box" size="x-small" class="mr-1" />
        {{ isAnalyzer ? infoObj.category : infoObj.language }}
      </span>
      <span v-else></span>
      <span>{{ infoObj.version }}</span>
    </div>
  </component>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZTag, ZIcon } from '@deepsourcelabs/zeal'
import { parseISODate, formatDate, getDaysDiffInDays } from '~/utils/date'
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
    return getDaysDiffInDays(Date.now(), this.infoObj.updatedOn || this.infoObj.publishedOn) <= 60
  }
}
</script>
