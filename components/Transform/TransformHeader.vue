<template>
  <div>
    <!-- Back to Run List Page -->
    <div class="flex w-full flex-col space-y-2 px-4 py-6">
      <link-to-prev :link="routeToPrevious" title="All transform runs" />
      <!-- Details Header -->
      <div class="flex w-3/4 flex-col justify-evenly space-y-2 py-2.5 sm:w-4/5">
        <gist-card-title
          :id="commitOidShort"
          :icon="statusIcon"
          :icon-color="statusIconColor"
          :title="branchName"
          link="/history/runs/details"
          :spin-icon="isPending"
        />
        <gist-card-description
          :action-text="isPending ? 'Started' : 'Transformed'"
          :created-at="createdAt"
          :finished-in="finishedIn"
          :compare-hash="gitCompareDisplay"
          :finished-in-label="isPending ? 'Transform in progress' : undefined"
          :show-finished-in-time="!isPending"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import LinkToPrev from '@/components/LinkToPrev.vue'
import { SubNav } from '@/components/History'
import { GistCardTitle, GistCardDescription } from '@/components/Repository'
import { RunStatus, TransformerRunStatus } from '~/types/types'

export interface Changeset {
  id: number
  action: string
  before_html: string
  after_html: string
}

@Component({
  components: {
    SubNav,
    LinkToPrev,
    GistCardTitle,
    GistCardDescription
  },
  layout: 'repository'
})
export default class TransformHeader extends Vue {
  @Prop()
  id: string

  @Prop()
  branchName: string

  @Prop()
  commitOidShort: string

  @Prop()
  createdAt: string

  @Prop()
  finishedIn: number

  @Prop({ default: 'PASS' })
  status: string

  @Prop()
  vcsPrUrl: string

  @Prop()
  vcsCommitUrl: string

  @Prop()
  gitCompareDisplay: string

  @Prop()
  committedtobranchstatus: string

  @Prop()
  changedfilescount: number

  @Prop()
  erros: Array<Record<string, string>>

  @Prop()
  tools: Array<Record<string, string>>

  @Prop()
  changeset: Record<string, Array<Changeset>>

  @Prop()
  routeToPrevious: string

  get statusIcon(): string {
    const types: Record<string, string> = {
      [TransformerRunStatus.Pass]: 'check',
      [TransformerRunStatus.Fail]: 'x',
      [TransformerRunStatus.Stal]: 'stale',
      [TransformerRunStatus.Timo]: 'clock',
      [TransformerRunStatus.Pend]: 'spin-loader',
      [TransformerRunStatus.Empt]: 'minus-circle'
    }
    return types[this.status || TransformerRunStatus.Pass]
  }

  get statusIconColor(): string {
    const types: Record<string, string> = {
      [TransformerRunStatus.Pass]: 'juniper',
      [TransformerRunStatus.Fail]: 'cherry',
      [TransformerRunStatus.Stal]: 'vanilla-300',
      [TransformerRunStatus.Timo]: 'honey',
      [TransformerRunStatus.Pend]: 'vanilla-100',
      [TransformerRunStatus.Empt]: 'honey'
    }
    return types[this.status || TransformerRunStatus.Pass]
  }

  get isPending(): boolean {
    return this.status === RunStatus.Pend
  }

  getRoute(lang: string): string {
    const path = ['run', this.$route.params.runId, lang]
    return this.$generateRoute(path)
  }
}
</script>
