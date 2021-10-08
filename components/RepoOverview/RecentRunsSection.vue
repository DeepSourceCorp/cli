<template>
  <stat-section title="Recent runs" customGridClass="grid grid-cols-12-fr" :gridSpacing="2">
    <div class="grid grid-cols-3 col-span-2 gap-1 md:space-y-2 md:col-span-1 md:block">
      <template v-for="opt in runOptions">
        <div
          v-if="allowOptions(opt.repoPerms)"
          :key="opt.name"
          class="p-2 space-y-2 text-center rounded-md cursor-pointer hover:bg-ink-300 md:text-left"
          :class="{
            'bg-ink-300': selectedRun.name == opt.name
          }"
          @click="selectedRun = opt"
        >
          <h4 class="overflow-x-hidden text-base font-semi whitespace-nowrap overflow-ellipsis">
            {{ opt.name }}
          </h4>
        </div>
      </template>
    </div>
    <div class="col-span-2 space-y-2 lg:col-span-1">
      <template v-if="runList.edges && selectedRun.name == 'Analyses'">
        <run-card
          v-for="run in runList.edges"
          :key="run.node.runId"
          v-bind="run.node"
          actionText="Analyzed"
        ></run-card>
      </template>
      <template v-else-if="transformerRunList.edges && selectedRun.name == 'Transforms'">
        <transform-card
          v-for="run in transformerRunList.edges"
          :key="run.node.runId"
          v-bind="run.node"
          actionText="Run"
        ></transform-card>
      </template>
      <template v-else-if="selectedRun.name == 'Autofixes'">
        <autofix-list-item
          v-for="run in autofixRunList.edges"
          :key="run.node.runId"
          :removeDefaultStyle="false"
          :showInfo="true"
          :status="run.node.status"
          v-bind="run.node"
        ></autofix-list-item>
      </template>
    </div>
    <template slot="footer">
      <div class="flex justify-center py-1 border-t border-ink-300">
        <z-button
          :to="$generateRoute(selectedRun.link)"
          buttonType="ghost"
          class="text-vanilla-400"
          size="small"
        >
          <div class="flex items-center space-x-1 text-xs leading-none">
            <span>{{ selectedRun.showMoreLabel }}</span>
            <z-icon
              class="transform-gpu duration-100 group-hover:translate-x-0.5"
              icon="arrow-right"
              size="x-small"
            ></z-icon>
          </div>
        </z-button>
      </div>
    </template>
  </stat-section>
</template>
<script lang="ts">
import { Component, namespace, mixins } from 'nuxt-property-decorator'
import { TrendCard, StatSection } from '@/components/Metrics'
import { ZButton, ZIcon, ZTicker } from '@deepsourcelabs/zeal'
import { RunCard, TransformCard } from '@/components/History'

// Store Imports
import { TransformListActions } from '@/store/transformerRun/list'
import { RunListActions } from '~/store/run/list'
import { AutofixRunListActions } from '~/store/autofixRun/list'

import { TransformerRunConnection } from '~/types/types'
import { RunConnection } from '~/types/types'
import { AutofixRunConnection } from '~/types/types'
import { RepoPerms } from '~/types/permTypes'
import RoleAccessMixin from '~/mixins/roleAccessMixin'

const runListStore = namespace('run/list')
const transformRunListStore = namespace('transformerRun/list')
const autofixRunListStore = namespace('autofixRun/list')

@Component({
  components: {
    StatSection,
    TrendCard,
    ZButton,
    ZIcon,
    ZTicker,
    RunCard,
    TransformCard
  },
  layout: 'repository'
})
export default class RecentRunsSection extends mixins(RoleAccessMixin) {
  @runListStore.State
  runList: RunConnection // Stores all the runs groubed by branch

  @transformRunListStore.State
  transformerRunList: TransformerRunConnection

  @autofixRunListStore.State
  autofixRunList: AutofixRunConnection

  @runListStore.Action(RunListActions.FETCH_RUN_LIST)
  fetchRunList: (args: {
    provider: string
    owner: string
    name: string
    currentPageNumber: number
    limit: number
    refetch?: boolean
  }) => Promise<void>

  @transformRunListStore.Action(TransformListActions.FETCH_TRANSFORMER_RUN_LIST)
  fetchTransformList: (args: {
    provider: string
    owner: string
    name: string
    currentPageNumber: number
    limit: number
    refetch?: boolean
  }) => Promise<void>

  @autofixRunListStore.Action(AutofixRunListActions.FETCH_AUTOFIX_RUN_LIST)
  fetchAutofixRunList: (args: {
    provider: string
    owner: string
    name: string
    currentPageNumber: number
    limit: number
    refetch?: boolean
  }) => Promise<void>

  private runOptions = [
    { name: 'Analyses', showMoreLabel: 'View all analysis runs', link: ['history', 'runs'] },
    {
      name: 'Autofixes',
      showMoreLabel: 'View all Autofix runs',
      link: 'autofix',
      repoPerms: [RepoPerms.READ_REPO]
    },
    {
      name: 'Transforms',
      showMoreLabel: 'View all transform runs',
      link: ['history', 'transforms']
    }
  ]

  public selectedRun = this.runOptions[0]

  get baseArgs(): {
    provider: string
    owner: string
    name: string
    currentPageNumber: number
    limit: number
  } {
    const { provider, repo, owner } = this.$route.params
    return {
      name: repo,
      provider,
      owner,
      currentPageNumber: 1,
      limit: 5
    }
  }

  mounted(): void {
    this.$socket.$on('repo-analysis-updated', this.refetchRuns)
    this.$socket.$on('repo-autofix-created', this.refetchAutofix)
    this.$socket.$on('committed-to-branch', this.refetchAutofix)
    this.$socket.$on('repo-transform-created', this.refetchRuns)
  }

  beforeDestroy(): void {
    this.$socket.$off('repo-analysis-updated', this.refetchRuns)
    this.$socket.$off('repo-autofix-created', this.refetchAutofix)
    this.$socket.$off('committed-to-branch', this.refetchAutofix)
    this.$socket.$off('repo-transform-created', this.refetchRuns)
  }

  refetchAutofix(): void {
    this.fetchAutofixRunList({ ...this.baseArgs, refetch: true })
  }

  refetchRuns(): void {
    this.fetchRunList({ ...this.baseArgs, refetch: true })
  }

  refetchTransformers(): void {
    this.fetchTransformList({ ...this.baseArgs, refetch: true })
  }

  allowOptions(perms?: RepoPerms[]): boolean {
    if (perms && Array.isArray(perms)) {
      return this.$gateKeeper.repo(perms, this.repoPerms.permission)
    }
    return true
  }

  async fetch(): Promise<void> {
    await this.fetchAutofixRunList(this.baseArgs)
    await this.fetchRunList(this.baseArgs)
    await this.fetchRepoPerms(this.baseArgs)
    await this.fetchTransformList(this.baseArgs)
  }
}
</script>
