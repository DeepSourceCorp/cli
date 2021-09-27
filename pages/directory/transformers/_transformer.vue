<template>
  <div class="mb-12">
    <directory-header :info-obj="transformer" :is-loading="!fullyLoaded" type="transformer" />
    <div class="border-b border-ink-200 px-4 py-6">
      <div class="max-w-4xl grid grid-cols-2 md:grid-cols-3 gap-y-6 items-center">
        <div class="grid gap-y-1">
          <p class="text-vanilla-400">Language</p>
          <div v-if="isPartiallyLoaded" class="h-8">
            <z-tag spacing="px-2.5 py-1.5" text-size="xs">
              {{ transformer.language }}
            </z-tag>
          </div>
          <div v-else class="h-6 w-22 bg-ink-300 animate-pulse rounded-full"></div>
        </div>
        <div class="grid gap-y-1">
          <p class="text-vanilla-400">Latest version</p>
          <div class="h-8 flex items-center">
            <p v-if="isPartiallyLoaded" class="text-sm mb-1">
              {{ transformer.version }}
            </p>
            <div v-else class="h-6 w-14 bg-ink-300 animate-pulse"></div>
          </div>
        </div>
        <div class="grid gap-y-1">
          <p class="text-vanilla-400">Updated on</p>
          <div class="h-8 flex items-center">
            <p v-if="isPartiallyLoaded" class="text-sm">
              {{ lastTransformerChangedDateText }}
            </p>
            <div v-else class="h-6 w-16 bg-ink-300 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="px-4 py-6 max-w-4xl">
      <p
        v-if="isPartiallyLoaded"
        class="prose font-medium text-lg"
        v-html="transformer.descriptionRendered"
      ></p>
      <div v-else class="h-28 w-full bg-ink-300 animate-pulse"></div>
      <div v-if="!fullyLoaded" class="h-4 w-full bg-ink-300 animate-pulse mt-8"></div>
      <a
        v-else-if="transformer.documentationUrl"
        :href="transformer.documentationUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="text-vanilla-400 text-sm hover:underline focus:underline flex items-center mt-5"
      >
        <span>Read the documentation and full reference</span>
        <z-icon icon="arrow-up-right" color="vanilla-400" class="ml-0.5" />
      </a>
    </div>
    <div class="p-4 max-w-4xl">
      <div class="flex items-center space-x-3">
        <h3 class="uppercase text-sm text-vanilla-400 tracking-wider flex-shrink-0 font-medium">
          Sample configuration
        </h3>
        <hr class="border-ink-200 flex-grow" />
      </div>
      <toml-box-lite
        v-if="fullyLoaded && transformer.exampleConfig"
        :toml="transformer.exampleConfig"
        class="mt-4"
      />
      <div v-else-if="!fullyLoaded" class="h-40 w-full bg-ink-300 animate-pulse mt-4"></div>
      <lazy-empty-state v-else title="No sample configuration found!" />
    </div>
    <!-- <div class="p-4 max-w-4xl">
      <div class="flex items-center space-x-3">
        <h3 class="uppercase text-sm text-vanilla-400 tracking-wider flex-shrink-0">
          What developers are saying
        </h3>
        <hr class="border-ink-200 flex-grow" />
      </div>
      <div class="mt-4"></div>
    </div> -->
  </div>
</template>

<script lang="ts">
import { Component, Vue, namespace } from 'nuxt-property-decorator'

import { ZButton, ZTag, ZIcon, ZChart } from '@deepsourcelabs/zeal'

import { DirectoryActions, DirectoryGetters } from '~/store/directory/directory'
import { TransformerTool } from '~/types/types'
import { parseISODate, formatDate } from '~/utils/date'

const directoryStore = namespace('directory/directory')

@Component({
  components: { ZButton, ZTag, ZIcon, ZChart },
  layout: 'sidebar-only',
  scrollToTop: true
})
export default class AnalyzerDirectoryDetails extends Vue {
  @directoryStore.Getter(DirectoryGetters.DIRECTORY_TRANSFORMERS)
  transformerList: TransformerTool[]

  @directoryStore.Action(DirectoryActions.FETCH_TRANSFORMERS_DIR_LIST)
  fetchTransformers: (arg?: { q: string }) => Promise<void>

  @directoryStore.Action(DirectoryActions.FETCH_TRANSFORMER_DETAILS)
  fetchTransformerDetails: (arg: { shortcode: string }) => Promise<TransformerTool | undefined>

  private fetchedTransformer = {} as TransformerTool | undefined
  private partiallyLoaded = false
  private fullyLoaded = false

  async fetch(): Promise<void> {
    const shortcode = this.$route.params.transformer
    if (!shortcode) this.$nuxt.error({ statusCode: 404 })
    if (!Object.keys(this.transformerList).length) {
      this.fetchTransformers().catch(() => {})
    }
    if (shortcode) {
      const transformer = await this.fetchTransformerDetails({ shortcode })
      if (transformer && Object.keys(transformer).length) this.fetchedTransformer = transformer
      else
        this.$nuxt.error({ statusCode: 404, message: `Transformer "${shortcode}" does not exist!` })
    }
    this.fullyLoaded = true
  }

  get transformer(): TransformerTool {
    let partialData = {} as TransformerTool | undefined
    if (this.transformerList && this.$route.params.analyzer) {
      partialData = this.transformerList.find(
        (transformer) => transformer.shortcode === this.$route.params.transformer
      )
      if (partialData && Object.keys(partialData).length) this.partiallyLoaded = true
    }
    return Object.assign({}, partialData, this.fetchedTransformer)
  }

  get isPartiallyLoaded(): boolean {
    return this.partiallyLoaded || this.fullyLoaded
  }

  get lastTransformerChangedDateText(): string {
    if (this.transformer.updatedOn) return formatDate(parseISODate(this.transformer.updatedOn))
    return formatDate(parseISODate(this.transformer.publishedOn))
  }

  get transformerUrl(): string {
    return `/directory/analyzers/${this.transformer.shortcode || this.$route.params.transformer}`
  }
}
</script>
