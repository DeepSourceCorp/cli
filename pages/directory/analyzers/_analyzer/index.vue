<template>
  <div class="mb-12">
    <directory-header :info-obj="analyzer" :is-loading="!fullyLoaded" />
    <directory-tabs :active-tab="0" :analyzer-url="analyzerUrl" />
    <div class="px-4 py-6 border-b border-ink-200">
      <div class="grid items-center max-w-4xl grid-cols-2 md:grid-cols-3 gap-y-6">
        <div class="grid gap-y-1">
          <p class="text-vanilla-400">Categories</p>
          <div v-if="isPartiallyLoaded" class="h-8">
            <z-tag spacing="px-2.5 py-1.5" text-size="xs">
              {{ analyzer.category }}
            </z-tag>
          </div>
          <div v-else class="h-6 rounded-full w-22 bg-ink-300 animate-pulse"></div>
        </div>
        <div class="grid gap-y-1">
          <p class="text-vanilla-400">Latest version</p>
          <div class="flex items-center h-8">
            <p v-if="isPartiallyLoaded" class="mb-1 text-sm">
              {{ analyzer.version }}
            </p>
            <div v-else class="h-6 w-14 bg-ink-300 animate-pulse"></div>
          </div>
        </div>
        <div class="grid gap-y-1">
          <p class="text-vanilla-400">Updated on</p>
          <div class="flex items-center h-8">
            <p v-if="isPartiallyLoaded" class="text-sm">
              {{ lastAnalyzerChangedDateText }}
            </p>
            <div v-else class="w-16 h-6 bg-ink-300 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="px-4 py-6">
      <div class="grid max-w-4xl grid-cols-1 lg:grid-cols-3 min-h-28 auto-rows-min gap-y-6">
        <div class="grid grid-cols-2 lg:grid-cols-1">
          <div>
            <p class="text-vanilla-400">Issues</p>
            <p v-if="isPartiallyLoaded" class="text-1.5xl">{{ analyzer.issuesCount }}</p>
            <div v-else class="h-8 w-17 bg-ink-300 animate-pulse"></div>
          </div>
          <div>
            <p class="text-vanilla-400 lg:mt-7">Autofix</p>
            <p v-if="isPartiallyLoaded" class="text-1.5xl">
              {{ analyzer.autofixableIssuesCount }}
            </p>
            <div v-else class="h-8 w-17 bg-ink-300 animate-pulse"></div>
          </div>
        </div>
        <div class="col-span-2">
          <p
            v-if="isPartiallyLoaded"
            class="max-w-full text-lg font-medium prose"
            v-html="analyzer.descriptionRendered"
          ></p>
          <div v-else class="w-full h-28 bg-ink-300 animate-pulse"></div>
          <div v-if="!fullyLoaded" class="w-full h-4 mt-8 bg-ink-300 animate-pulse"></div>
          <a
            v-else-if="analyzer.documentationUrl"
            :href="analyzer.documentationUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center mt-5 text-sm text-vanilla-400 hover:underline focus:underline"
          >
            <span>Read full documentation</span>
            <z-icon icon="arrow-up-right" color="vanilla-400" class="ml-0.5" />
          </a>
        </div>
      </div>
    </div>
    <div class="max-w-4xl p-4">
      <div class="flex items-center space-x-3">
        <h3 class="flex-shrink-0 text-sm font-medium tracking-wider uppercase text-vanilla-400">
          Sample configuration
        </h3>
        <hr class="flex-grow border-ink-200" />
      </div>
      <toml-box-lite
        v-if="fullyLoaded && analyzer.exampleConfig"
        :toml="analyzer.exampleConfig"
        class="mt-4"
      />
      <div v-else-if="!fullyLoaded" class="w-full h-40 mt-4 bg-ink-300 animate-pulse"></div>
      <lazy-empty-state v-else title="No sample configuration found!" />
    </div>
    <div class="max-w-4xl p-4">
      <div class="flex items-center space-x-3">
        <h3 class="flex-shrink-0 text-sm font-medium tracking-wider uppercase text-vanilla-400">
          Stats
        </h3>
        <hr class="flex-grow border-ink-200" />
      </div>
      <div class="mt-4">
        <lazy-empty-state
          v-if="
            fullyLoaded && analyzer.issueTypeDistribution && !analyzer.issueTypeDistribution.length
          "
          title="No issue statistics found!"
          image-width="w-28"
        />
        <analyzer-dir-stats
          :is-loading="!fullyLoaded"
          :issue-distribution="analyzer.issueTypeDistribution"
        />
      </div>
    </div>
    <div v-if="starIssues.length" class="max-w-4xl p-4">
      <div class="flex items-center gap-x-2">
        <h3 class="flex-shrink-0 text-sm font-medium tracking-wider uppercase text-vanilla-400">
          Issues
        </h3>
        <hr class="flex-grow border-ink-200" />
        <nuxt-link
          :to="`/directory/analyzers/${
            this.analyzer.shortcode || this.$route.params.analyzer
          }/issues`"
          class="flex items-center flex-shrink-0 px-2 py-1 text-sm leading-none text-vanilla-400 hover:bg-ink-300 rounded-xs"
        >
          View all
          <z-icon icon="arrow-up-right" color="vanilla-400" class="ml-0.5" />
        </nuxt-link>
      </div>
      <div v-if="fullyLoaded && starIssues.length" class="mt-4">
        <issue-dir-card
          v-for="issue in starIssues"
          :key="issue.shortcode"
          :issue="issue"
          :issue-type-title="issueTypeTitles[issue.issueType]"
          :analyzer-url="analyzerUrl"
          class="block mb-3"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, namespace, mixins } from 'nuxt-property-decorator'

import { ZButton, ZTag, ZIcon, ZChart } from '@deepsourcelabs/zeal'

import { DirectoryActions, DirectoryGetters } from '~/store/directory/directory'
import { Analyzer, Issue } from '~/types/types'
import { parseISODate, formatDate } from '~/utils/date'
import { resolveNodes } from '~/utils/array'
import IssueTypeT from '~/types/issueDistribution'
import MetaMixin from '~/mixins/metaMixin'

const directoryStore = namespace('directory/directory')

@Component({
  components: { ZButton, ZTag, ZIcon, ZChart },
  layout: 'sidebar-only',
  scrollToTop: true
})
export default class AnalyzerDirectoryDetails extends mixins(MetaMixin) {
  setCanonical = true

  @directoryStore.Getter(DirectoryGetters.DIRECTORY_ANALYZERS)
  analyzerList: Analyzer[]

  @directoryStore.Action(DirectoryActions.FETCH_ANALYZER_DIR_LIST)
  fetchAnalyzers: (arg?: { q: string }) => Promise<void>

  @directoryStore.Action(DirectoryActions.FETCH_ANALYZER_DETAILS)
  fetchAnalyzerDetails: (arg: {
    shortcode: string
    first?: number
  }) => Promise<Analyzer | undefined>

  private fetchedAnalyzer = {} as Analyzer | undefined
  private partiallyLoaded = false
  private fullyLoaded = false

  created() {
    this.metaImage = require('~/assets/images/analyzer-dir/directory_meta_banner.png')
    this.metaImageAlt =
      'An image with the text DeepSource | Directory with logos of Python, JavaScript, Ruby, Docker, Go, Prettier and Black in the background indicating that our analyzers support them.'
  }

  async fetch(): Promise<void> {
    const shortcode = this.$route.params.analyzer
    if (!shortcode) this.$nuxt.error({ statusCode: 404 })
    if (!Object.keys(this.analyzerList).length) {
      this.fetchAnalyzers().catch(() => {})
    }
    if (shortcode) {
      const analyzer = await this.fetchAnalyzerDetails({ shortcode, first: 5 })
      if (analyzer && Object.keys(analyzer).length) this.fetchedAnalyzer = analyzer
      else this.$nuxt.error({ statusCode: 404, message: `Analyzer "${shortcode}" does not exist!` })
    }
    this.metaTitle = `${this.analyzer.name} Analyzer by DeepSource`
    this.metaDescription = this.getMetaDescription(this.analyzer)
    this.fullyLoaded = true
  }

  get analyzer(): Analyzer {
    let partialData = {} as Analyzer | undefined
    if (this.analyzerList && this.$route.params.analyzer) {
      partialData = this.analyzerList.find(
        (analyzer) => analyzer.shortcode === this.$route.params.analyzer
      )
      if (partialData && Object.keys(partialData).length) this.partiallyLoaded = true
    }
    return Object.assign({}, partialData, this.fetchedAnalyzer)
  }

  get isPartiallyLoaded(): boolean {
    return this.partiallyLoaded || this.fullyLoaded
  }

  get lastAnalyzerChangedDateText(): string {
    if (this.analyzer.updatedOn) return formatDate(parseISODate(this.analyzer.updatedOn))
    return formatDate(parseISODate(this.analyzer.publishedOn))
  }

  get analyzerUrl(): string {
    return `/directory/analyzers/${this.analyzer.shortcode || this.$route.params.analyzer}`
  }

  get starIssues(): Issue[] {
    return resolveNodes(this.analyzer.starIssues) as Issue[]
  }

  get issueTypeTitles(): Record<string, string> {
    const returnObj = {} as Record<string, string>
    if (this.analyzer.issueTypeDistribution)
      (this.analyzer.issueTypeDistribution as IssueTypeT[]).forEach((issueType) => {
        returnObj[issueType.shortcode] = issueType.title
      })
    return returnObj
  }

  getMetaDescription(analyzer: Analyzer): string {
    if (analyzer.shortcode === 'test-coverage')
      return "DeepSource's Test Coverage Analyzer tracks the test coverage of your code. Learn all about it here."
    if (analyzer.shortcode === 'secrets')
      return "DeepSource's Secrets Analyzer runs continuous static analysis on your code and helps you find various security issues. Learn all about it here."
    return `DeepSource's ${analyzer.name} Analyzer continuously analyzes your ${
      analyzer.name
    } code and helps you find${
      analyzer.autofixableIssuesCount ? ' and fix' : ''
    } various code quality issues. Learn all about it here.`
  }
}
</script>
