<template>
  <div class="mb-12">
    <div ref="analyzer-dir-hero" class="min-h-72 flex">
      <div class="px-4 mt-13">
        <h1 class="text-3xl font-bold leading-none text-center md:text-left">Directory</h1>
        <p class="max-w-2xl mt-3 text-vanilla-400 text-center md:text-left">
          The Analyzer directory has documentation, links, and a smart search experience
        </p>
        <z-input
          size="large"
          placeholder="Look up a programming language or linter..."
          background-color="ink-300"
          :show-border="false"
          :name="searchTerm"
          class="mt-6 shadow-lg rounded-md"
          @debounceInput="searchDir"
        >
          <z-icon icon="search" size="base" color="vanilla-400" class="ml-3 mr-1" slot="left" />
        </z-input>
      </div>
    </div>
    <section class="px-4 -mt-3">
      <!-- <h2 class="text-vanilla-400 font-semibold text-2xl">Analyzers</h2> -->
      <div class="flex items-center space-x-3">
        <h2 class="uppercase text-vanilla-400 flex-shrink-0 font-medium tracking-wider">
          Analyzers
        </h2>
        <hr class="border-ink-200 flex-grow" />
      </div>
      <div
        v-if="areAnalyzersLoading"
        class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-4"
      >
        <directory-card-skeleton v-for="loader in 8" :key="loader" />
      </div>
      <div
        v-else-if="analyzerList.length"
        class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-4"
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
    <section class="mt-10 px-4 pb-4">
      <div class="flex items-center space-x-3">
        <h2 class="uppercase text-vanilla-400 tracking-wider flex-shrink-0 font-medium">
          Transformers
        </h2>
        <hr class="border-ink-200 flex-grow" />
      </div>
      <div
        v-if="areTransformersLoading"
        class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-4"
      >
        <directory-card-skeleton v-for="loader in 8" :key="loader" type="transformer" />
      </div>
      <div
        v-else-if="transformerList.length"
        class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-4"
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
import { Component, Vue, namespace } from 'nuxt-property-decorator'

import { ZIcon, ZInput } from '@deepsourcelabs/zeal'

import { DirectoryActions, DirectoryGetters } from '~/store/directory/directory'
import { Analyzer, TransformerTool } from '~/types/types'

const directoryStore = namespace('directory/directory')

@Component({
  components: { ZIcon, ZInput },
  layout: 'sidebar-only',
  scrollToTop: true
})
export default class AnalyzersDirectory extends Vue {
  @directoryStore.Getter(DirectoryGetters.DIRECTORY_ANALYZERS)
  analyzerList: Analyzer[]

  @directoryStore.Action(DirectoryActions.FETCH_ANALYZER_DIR_LIST)
  fetchAnalyzers: (arg?: { q: string }) => Promise<void>

  @directoryStore.Getter(DirectoryGetters.DIRECTORY_TRANSFORMERS)
  transformerList: TransformerTool[]

  @directoryStore.Action(DirectoryActions.FETCH_TRANSFORMERS_DIR_LIST)
  fetchTransformers: (arg?: { q: string }) => Promise<void>

  private searchTerm = ''
  private areAnalyzersLoading = false
  private areTransformersLoading = false

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

  mounted(): void {
    //? The following two lines ensure that background image is lazily loaded for the header
    const heroDiv = this.$refs['analyzer-dir-hero'] as HTMLElement
    if (heroDiv) heroDiv.classList.add('directory-hero')
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
