<template>
  <div>
    <sub-nav active="transforms"></sub-nav>
    <div class="grid gap-4 w-full px-2 md:px-4 py-2 md:py-4">
      <template v-if="transformRuns">
        <template v-if="transformRuns.length">
          <transform-branches
            v-for="run in transformRuns"
            :key="run.branchName"
            :run="run"
          >
          </transform-branches>
        </template>
        <template v-else>No transforms</template>
      </template>
      <template v-else>
        <div v-for="key in 6" :key="key" class="space-y-2 animate-pulse">
          <div class="h-8 w-24 bg-ink-200 rounded-md"></div>
          <div class="h-24 w-full bg-ink-200 rounded-md"></div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, namespace, mixins } from 'nuxt-property-decorator'

// Components
import { SubNav, TransformBranches } from '@/components/History'

// Store & Types
import { TransformListActions } from '@/store/transformerRun/list'
import { TransformerRun, TransformerRunConnection } from '~/types/types'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import { resolveNodes } from '~/utils/array'

const transformRunListStore = namespace('transformerRun/list')

@Component({
  components: {
    TransformBranches,
    SubNav
  },
  layout: 'repository'
})
export default class Transforms extends mixins(RepoDetailMixin) {
  @transformRunListStore.State
  transformerRunList: TransformerRunConnection

  async fetch(): Promise<void> {
    await this.fetchTransformRuns()
  }

  get transformRuns(): TransformerRun[] {
    return resolveNodes(this.transformerRunList) as TransformerRun[]
  }

  mounted(): void {
    this.$socket.$on('transformerrun-patches-ready', this.fetchTransformRuns)
    this.$socket.$on('repo-transform-created', this.fetchTransformRuns)
  }
  
  beforeDestroy(): void {
    this.$socket.$off('transformerrun-patches-ready', this.fetchTransformRuns)
    this.$socket.$off('transformerrun-patches-ready', this.fetchTransformRuns)
  }

  async fetchTransformRuns(): Promise<void> {
    await this.$store.dispatch(
      `transformerRun/list/${TransformListActions.FETCH_TRANSFORMER_RUN_LIST}`,
      {
        provider: this.$route.params.provider,
        owner: this.$route.params.owner,
        name: this.$route.params.repo,
        currentPageNumber: 0,
        limit: 30
      }
    )
  }

  head(): Record<string, string> {
    const { repo, owner } = this.$route.params
    return {
      title: `History • ${owner}/${repo}`,
      description:
        'DeepSource is an automated code review tool that helps developers automatically find and fix issues in their code.'
    }
  }
}
</script>
