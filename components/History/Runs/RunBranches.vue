<template>
  <branch-list
    :loading="listLoading"
    :title="run.pullRequestNumberDisplay || run.branchName"
    :count="run.branchRunCount || branchRunCount"
    @toggled="toggled"
  >
    <!-- Section Card -->
    <template v-slot:expanded>
      <run-card
        v-for="branchRun in runsInBranch"
        :key="branchRun.node.runId"
        class="is-group-item"
        v-bind="branchRun.node"
        actionText="Analyzed"
      ></run-card>
    </template>
    <template v-slot:collapsed>
      <run-card
        class="is-group-item"
        :key="run.commitOid"
        v-bind="run"
        actionText="Analyzed"
      ></run-card>
    </template>
  </branch-list>
</template>
<script lang="ts">
import { Vue, Component, Prop, namespace } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsourcelabs/zeal'
import RunCard from './RunCard.vue'
import BranchList from '../BranchList.vue'
import { Run } from '~/types/types'

import { RunListActions } from '@/store/run/list'
import { Maybe, RunConnection, RunEdge } from '~/types/types'

const runListStore = namespace('run/list')

@Component({
  components: {
    ZIcon,
    RunCard,
    BranchList
  }
})
export default class RunBranches extends Vue {
  @Prop({ default: '' })
  run!: Run

  @Prop({ default: 0 })
  branchRunCount: number

  @runListStore.State
  branchRunList: Record<string, RunConnection>

  @runListStore.State
  loading: boolean

  @runListStore.Action(RunListActions.FETCH_BRANCH_RUNS_LIST)
  fetchBranchRuns: (args: Record<string, string>) => Promise<void>

  private listLoading = false

  toggled(isExpanded: boolean): void {
    if (isExpanded) this.fetchRuns()
  }

  get runsInBranch(): Array<Maybe<RunEdge>> {
    if (this.run.branchName) {
      return this.branchRunList[this.run.branchName]?.edges || []
    }
    return []
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
