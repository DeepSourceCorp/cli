<template>
  <div>
    <div class="border-b border-slate-400 px-4 py-3">
      <z-breadcrumb separator="/" class="text-sm text-vanilla-100">
        <z-breadcrumb-item>
          <nuxt-link :to="`${analyzerUrl}/issues`" class="text-vanilla-400">All issues</nuxt-link>
        </z-breadcrumb-item>
        <z-breadcrumb-item is-current>{{ issue.shortcode }}</z-breadcrumb-item>
      </z-breadcrumb>
    </div>
    <div class="border-b border-slate-400 p-4">
      <div class="max-w-prose">
        <h1 v-if="isLoaded" class="text-2xl font-semibold">
          <span v-html="safeRenderBackticks(issue.title)" />
          <span class="ml-3 whitespace-nowrap text-lg font-normal text-vanilla-400">{{
            issue.shortcode
          }}</span>
        </h1>
        <div v-else class="h-9 w-full animate-pulse bg-ink-300"></div>
      </div>
      <div class="mt-3 flex flex-wrap items-center gap-x-2 gap-y-3 text-sm text-vanilla-400">
        <span v-if="isLoaded" class="mr-3 flex items-center gap-x-1.5">
          <z-icon :icon="issue.issueType" size="x-small" color="vanilla-400" />
          <span>{{ issueTypeTitles[issue.issueType] }}</span>
        </span>
        <span v-else class="mr-3 h-6 w-16 animate-pulse bg-ink-300"></span>

        <span v-if="isLoaded && issue.autofixAvailable" class="mr-3 flex items-center gap-x-1.5">
          <z-icon icon="autofix" size="x-small" color="vanilla-400" />
          <span>Autofix</span>
        </span>
        <span v-else-if="!isLoaded" class="mr-3 h-6 w-16 animate-pulse bg-ink-300"></span>

        <template v-if="isLoaded && tags.length">
          <span
            v-for="tag in tags"
            :key="tag"
            class="flex items-center gap-x-1 rounded-full border border-slate-400 px-1.5 py-1 uppercase"
          >
            <span
              class="h-2 w-2 rounded-full"
              :style="{
                background: generateColorFromTag(tag)
              }"
            ></span>
            <span class="text-xxs font-medium tracking-wide text-vanilla-400">
              {{ deslugifyTag(tag) }}
            </span>
          </span>
        </template>
      </div>
    </div>
    <div class="p-4">
      <div
        v-if="isLoaded && issue.descriptionRendered"
        v-html="issue.descriptionRendered"
        class="prose-issue-description max-w-prose py-2"
      ></div>
      <lazy-empty-state v-else-if="isLoaded" title="No issue description found!" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, mixins, Watch } from 'nuxt-property-decorator'
import { ZBreadcrumb, ZBreadcrumbItem, ZIcon } from '@deepsource/zeal'

import { IssueDetailActions } from '~/store/issue/detail'
import { Analyzer, Issue } from '~/types/types'
import MetaMixin from '~/mixins/metaMixin'

import { safeRenderBackticks } from '~/utils/string'
import { deslugifyTag, generateColorFromTag } from '~/utils/ui'

const issueDetailStore = namespace('issue/detail')

/**
 * Issue details page under analyzer directory
 */
@Component({
  components: { ZBreadcrumb, ZBreadcrumbItem, ZIcon },
  layout: 'sidebar-only',
  methods: {
    deslugifyTag,
    generateColorFromTag,
    safeRenderBackticks
  },
  scrollToTop: true
})
export default class AnalyzerDirectoryIssueDetails extends mixins(MetaMixin) {
  setCanonical = true

  @issueDetailStore.Action(IssueDetailActions.FETCH_ISSUE_DETAILS)
  fetchIssueDetails: (arg: { shortcode: string }) => Promise<Issue | undefined>

  @Prop()
  analyzer!: Analyzer

  @Prop()
  issueTypeTitles!: Record<string, string>

  private issue = {} as Issue | undefined
  private isLoaded = false

  async fetch(): Promise<void> {
    const issueShortcode = this.$route.params.issue
    if (!issueShortcode) this.$nuxt.error({ statusCode: 404 })
    if (issueShortcode) {
      const issue = await this.fetchIssueDetails({ shortcode: issueShortcode })
      if (issue && Object.keys(issue).length) this.issue = issue
      else
        this.$nuxt.error({
          statusCode: 404,
          message: `Issue "${issueShortcode}" does not exist!`
        })
    }

    this.isLoaded = true
  }

  get analyzerUrl(): string {
    return `/directory/analyzers/${this.analyzer.shortcode || this.$route.params.analyzer}`
  }

  get isMetaReady(): boolean {
    return Boolean(this.issue?.shortcode && this.analyzer.name)
  }

  get tags() {
    return this.issue?.tags ?? []
  }

  @Watch('isMetaReady')
  setMetaInfo(newIsMetaReady: boolean): void {
    if (newIsMetaReady) {
      this.metaTitle = `${this.issue?.title} - DeepSource`
      this.metaDescription = `Issue ${this.issue?.shortcode}: ${this.issue?.title}`
    }
  }
}
</script>
