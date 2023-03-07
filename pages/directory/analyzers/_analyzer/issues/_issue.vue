<template>
  <div>
    <div class="px-4 py-3 border-b border-slate-400">
      <z-breadcrumb separator="/" class="text-sm text-vanilla-100">
        <z-breadcrumb-item>
          <nuxt-link :to="`${analyzerUrl}/issues`" class="text-vanilla-400">All issues</nuxt-link>
        </z-breadcrumb-item>
        <z-breadcrumb-item is-current>{{ issue.shortcode }}</z-breadcrumb-item>
      </z-breadcrumb>
    </div>
    <div class="p-4 border-b border-slate-400">
      <div class="max-w-prose">
        <h1 v-if="isLoaded" class="text-2xl font-semibold">
          <span v-html="safeRenderBackticks(issue.title)" />
          <span class="ml-3 text-lg font-normal text-vanilla-400 whitespace-nowrap">{{
            issue.shortcode
          }}</span>
        </h1>
        <div v-else class="w-full h-9 bg-ink-300 animate-pulse"></div>
      </div>
      <div class="flex mt-3 space-x-5 text-sm text-vanilla-400">
        <div v-if="isLoaded" class="flex space-x-1.5 items-center self-start">
          <z-icon :icon="issue.issueType" size="x-small" color="vanilla-400" />
          <span>{{ issueTypeTitles[issue.issueType] }}</span>
        </div>
        <div v-else class="w-16 h-6 bg-ink-300 animate-pulse"></div>

        <div v-if="isLoaded && issue.autofixAvailable" class="flex space-x-1.5 items-center">
          <z-icon icon="autofix" size="x-small" color="vanilla-400" />
          <span>Autofix</span>
        </div>
        <div v-else-if="!isLoaded" class="w-16 h-6 bg-ink-300 animate-pulse"></div>

        <div v-if="isLoaded && tags.length" class="flex items-center gap-x-1 flex-wrap">
          <span
            v-for="tag in tags"
            :key="tag"
            class="flex items-center gap-x-1 uppercase border border-slate-400 rounded-full px-1.5 py-1"
          >
            <span
              class="w-2 h-2 rounded-full"
              :style="{
                background: generateColorFromTag(tag)
              }"
            ></span>
            <span class="font-medium tracking-wide text-xxs text-vanilla-400">
              {{ deslugifyTag(tag) }}
            </span>
          </span>
        </div>
      </div>
    </div>
    <div class="p-4">
      <div
        v-if="isLoaded && issue.descriptionRendered"
        v-html="issue.descriptionRendered"
        class="py-2 prose-issue-description max-w-prose"
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
