<template>
  <div>
    <sub-nav active="runs"></sub-nav>
    <!-- Back to Run List Page -->
    <div class="flex flex-col w-full px-4 py-6 space-y-2">
      <link-to-prev :link="routeToPrevious" title="All analysis runs"></link-to-prev>
      <!-- Details Header -->
      <div class="w-3/4 sm:w-4/5 py-2.5 flex flex-col space-y-2 justify-evenly">
        <gist-card-title
          :icon="statusIcon"
          :iconColor="statusIconColor"
          :title="branchName.trim()"
          :vcsCommitUrl="vcsCommitUrl"
          :vcsPrUrl="vcsPrUrl"
          :vcsPrNumber="pullRequestNumberDisplay"
          :id="commitOid.slice(0, 7)"
        ></gist-card-title>
        <gist-card-description
          actionText="Analyzed"
          :createdAt="createdAt"
          :finishedIn="finishedIn"
          :finishedInLabel="statusText"
          :compareHash="gitCompareDisplay"
        >
        </gist-card-description>
      </div>
    </div>
    <div class="w-full border-b border-ink-200">
      <div class="flex self-end space-x-5 overflow-auto flex-nowrap px-4">
        <nuxt-link v-for="check in checks" :key="check.id" :to="getRoute(check.analyzer.shortcode)">
          <z-tab
            :icon="check.analyzer.shortcode"
            :isActive="currentAnalyzer == check.analyzer.shortcode"
            border-active-color="vanilla-400"
          >
            {{ check.analyzer.name }}
          </z-tab>
        </nuxt-link>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import LinkToPrev from '@/components/LinkToPrev.vue'
import { ZTab } from '@deepsourcelabs/zeal'
import { SubNav } from '@/components/History'
import { GistCardTitle, GistCardDescription } from '@/components/Repository'
import { Check, RunStatus } from '~/types/types'

@Component({
  components: {
    ZTab,
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
      [RunStatus.Pend]: 'refresh-cw',
      [RunStatus.Timo]: 'clock',
      [RunStatus.Cncl]: 'alert-circle'
    }
    return types[this.status || 'PASS']
  }

  get statusIconColor(): string {
    const types: Record<string, string> = {
      [RunStatus.Pass]: 'juniper',
      [RunStatus.Fail]: 'cherry',
      [RunStatus.Pend]: 'vanilla-100',
      [RunStatus.Timo]: 'honey',
      [RunStatus.Cncl]: 'honey'
    }
    return types[this.status || 'PASS']
  }

  get statusText(): string {
    const types: Record<string, string> = {
      [RunStatus.Pass]: 'Passed in',
      [RunStatus.Fail]: 'Failed after',
      [RunStatus.Pend]: 'Analysis in progress',
      [RunStatus.Timo]: 'Timed out after',
      [RunStatus.Cncl]: 'Cancelled after'
    }
    return types[this.status || 'PASS']
  }

  getRoute(lang: string): string {
    const path = ['run', this.$route.params.runId, lang]
    return this.$generateRoute(path)
  }
}
</script>
