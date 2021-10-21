<template>
  <div class="mb-12">
    <directory-header :info-obj="analyzer" :is-loading="!fullyLoaded" />
    <directory-tabs :active-tab="0" :analyzer-url="analyzerUrl" />
    <div class="border-b border-ink-200 px-4 py-6">
      <div class="max-w-4xl grid grid-cols-2 md:grid-cols-3 gap-y-6 items-center">
        <div class="grid gap-y-1">
          <p class="text-vanilla-400">Categories</p>
          <div v-if="isPartiallyLoaded" class="h-8">
            <z-tag spacing="px-2.5 py-1.5" text-size="xs">
              {{ analyzer.category }}
            </z-tag>
          </div>
          <div v-else class="h-6 w-22 bg-ink-300 animate-pulse rounded-full"></div>
        </div>
        <div class="grid gap-y-1">
          <p class="text-vanilla-400">Latest version</p>
          <div class="h-8 flex items-center">
            <p v-if="isPartiallyLoaded" class="text-sm mb-1">
              {{ analyzer.version }}
            </p>
            <div v-else class="h-6 w-14 bg-ink-300 animate-pulse"></div>
          </div>
        </div>
        <div class="grid gap-y-1">
          <p class="text-vanilla-400">Updated on</p>
          <div class="h-8 flex items-center">
            <p v-if="isPartiallyLoaded" class="text-sm">
              {{ lastAnalyzerChangedDateText }}
            </p>
            <div v-else class="h-6 w-16 bg-ink-300 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="px-4 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 max-w-4xl min-h-28 auto-rows-min gap-y-6">
        <div class="grid grid-cols-2 lg:grid-cols-1">
          <div>
            <p class="text-vanilla-400">Total issues</p>
            <p v-if="isPartiallyLoaded" class="text-1.5xl">{{ analyzer.issuesCount }}</p>
            <div v-else class="h-8 w-17 bg-ink-300 animate-pulse"></div>
          </div>
          <div>
            <p class="text-vanilla-400 lg:mt-7">Autofix issues</p>
            <p v-if="isPartiallyLoaded" class="text-1.5xl">
              {{ analyzer.autofixableIssuesCount }}
            </p>
            <div v-else class="h-8 w-17 bg-ink-300 animate-pulse"></div>
          </div>
        </div>
        <div class="col-span-2">
          <p
            v-if="isPartiallyLoaded"
            class="prose font-medium text-lg max-w-full"
            v-html="analyzer.descriptionRendered"
          ></p>
          <div v-else class="h-28 w-full bg-ink-300 animate-pulse"></div>
          <div v-if="!fullyLoaded" class="h-4 w-full bg-ink-300 animate-pulse mt-8"></div>
          <a
            v-else-if="analyzer.documentationUrl"
            :href="analyzer.documentationUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-vanilla-400 text-sm hover:underline focus:underline flex items-center mt-5"
          >
            <span>Read the documentation and full reference</span>
            <z-icon icon="arrow-up-right" color="vanilla-400" class="ml-0.5" />
          </a>
        </div>
      </div>
    </div>
    <div class="p-4 max-w-4xl">
      <div class="flex items-center space-x-3">
        <h3 class="uppercase text-sm text-vanilla-400 tracking-wider flex-shrink-0 font-medium">
          Sample configuration
        </h3>
        <hr class="border-ink-200 flex-grow" />
      </div>
      <toml-box-lite
        v-if="fullyLoaded && analyzer.exampleConfig"
        :toml="analyzer.exampleConfig"
        class="mt-4"
      />
      <div v-else-if="!fullyLoaded" class="h-40 w-full bg-ink-300 animate-pulse mt-4"></div>
      <lazy-empty-state v-else title="No sample configuration found!" />
    </div>
    <div class="p-4 max-w-4xl">
      <div class="flex items-center space-x-3">
        <h3 class="uppercase text-sm text-vanilla-400 tracking-wider flex-shrink-0 font-medium">
          Stats
        </h3>
        <hr class="border-ink-200 flex-grow" />
      </div>
      <div class="mt-4">
        <lazy-empty-state
          v-if="fullyLoaded && !analyzer.issueTypeDistribution.length"
          title="No issue statistics found!"
          image-width="w-28"
        />
        <analyzer-dir-stats
          :is-loading="!fullyLoaded"
          :issue-distribution="analyzer.issueTypeDistribution"
        />
      </div>
    </div>
    <div class="p-4 max-w-4xl">
      <div class="flex items-center gap-x-2">
        <h3 class="uppercase text-sm text-vanilla-400 tracking-wider flex-shrink-0 font-medium">
          Issues
        </h3>
        <hr class="border-ink-200 flex-grow" />
        <nuxt-link
          :to="`/directory/analyzers/${
            this.analyzer.shortcode || this.$route.params.analyzer
          }/issues`"
          class="
            text-sm text-vanilla-400
            flex
            items-center
            flex-shrink-0
            leading-none
            hover:bg-ink-300
            px-2
            py-1
            rounded-xs
          "
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
      <div v-else-if="!fullyLoaded" class="mt-4">
        <issue-dir-card-skeleton v-for="id in 5" :key="id" class="mb-3" />
      </div>
      <lazy-empty-state v-else title="No featured issues found!" image-width="w-28" />
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
import { Analyzer, Issue } from '~/types/types'
import { parseISODate, formatDate } from '~/utils/date'
import { resolveNodes } from '~/utils/array'
import IssueTypeT from '~/types/issueDistribution'

const directoryStore = namespace('directory/directory')

@Component({
  components: { ZButton, ZTag, ZIcon, ZChart },
  layout: 'sidebar-only',
  scrollToTop: true
})
export default class AnalyzerDirectoryDetails extends Vue {
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
}
</script>
