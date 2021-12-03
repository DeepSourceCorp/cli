<template>
  <div>
    <sub-nav v-if="transformersAllowed" active="runs"></sub-nav>
    <!-- Back to Run List Page -->
    <div class="flex flex-col w-full px-4 py-6 space-y-2">
      <link-to-prev :link="routeToPrevious" title="All analysis runs"></link-to-prev>
      <!-- Details Header -->
      <div class="w-full sm:w-4/5 py-2.5 flex flex-col space-y-2 justify-evenly">
        <gist-card-title
          :icon="statusIcon"
          :icon-color="statusIconColor"
          :title="branchName.trim()"
          :vcs-commit-url="vcsCommitUrl"
          :vcs-pr-url="vcsPrUrl"
          :vcs-pr-number="pullRequestNumberDisplay"
          :id="commitOid.slice(0, 7)"
          :spin-icon="isPending"
        ></gist-card-title>
        <gist-card-description
          :action-text="isPending ? 'Started' : 'Analyzed'"
          :created-at="createdAt"
          :finished-in="finishedIn"
          :finished-in-label="statusText"
          :compare-hash="gitCompareDisplay"
          :show-finished-in-time="!isPending"
        >
        </gist-card-description>
      </div>
    </div>
    <div class="w-full border-b border-ink-200">
      <div class="flex self-end px-4 space-x-5 overflow-auto flex-nowrap">
        <nuxt-link v-for="check in checks" :key="check.id" :to="getRoute(check.analyzer.shortcode)">
          <z-tab
            :icon="check.analyzer.shortcode"
            :isActive="currentAnalyzer == check.analyzer.shortcode"
            border-active-color="vanilla-400"
            class="flex items-center"
          >
            {{ check.analyzer.name }}
            <z-tag text-size="xs" spacing="px-2 py-1" bg-color="ink-100" class="leading-none">
              {{ check.issuesRaisedCount }}
            </z-tag>
          </z-tab>
        </nuxt-link>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { ZTab, ZTag } from '@deepsourcelabs/zeal'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { SubNav } from '@/components/History'
import LinkToPrev from '@/components/LinkToPrev.vue'
import { GistCardDescription, GistCardTitle } from '@/components/Repository'
import { Check, RunStatus } from '~/types/types'
import { AppFeatures } from '~/types/permTypes'

@Component({
  components: {
    ZTab,
    ZTag,
    SubNav,
    LinkToPrev,
    GistCardTitle,
    GistCardDescription
  },
  layout: 'repository'
})
export default class RunHeader extends Vue {
  @Prop({ default: '' })
  branchName: string

  @Prop({ default: '' })
  commitOid: string

  @Prop({ default: '' })
  createdAt: string

  @Prop({ default: 0 })
  finishedIn: number

  @Prop({ default: 'PASS' })
  status: RunStatus

  @Prop({ default: '' })
  gitCompareDisplay: string

  @Prop({ default: () => [] })
  checks: Array<Check>

  @Prop({ default: '' })
  routeToPrevious: string

  @Prop({ default: '' })
  vcsCommitUrl: string

  @Prop({ default: '' })
  vcsPrUrl: string

  @Prop({ default: '' })
  pullRequestNumberDisplay: string

  @Prop({ default: '' })
  currentAnalyzer: string

  get statusIcon(): string {
    const types: Record<string, string> = {
      [RunStatus.Pass]: 'check',
      [RunStatus.Fail]: 'x',
      [RunStatus.Pend]: 'spin-loader',
      [RunStatus.Timo]: 'clock',
      [RunStatus.Cncl]: 'alert-circle',
      [RunStatus.Read]: 'check-circle'
    }
    return types[this.status || 'PASS']
  }

  get statusIconColor(): string {
    const types: Record<string, string> = {
      [RunStatus.Pass]: 'juniper',
      [RunStatus.Fail]: 'cherry',
      [RunStatus.Pend]: 'vanilla-100',
      [RunStatus.Timo]: 'honey',
      [RunStatus.Cncl]: 'honey',
      [RunStatus.Read]: 'juniper-100'
    }
    return types[this.status || 'PASS']
  }

  get statusText(): string {
    const types: Record<string, string> = {
      [RunStatus.Pass]: 'Passed in',
      [RunStatus.Fail]: 'Failed after',
      [RunStatus.Pend]: 'Analysis in progress',
      [RunStatus.Timo]: 'Timed out after',
      [RunStatus.Cncl]: 'Cancelled after',
      [RunStatus.Read]: 'Completed in'
    }
    return types[this.status || 'PASS']
  }

  get isPending(): boolean {
    return this.status === RunStatus.Pend
  }

  get transformsAllowed(): boolean {
    return this.$gateKeeper.provider(AppFeatures.TRANSFORMS)
  }

  getRoute(lang: string): string {
    const path = ['run', this.$route.params.runId, lang]
    return this.$generateRoute(path)
  }
}
</script>
