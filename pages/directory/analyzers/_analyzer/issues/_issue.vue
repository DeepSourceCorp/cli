<template>
  <div>
    <div class="px-4 py-3 border-b border-ink-200">
      <z-breadcrumb separator="/" class="text-sm text-vanilla-100">
        <z-breadcrumb-item>
          <nuxt-link :to="`${analyzerUrl}/issues`" class="text-vanilla-400">All issues</nuxt-link>
        </z-breadcrumb-item>
        <z-breadcrumb-item isCurrent>{{ issue.shortcode }}</z-breadcrumb-item>
      </z-breadcrumb>
    </div>
    <div class="p-4">
      <div class="border-b border-ink-200 pb-4">
        <h1 v-if="isLoaded" class="font-semibold text-2xl">
          <span>{{ issue.title }}</span
          ><span class="text-vanilla-400 ml-2 font-normal text-lg">{{ issue.shortcode }}</span>
        </h1>
        <div v-else class="h-9 w-full bg-ink-300 animate-pulse"></div>
        <div class="text-sm text-vanilla-400 flex space-x-5 mt-3">
          <div v-if="isLoaded" class="flex space-x-1.5 items-center">
            <z-icon :icon="issue.issueType" size="x-small" color="vanilla-400" />
            <!-- TODO -->
            <span>{{ issueTypeTitles[issue.issueType] }}</span>
          </div>
          <div v-else class="h-6 w-16 bg-ink-300 animate-pulse"></div>
          <div v-if="isLoaded && issue.autofixAvailable" class="flex space-x-1.5 items-center">
            <z-icon icon="autofix" size="x-small" color="vanilla-400" />
            <span>Has Autofix</span>
          </div>
          <div v-else-if="!isLoaded" class="h-6 w-16 bg-ink-300 animate-pulse"></div>
        </div>
      </div>
      <div
        v-if="isLoaded && issue.descriptionRendered"
        v-html="issue.descriptionRendered"
        class="prose py-2"
      ></div>
      <lazy-empty-state
        v-else-if="isLoaded"
        title="No issue description found!"
        image-width="w-28"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, namespace, Prop } from 'nuxt-property-decorator'

import { ZBreadcrumb, ZBreadcrumbItem, ZIcon } from '@deepsourcelabs/zeal'

import { IssueDetailActions } from '~/store/issue/detail'
import { Analyzer, Issue } from '~/types/types'

const issueDetailStore = namespace('issue/detail')

@Component({
  components: { ZBreadcrumb, ZBreadcrumbItem, ZIcon },
  layout: 'sidebar-only',
  scrollToTop: true
})
export default class AnalyzerDirectoryDetails extends Vue {
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
}
</script>
