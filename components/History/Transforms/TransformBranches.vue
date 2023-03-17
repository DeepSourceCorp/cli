<template>
  <branch-list
    :title="run.pullRequestNumberDisplay || run.branchName"
    :count="run.branchRunCount"
    @toggled="toggled"
  >
    <template #expanded>
      <div class="flex flex-col space-y-2 justify-center items-center h-28" v-if="loading">
        <z-icon icon="loader" class="animate-spin duration-1000" />
        Fetching Transforms
      </div>
      <template v-else>
        <transform-card
          v-for="branchRun in runsInBranch"
          :key="branchRun.node.runId"
          class="nested-group-item"
          v-bind="branchRun.node"
          action-text="Analyzed"
          link="/history/runs/details"
        />
      </template>
    </template>
    <template #collapsed>
      <transform-card
        :key="run.commitOid"
        v-bind="run"
        class="nested-group-item"
        action-text="Analyzed"
        link="/history/runs/details"
      />
    </template>
  </branch-list>
</template>
<script lang="ts">
import { Vue, Component, Prop, namespace } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsource/zeal'
import TransformCard from './TransformCard.vue'
import BranchList from '../BranchList.vue'

import { TransformListActions } from '@/store/transformerRun/list'
import { Maybe, TransformerRunConnection, TransformerRunEdge, TransformerRun } from '~/types/types'
const transformRunListStore = namespace('transformerRun/list')

@Component({
  components: {
    ZIcon,
    TransformCard,
    BranchList
  }
})
export default class TransformBranches extends Vue {
  @Prop()
  run!: TransformerRun

  @transformRunListStore.State
  branchTransformRunList: Record<string, TransformerRunConnection>

  @transformRunListStore.State
  loading: boolean

  toggled(isExpanded: boolean): void {
    if (isExpanded) this.fetchRuns()
  }

  get runsInBranch(): Array<Maybe<TransformerRunEdge>> {
    if (this.run.branchName) {
      return this.branchTransformRunList[this.run.branchName]?.edges || []
    }
    return []
  }

  async fetchRuns(): Promise<void> {
    await this.$store.dispatch(
      `transformerRun/list/${TransformListActions.FETCH_BRANCH_TRANSFORMER_RUNS_LIST}`,
      {
        provider: this.$route.params.provider,
        owner: this.$route.params.owner,
        name: this.$route.params.repo,
        branchName: this.run.branchName
      }
    )
  }
}
</script>
