<template>
  <div class="mb-12">
    <directory-header :info-obj="transformer" :is-loading="!fullyLoaded" type="transformer" />
    <div class="px-4 py-6 border-b border-ink-200">
      <div class="grid items-center max-w-4xl grid-cols-2 md:grid-cols-3 gap-y-6">
        <div class="grid gap-y-1">
          <p class="text-vanilla-400">Language</p>
          <div v-if="isPartiallyLoaded" class="h-8">
            <z-tag spacing="px-2.5 py-1.5" text-size="xs">
              {{ transformer.language }}
            </z-tag>
          </div>
          <div v-else class="h-6 rounded-full w-22 bg-ink-300 animate-pulse"></div>
        </div>
        <div class="grid gap-y-1">
          <p class="text-vanilla-400">Latest version</p>
          <div class="flex items-center h-8">
            <p v-if="isPartiallyLoaded" class="mb-1 text-sm">
              {{ transformer.version }}
            </p>
            <div v-else class="h-6 w-14 bg-ink-300 animate-pulse"></div>
          </div>
        </div>
        <div class="grid gap-y-1">
          <p class="text-vanilla-400">Updated on</p>
          <div class="flex items-center h-8">
            <p v-if="isPartiallyLoaded" class="text-sm">
              {{ lastTransformerChangedDateText }}
            </p>
            <div v-else class="w-16 h-6 bg-ink-300 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="max-w-4xl px-4 py-6">
      <p
        v-if="isPartiallyLoaded"
        class="text-lg font-medium prose"
        v-html="transformer.descriptionRendered"
      ></p>
      <div v-else class="w-full h-28 bg-ink-300 animate-pulse"></div>
      <div v-if="!fullyLoaded" class="w-full h-4 mt-8 bg-ink-300 animate-pulse"></div>
      <a
        v-else-if="transformer.documentationUrl"
        :href="transformer.documentationUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center mt-5 text-sm text-vanilla-400 hover:underline focus:underline"
      >
        <span>Read the documentation and full reference</span>
        <z-icon icon="arrow-up-right" color="vanilla-400" class="ml-0.5" />
      </a>
    </div>
    <div class="max-w-4xl p-4">
      <div class="flex items-center space-x-3">
        <h3 class="flex-shrink-0 text-sm font-medium tracking-wider uppercase text-vanilla-400">
          Sample configuration
        </h3>
        <hr class="flex-grow border-ink-200" />
      </div>
      <toml-box-lite
        v-if="fullyLoaded && transformer.exampleConfig"
        :toml="transformer.exampleConfig"
        class="mt-4"
      />
      <div v-else-if="!fullyLoaded" class="w-full h-40 mt-4 bg-ink-300 animate-pulse"></div>
      <lazy-empty-state v-else title="No sample configuration found!" />
    </div>
    <!-- <div class="max-w-4xl p-4">
      <div class="flex items-center space-x-3">
        <h3 class="flex-shrink-0 text-sm tracking-wider uppercase text-vanilla-400">
          What developers are saying
        </h3>
        <hr class="flex-grow border-ink-200" />
      </div>
      <div class="mt-4"></div>
    </div> -->
  </div>
</template>

<script lang="ts">
import { Component, namespace, mixins } from 'nuxt-property-decorator'

import { ZButton, ZTag, ZIcon, ZChart } from '@deepsourcelabs/zeal'

import { DirectoryActions, DirectoryGetters } from '~/store/directory/directory'
import { TransformerTool } from '~/types/types'
import { parseISODate, formatDate } from '~/utils/date'
import MetaMixin from '~/mixins/metaMixin'

const directoryStore = namespace('directory/directory')

@Component({
  components: { ZButton, ZTag, ZIcon, ZChart },
  layout: 'sidebar-only',
  scrollToTop: true
})
export default class AnalyzerDirectoryDetails extends mixins(MetaMixin) {
  @directoryStore.Getter(DirectoryGetters.DIRECTORY_TRANSFORMERS)
  transformerList: TransformerTool[]

  @directoryStore.Action(DirectoryActions.FETCH_TRANSFORMERS_DIR_LIST)
  fetchTransformers: (arg?: { q: string }) => Promise<void>

  @directoryStore.Action(DirectoryActions.FETCH_TRANSFORMER_DETAILS)
  fetchTransformerDetails: (arg: { shortcode: string }) => Promise<TransformerTool | undefined>

  private fetchedTransformer = {} as TransformerTool | undefined
  private partiallyLoaded = false
  private fullyLoaded = false

  created() {
    this.metaImage = require('~/assets/images/analyzer-dir/directory_meta_banner.png')
    this.metaImageAlt =
      'An image with the text DeepSource | Directory with logos of Python, JavaScript, Ruby, Docker, Go, Prettier and Black in the background indicating that our analyzers support them.'
  }

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
    this.metaTitle = `DeepSource: Automate ${this.transformer.language} code formatting with ${this.transformer.name} Transformer`
    this.metaDescription = `With DeepSource, you can continuously run ${this.transformer.name} code formatter on your ${this.transformer.language} code, automatically. Learn all about it here.`
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
