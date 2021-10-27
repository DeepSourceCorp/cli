<template>
  <base-card :showInfo="showInfo" :to="$generateRoute(['autofix', runId])">
    <template slot="title">
      <z-icon
        v-tooltip="tooltipText"
        :icon="runIcon"
        size="small"
        class="flex-shrink-0"
        :color="statusColor"
      ></z-icon>
      <h3
        class="text-vanilla-100 cursor-pointer whitespace-nowrap overflow-ellipsis overflow-hidden"
      >
        {{ pullRequestTitle.trim() || (issue && issue.title) }}
      </h3>

      <span class="text-sm text-vanilla-400 font-normal inline md:flex flex-shrink-0" v-if="issue">
        {{ issue.shortcode }}
      </span>
    </template>
    <template slot="description">
      <div class="items-center space-y-1 md:space-y-0 md:flex md:space-x-4 mt-2 ml-6">
        <!-- Issue type -->
        <div class="space-x-5 flex">
          <issue-type v-if="issue" :issueType="issue.issueType"></issue-type>
          <!-- Analyzer -->
          <div class="flex items-center space-x-1.5 text-sm">
            <analyzer-logo v-bind="analyzer" size="small" />
            <span class="text-sm text-vanilla-400">{{ analyzer.name }}</span>
          </div>
        </div>
        <!-- Created -->
        <div class="flex items-center space-x-1.5 text-sm">
          <z-icon icon="clock" size="x-small" color="vanilla-400"></z-icon>
          <span class="text-sm text-vanilla-400">Created {{ formatDuration }}</span>
        </div>
        <!-- Avatar -->
        <div class="hidden sm:flex items-center space-x-1.5 text-sm">
          <img
            :src="createdBy.avatar"
            alt="Creator Avatar"
            class="w-4 h-4 overflow-hidden inline-block rounded-full"
          />
          <span class="text-sm text-vanilla-400">Created by {{ createdBy.fullName }}</span>
        </div>
      </div>
    </template>
    <template slot="info">
      <div class="flex justify-around items-center space-x-2 h-full">
        <div class="flex flex-col items-center">
          <div
            class="text-2xl font-medium"
            :class="resolvedIssuesCount > 0 ? 'text-juniper' : 'text-vanilla-400'"
          >
            {{ resolvedIssuesCount || 0 }}
          </div>
          <div v-if="isPending" class="text-xs text-vanilla-400">occurrences fixable</div>
          <div v-else class="text-xs text-vanilla-400">occurrences fixed</div>
        </div>
      </div>
    </template>
  </base-card>
</template>
<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import { BaseCard } from '@/components/History'
import { ZIcon, ZButton } from '@deepsourcelabs/zeal'
import { fromNow } from '@/utils/date'
import { AutofixRun, AutofixRunStatus, Maybe, Scalars } from '~/types/types'
import RoleAccessMixin from '~/mixins/roleAccessMixin'
import { RepoPerms } from '~/types/permTypes'

@Component({
  components: {
    BaseCard,
    ZIcon,
    ZButton
  }
})
export default class AutofixListItem extends mixins(RoleAccessMixin) {
  @Prop()
  autofixRun!: AutofixRun

  @Prop()
  pullRequestNumber!: number

  @Prop()
  isGeneratedFromPr!: boolean

  @Prop()
  issuesAffected!: Maybe<Scalars['Int']>

  @Prop()
  pullRequestStatus!: string

  @Prop()
  committedToBranchStatus!: string

  @Prop()
  runId!: string

  @Prop()
  issue!: Record<string, string>

  @Prop()
  analyzer!: Record<string, string>

  @Prop()
  createdBy!: Record<string, string>

  @Prop()
  createdAt!: string

  @Prop()
  resolvedIssuesCount!: number

  @Prop()
  status!: string

  @Prop()
  pullRequestTitle!: string

  @Prop()
  filesAffected!: number

  @Prop({ default: true })
  removeDefaultStyle: boolean

  @Prop()
  repositoryId!: string

  @Prop({ default: true })
  showInfo!: boolean

  public selectedFiles: Array<string> = []

  public selectedHunkIds: Array<string> = []

  get formatDuration(): string {
    return fromNow(this.createdAt)
  }

  get statusColor(): string {
    const colors: Record<string, string> = {
      PASS: 'juniper',
      PEND: 'vanilla-100',
      CNCL: 'vanilla-400',
      FAIL: 'cherry',
      STAL: 'slate',
      TIMO: 'honey'
    }
    return colors[this.status]
  }

  get tooltipText(): string {
    const types: Record<string, string> = {
      PASS: 'Autofix completed',
      PEND: 'This Autofix is pending',
      CNCL: 'Autofix cancelled',
      FAIL: 'Autofix failed',
      STAL: 'Stale Autofix',
      TIMO: 'Autofix timed out'
    }
    return types[this.status || 'PASS']
  }

  get runIcon(): string {
    const icons: Record<string, string> = {
      PASS: 'check',
      PEND: 'refresh-ccw',
      CNCL: 'slash',
      FAIL: 'x',
      STAL: 'stale',
      TIMO: 'clock'
    }
    return icons[this.status]
  }

  get isPending(): boolean {
    return this.status === AutofixRunStatus.Pend
  }

  public populateSelectedIds(): void {
    this.selectedFiles = []
    this.selectedHunkIds = []
    const changeset = { ...this.autofixRun.changeset }
    if (changeset) {
      for (const key in changeset) {
        if (!this.selectedFiles.includes(key)) {
          this.selectedFiles.push(key)
          for (const index in changeset[key].patches) {
            if (Object.prototype.hasOwnProperty.call(changeset[key].patches, index)) {
              this.selectedHunkIds.push(changeset[key].patches[index].id)
            }
          }
        }
      }
    }
  }

  public affectedFiles(): Array<string> {
    const files: Array<string> = []
    this.populateSelectedIds()
    this.selectedHunkIds.forEach((id) => {
      for (const filePath in this.autofixRun.changeset) {
        if (this.autofixRun.changeset[filePath].patches.id == id) {
          if (!files.includes(filePath)) {
            files.push(filePath)
          }
        }
      }
    })
    return files
  }

  get showCreatePullRequest(): boolean {
    return (
      this.loggedIn && this.$gateKeeper.repo(RepoPerms.CREATE_AUTOFIXES, this.repoPerms.permission)
    )
  }
}
</script>
