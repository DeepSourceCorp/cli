<template>
  <branch-list
    :loading="listLoading"
    :title="run.pullRequestNumberDisplay || run.branchName"
    :count="run.branchRunCount || branchRunCount"
    @toggled="toggled"
  >
    <!-- Section Card -->
    <template v-slot:collapsed="{ toggleItems }">
      <run-card :key="run.commitOid" v-bind="run" action-text="Analyzed" class="z-20">
        <template slot="toggleTrigger">
          <div v-if="count" class="flex space-x-2 cursor-pointer md:items-center">
            <button
              :disabled="listLoading"
              v-tooltip="!isExpanded ? 'Show more runs' : ''"
              tabindex="0"
              @click.prevent="toggleItems"
              class="inline-flex items-center px-2 py-1 md:py-1.5 border rounded-full gap-x-1.5 justify-evenly bg-ink-300 hover:bg-ink-200 border-ink-200"
            >
              <span class="font-normal leading-none text-xxs md:text-xs text-vanilla-400">
                {{ countText }}
              </span>
              <z-icon
                v-if="listLoading"
                color="vanilla-400"
                icon="spin-loader"
                size="x-small"
                class="animate-spin"
              />
              <z-icon
                v-else
                icon="chevron-down"
                size="x-small"
                class="transition-all duration-300 transform"
                :class="(isExpanded && 'rotate-180') || 'rotate-0'"
              />
            </button>
          </div>
        </template>
      </run-card>
    </template>
    <template v-slot:expanded>
      <div class="relative space-y-2">
        <!-- Fade effect -->
        <div
          class="z-10 absolute w-2 h-12 -top-6 left-px bg-gradient-to-b from-ink-400 via-ink-400 to-transparent"
        ></div>
        <run-card
          v-for="branchRun in runsInBranch"
          :key="branchRun.runId"
          :is-secondary="true"
          class="ml-4 is-group-item"
          v-bind="branchRun"
          action-text="Analyzed"
        ></run-card>
      </div>
    </template>
  </branch-list>
</template>
<script lang="ts">
import { Vue, Component, Prop, namespace } from 'nuxt-property-decorator'
import { ZIcon, ZTag, ZButton } from '@deepsourcelabs/zeal'
import RunCard from './RunCard.vue'
import BranchList from '../BranchList.vue'
import { Run } from '~/types/types'

import { RunListActions } from '@/store/run/list'
import { Maybe, RunConnection, RunEdge } from '~/types/types'
import { resolveNodes } from '~/utils/array'

const runListStore = namespace('run/list')

@Component({
  components: {
    ZIcon,
    ZTag,
    ZButton,
    RunCard,
    BranchList
  }
})
export default class RunBranches extends Vue {
  public listLoading = false
  public isExpanded = false

  @Prop({ default: '' })
  run!: Run

  @Prop({ default: 0 })
  branchRunCount: number

  @runListStore.State
  branchRunList: Record<string, RunConnection>

  @runListStore.Action(RunListActions.FETCH_BRANCH_RUNS_LIST)
  fetchBranchRuns: (args: Record<string, string>) => Promise<void>

  /**
   * Callback to handle the 'toggle' event of branch-list
   * Fetches all runs on this branch and emits the 'expanded' event
   *
   * * @return {Promise<void>}
   */
  async toggled(isExpanded: boolean): Promise<void> {
    this.isExpanded = isExpanded
    if (isExpanded) {
      await this.fetchRuns()
      this.$emit('expanded', this.run.branchName)
    } else this.$emit('expanded', '')
  }

  /**
   * Get all other runs in the branch by filtering out the current run from branchRunList
   *
   * * @return {Array<Run>}
   */
  get runsInBranch(): Array<Run> {
    if (this.run.branchName) {
      const runList = this.branchRunList[this.run.branchName] || []
      const branchRuns = resolveNodes(runList) as Run[]

      return branchRuns.filter((run) => run.runId !== this.run.runId)
    }
    return []
  }

  /**
   * Get the count of 'other' runs on this branch
   *
   * * @return {number}
   */
  get count(): number {
    return (this.run.branchRunCount || this.branchRunCount) - 1
  }

  get countText(): string {
    if (this.count === 1) {
      // singular
      return `${this.count} more run`
    } else if (this.count > 1 && this.count <= 30) {
      // plural
      return `${this.count} more runs`
    } else if (this.count > 30) {
      return `30 more runs`
    } else {
      return ''
    }
  }

  async fetchRuns(): Promise<void> {
    this.listLoading = true
    await this.fetchBranchRuns({
      provider: this.$route.params.provider,
      owner: this.$route.params.owner,
      name: this.$route.params.repo,
      branchName: this.run.branchName || ''
    }).then(() => {
      this.listLoading = false
    })
  }
}
</script>
