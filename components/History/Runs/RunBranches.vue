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
    <template #expanded>
      <div class="relative space-y-2">
        <!-- Fade effect -->
        <div
          class="z-10 absolute w-2 h-12 -top-6 left-px bg-gradient-to-b from-ink-400 via-ink-400 to-transparent"
        ></div>
        <run-card
          v-for="branchRun in runsInBranch"
          v-bind="generalizeRun(branchRun)"
          :key="branchRun.runId"
          :is-secondary="true"
          class="ml-4 nested-group-item"
          action-text="Analyzed"
        />
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
import { GeneralizedRunT, generalizeRun } from '~/utils/runs'

import { RunListActions } from '@/store/run/list'
import { RunConnection } from '~/types/types'
import { resolveNodes } from '~/utils/array'

const runListStore = namespace('run/list')

@Component({
  components: {
    ZIcon,
    ZTag,
    ZButton,
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
      const branchRuns = resolveNodes(runList) as Run[]

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
