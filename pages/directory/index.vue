<template>
  <div class="pb-8">
    <hero-header
      title="Directory"
      class="directory-hero"
      subtitle="Documentation, links, and a smart search experience for all our Analyzers and Transformers."
    >
      <z-input
        size="large"
        placeholder="Look up a programming language or linter..."
        background-color="ink-300"
        :show-border="false"
        :value="searchTerm"
        class="mt-4 rounded-md shadow-lg"
        @debounceInput="searchDir"
      >
        <z-icon icon="search" size="base" color="vanilla-400" class="ml-3 mr-1" slot="left" />
      </z-input>
    </hero-header>
    <section class="px-4">
      <!-- <h2 class="text-2xl font-semibold text-vanilla-400">Analyzers</h2> -->
      <div class="flex items-center space-x-3">
        <h2 class="flex-shrink-0 font-medium tracking-wider uppercase text-vanilla-400">
          Analyzers
        </h2>
        <hr class="flex-grow border-ink-200" />
      </div>
      <div
        v-if="areAnalyzersLoading"
        class="grid grid-cols-1 gap-4 mt-4 md:grid-cols-3 xl:grid-cols-4"
      >
        <directory-card-skeleton v-for="loader in 8" :key="loader" />
      </div>
      <div
        v-else-if="analyzerList.length"
        class="grid grid-cols-1 gap-4 mt-4 md:grid-cols-3 xl:grid-cols-4"
      >
        <directory-card
          v-for="analyzer in analyzerList"
          :key="analyzer.shortcode"
          :info-obj="analyzer"
        />
      </div>
      <lazy-empty-state
        v-else
        title="No Analyzers found!"
        :webp-image-path="require('~/assets/images/ui-states/directory/empty-search.webp')"
        :png-image-path="require('~/assets/images/ui-states/directory/empty-search.png')"
        image-width="w-28"
      />
    </section>
    <section class="px-4 pb-4 mt-10">
      <div class="flex items-center space-x-3">
        <h2 class="flex-shrink-0 font-medium tracking-wider uppercase text-vanilla-400">
          Transformers
        </h2>
        <hr class="flex-grow border-ink-200" />
      </div>
      <div
        v-if="areTransformersLoading"
        class="grid grid-cols-1 gap-4 mt-4 md:grid-cols-3 xl:grid-cols-4"
      >
        <directory-card-skeleton v-for="loader in 8" :key="loader" type="transformer" />
      </div>
      <div
        v-else-if="transformerList.length"
        class="grid grid-cols-1 gap-4 mt-4 md:grid-cols-3 xl:grid-cols-4"
      >
        <directory-card
          v-for="transformer in transformerList"
          type="transformer"
          :key="transformer.shortcode"
          :info-obj="transformer"
        />
      </div>
      <lazy-empty-state
        v-else
        title="No Transformers found!"
        :webp-image-path="require('~/assets/images/ui-states/directory/empty-search.webp')"
        :png-image-path="require('~/assets/images/ui-states/directory/empty-search.png')"
        image-width="w-28"
      />
    </section>
  </div>
</template>

<script lang="ts">
import { Component, namespace, mixins } from 'nuxt-property-decorator'

import { ZIcon, ZInput } from '@deepsourcelabs/zeal'

import MetaMixin from '~/mixins/metaMixin'
import { DirectoryActions, DirectoryGetters } from '~/store/directory/directory'
import { Analyzer, TransformerTool } from '~/types/types'

const directoryStore = namespace('directory/directory')

@Component({
  components: { ZIcon, ZInput },
  layout: 'sidebar-only',
  scrollToTop: true
})
export default class AnalyzersDirectory extends mixins(MetaMixin) {
  @directoryStore.Getter(DirectoryGetters.DIRECTORY_ANALYZERS)
  analyzerList: Analyzer[]

  @directoryStore.Action(DirectoryActions.FETCH_ANALYZER_DIR_LIST)
  fetchAnalyzers: (arg?: { q: string }) => Promise<void>

  @directoryStore.Getter(DirectoryGetters.DIRECTORY_TRANSFORMERS)
  transformerList: TransformerTool[]

  @directoryStore.Action(DirectoryActions.FETCH_TRANSFORMERS_DIR_LIST)
  fetchTransformers: (arg?: { q: string }) => Promise<void>

  public searchTerm = ''
  public areAnalyzersLoading = false
  public areTransformersLoading = false

  created() {
    this.metaTitle = `Directory • DeepSource`
    this.metaDescription =
      'Documentation, links, and a smart search experience for all our Analyzers and Transformers.'
    this.metaImage = require('~/assets/images/analyzer-dir/directory_meta_banner.png')
    this.metaImageAlt =
      'An image with the text DeepSource | Directory with logos of Python, JavaScript, Ruby, Docker, Go, Prettier and Black in the background indicating that our analyzers support them.'
  }

  async fetch(): Promise<void> {
    this.areAnalyzersLoading = true
    this.areTransformersLoading = true
    await Promise.all([
      this.fetchAnalyzers().then(() => {
        this.areAnalyzersLoading = false
      }),
      this.fetchTransformers().then(() => {
        this.areTransformersLoading = false
      })
    ])
  }

  async filterResults(): Promise<void> {
    const filter = { q: this.searchTerm }
    this.areAnalyzersLoading = true
    this.areTransformersLoading = true
    await Promise.all([
      this.fetchAnalyzers(filter).then(() => {
        this.areAnalyzersLoading = false
      }),
      this.fetchTransformers(filter).then(() => {
        this.areTransformersLoading = false
      })
    ])
  }

  searchDir(val: string): void {
    this.searchTerm = val
    this.filterResults()
  }
}
</script>
<style scoped>
.directory-hero {
  background-image: linear-gradient(rgba(22, 24, 29, 0), rgba(22, 24, 29, 0.9)),
    url('~assets/images/analyzer-dir/directory_bg.svg');
  background-repeat: no-repeat;
  background-size: cover;
}
</style>
