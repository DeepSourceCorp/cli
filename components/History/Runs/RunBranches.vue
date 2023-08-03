<template>
  <branch-list
    :loading="listLoading"
    :title="generalizedRun.prNumber || generalizedRun.branchName"
    :count="generalizedRun.runCount || branchRunCount"
    :is-expanded="isExpanded"
    @toggled="toggled"
  >
    <!-- Section Card -->
    <template #collapsed="{ toggleItems }">
      <run-card
        :key="generalizedRun.commitOid"
        v-bind="generalizedRun"
        action-text="Analyzed"
        class="z-20"
      >
        <template #toggleTrigger>
          <div v-if="count" class="flex cursor-pointer space-x-2 md:items-center">
            <button
              v-tooltip="!isExpanded ? 'Show more runs' : ''"
              :disabled="listLoading"
              tabindex="0"
              class="inline-flex items-center justify-evenly gap-x-1.5 rounded-full border border-slate-400 bg-ink-300 px-2 py-1 hover:bg-ink-200 md:py-1.5"
              @click.prevent="toggleItems"
            >
              <span class="text-xxs font-normal leading-none text-vanilla-400 md:text-xs">
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
                class="transform transition-all duration-300"
                :class="(isExpanded && 'rotate-180') || 'rotate-0'"
              />
            </button>
          </div>
        </template>
      </run-card>
    </template>
    <template #expanded>
      <div class="relative space-y-2">
        <!-- Fade effect -->
        <div
          class="absolute -top-6 left-px z-10 h-12 w-2 bg-gradient-to-b from-ink-400 via-ink-400 to-transparent"
        ></div>
        <run-card
          v-for="branchRun in runsInBranch"
          v-bind="generalizeRun(branchRun)"
          :key="branchRun.runId"
          :is-secondary="true"
          class="nested-group-item ml-4"
          action-text="Analyzed"
        />
      </div>
    </template>
  </branch-list>
</template>
<script lang="ts">
import { Vue, Component, Prop, namespace } from 'nuxt-property-decorator'
import RunCard from './RunCard.vue'
import BranchList from '../BranchList.vue'
import { Run } from '~/types/types'
import { GeneralizedRunT, generalizeRun } from '~/utils/runs'

import { RunListActions } from '@/store/run/list'
import { RunConnection } from '~/types/types'
import { resolveNodes } from '~/utils/array'

const runListStore = namespace('run/list')

@Component({
  components: {
    RunCard,
    BranchList
  },
  methods: { generalizeRun }
})
export default class RunBranches extends Vue {
  public listLoading = false

  @Prop({ type: Boolean, default: false })
  isExpanded: boolean

  @Prop({ default: () => {} })
  generalizedRun!: GeneralizedRunT

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
    if (isExpanded) {
      await this.fetchRuns()
      this.$emit('expanded', this.generalizedRun.branchName)
    } else this.$emit('expanded', '')
  }

  /**
   * Get all other runs in the branch by filtering out the current run from branchRunList
   *
   * * @return {Array<Run>}
   */
  get runsInBranch(): Array<Run> {
    if (this.generalizedRun.branchName) {
      const runList = this.branchRunList[this.generalizedRun.branchName] || []
      const branchRuns = resolveNodes(runList)

      return branchRuns.filter((run) => run.runId !== this.generalizedRun.runId)
    }
    return []
  }

  /**
   * Get the count of 'other' runs on this branch
   *
   * * @return {number}
   */
  get count(): number {
    return (this.generalizedRun.runCount || this.branchRunCount) - 1
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
      branchName: this.generalizedRun.branchName || ''
    }).then(() => {
      this.listLoading = false
    })
  }
}
</script>
