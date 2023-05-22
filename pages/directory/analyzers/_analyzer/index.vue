<template>
  <div class="mb-12">
    <directory-header :info-obj="analyzer" :is-loading="!fullyLoaded" />
    <directory-tabs :active-tab="0" :analyzer-url="analyzerUrl" />
    <div class="border-b border-slate-400 px-4 py-6">
      <div class="grid max-w-4xl grid-cols-2 items-center gap-y-6 md:grid-cols-3">
        <div class="grid gap-y-1">
          <h3 class="text-vanilla-400">Categories</h3>
          <div v-if="isPartiallyLoaded" class="h-8">
            <z-tag bg-color="ink-200" spacing="px-2.5 py-1.5" text-size="xs">
              {{ analyzer.category }}
            </z-tag>
          </div>
          <div v-else class="h-6 w-22 animate-pulse rounded-full bg-ink-300"></div>
        </div>
        <div class="grid gap-y-1">
          <h3 class="text-vanilla-400">Latest version</h3>
          <div class="flex h-8 items-center">
            <p v-if="isPartiallyLoaded" class="mb-1 text-sm">
              {{ analyzer.version }}
            </p>
            <div v-else class="h-6 w-14 animate-pulse bg-ink-300"></div>
          </div>
        </div>
        <div class="grid gap-y-1">
          <h3 class="text-vanilla-400">Updated on</h3>
          <div class="flex h-8 items-center">
            <p v-if="isPartiallyLoaded" class="text-sm">
              {{ lastAnalyzerChangedDateText }}
            </p>
            <div v-else class="h-6 w-16 animate-pulse bg-ink-300"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="px-4 py-6">
      <div class="grid min-h-28 max-w-4xl auto-rows-min grid-cols-1 gap-y-6 lg:grid-cols-3">
        <div class="grid grid-cols-2 self-start lg:grid-cols-1">
          <div>
            <h3 class="text-vanilla-400">Total issues</h3>
            <p v-if="isPartiallyLoaded" class="text-1.5xl">{{ analyzer.issuesCount }}</p>
            <div v-else class="h-8 w-17 animate-pulse bg-ink-300"></div>
          </div>
          <div v-if="isPartiallyLoaded && analyzer.autofixableIssuesCount">
            <h3 class="text-vanilla-400 lg:mt-7">Autofix</h3>
            <p class="text-1.5xl">
              {{ analyzer.autofixableIssuesCount }}
            </p>
          </div>
        </div>
        <div class="col-span-2">
          <h3 class="mb-4 text-vanilla-400">Sample configuration</h3>
          <toml-box-lite
            v-if="fullyLoaded && analyzer.exampleConfig"
            :toml="analyzer.exampleConfig"
          />
          <div v-else-if="!fullyLoaded" class="h-60 w-full animate-pulse bg-ink-300"></div>
          <lazy-empty-state
            v-else
            show-border
            title="No sample configuration found!"
            padding="px-3.5 py-12"
          />
        </div>
      </div>
    </div>

    <div class="max-w-4xl p-4">
      <div class="flex items-center space-x-3">
        <h3 class="flex-shrink-0 text-sm font-medium uppercase tracking-wider text-vanilla-400">
          Stats
        </h3>
        <hr class="flex-grow border-slate-400" />
      </div>
      <div class="mt-4">
        <lazy-empty-state
          v-if="
            fullyLoaded && analyzer.issueTypeDistribution && !analyzer.issueTypeDistribution.length
          "
          title="No issue statistics found!"
        />
        <analyzer-dir-stats
          :is-loading="!fullyLoaded"
          :issue-distribution="analyzer.issueTypeDistribution"
        />
      </div>
    </div>
    <div v-if="starIssues.length" class="max-w-4xl p-4">
      <div class="flex items-center gap-x-2">
        <h3 class="flex-shrink-0 text-sm font-medium uppercase tracking-wider text-vanilla-400">
          Issues
        </h3>
        <hr class="flex-grow border-slate-400" />
        <nuxt-link
          :to="`/directory/analyzers/${analyzer.shortcode || $route.params.analyzer}/issues`"
          class="rounded-xs flex flex-shrink-0 items-center px-2 py-1 text-sm leading-none text-vanilla-400 hover:bg-ink-300"
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
          class="mb-3 block"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, namespace, mixins } from 'nuxt-property-decorator'

import { ZButton, ZTag, ZIcon, ZChart } from '@deepsource/zeal'

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
