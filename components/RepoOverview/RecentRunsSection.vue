<template>
  <stat-section
    title="Recent runs"
    :custom-grid-class="`grid ${runOptions.length > 1 ? 'grid-cols-12-fr' : 'grid-cols-1'}`"
    :grid-spacing="2"
  >
    <div
      v-if="runOptions.length > 1"
      class="grid grid-cols-3 col-span-2 gap-1 md:space-y-2 md:col-span-1 md:block"
    >
      <template v-for="opt in runOptions">
        <div
          v-if="allowOptions(opt.repoPerms)"
          :key="opt.name"
          class="p-2 space-y-2 text-center rounded-md cursor-pointer hover:bg-ink-300 md:text-left"
          :class="{
            'bg-ink-300': selectedRun === opt.name
          }"
          @click="updateSelectedRun(opt)"
        >
          <h4 class="overflow-x-hidden text-base font-semi whitespace-nowrap overflow-ellipsis">
            {{ opt.name }}
          </h4>
        </div>
      </template>
    </div>
    <div class="col-span-2 space-y-2 lg:col-span-1">
      <template v-if="runList.edges && selectedRun === 'Analysis runs'">
        <empty-state v-if="runList.edges.length < 1">
          <template slot="title">
            <p class="text-base text-vanilla-300">No recent Analysis runs</p>
          </template>
        </empty-state>
        <run-card
          v-for="run in runList.edges"
          :key="run.node.runId"
          v-bind="generalizeRun(run.node)"
          actionText="Analyzed"
        />
      </template>
      <template v-else-if="transformerRunList.edges && selectedRun === 'Transforms'">
        <empty-state v-if="transformerRunList.edges.length < 1">
          <template slot="title">
            <p class="text-base text-vanilla-300">No recent Transforms</p>
          </template>
        </empty-state>
        <transform-card
          v-for="run in transformerRunList.edges"
          :key="run.node.runId"
          v-bind="run.node"
          actionText="Run"
        ></transform-card>
      </template>
      <template v-else-if="selectedRun === 'Autofixes'">
        <empty-state v-if="autofixRunList.edges.length < 1">
          <template slot="title">
            <p class="text-base text-vanilla-300">No recent Autofixes</p>
          </template></empty-state
        >
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
          :to="$generateRoute(selectedRunInfo.link)"
          buttonType="ghost"
          class="text-vanilla-400"
          size="small"
        >
          <div class="flex items-center space-x-1 text-xs leading-none">
            <span>{{ selectedRunInfo.showMoreLabel }}</span>
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
import { AppFeatures, RepoPerms } from '~/types/permTypes'
import RoleAccessMixin from '~/mixins/roleAccessMixin'
import { generalizeRun } from '~/utils/runs'

const runListStore = namespace('run/list')
const transformRunListStore = namespace('transformerRun/list')
const autofixRunListStore = namespace('autofixRun/list')

interface IRunOptions {
  name: string
  showMoreLabel: string
  link: string | string[]
  repoPerms?: RepoPerms[]
}

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
  layout: 'repository',
  methods: { generalizeRun }
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

  get runOptions(): IRunOptions[] {
    const options: IRunOptions[] = [
      { name: 'Analysis runs', showMoreLabel: 'View all Analysis runs', link: ['history', 'runs'] }
    ]

    const { provider } = this.$route.params

    if (this.$gateKeeper.provider(AppFeatures.AUTOFIX, provider)) {
      options.push({
        name: 'Autofixes',
        showMoreLabel: 'View all Autofixes',
        link: 'autofix',
        repoPerms: [RepoPerms.READ_REPO]
      })
    }

    if (this.$gateKeeper.provider(AppFeatures.TRANSFORMS, provider)) {
      options.push({
        name: 'Transforms',
        showMoreLabel: 'View all Transforms',
        link: ['history', 'transforms']
      })
    }

    return options
  }

  public selectedRun = ''

  get selectedRunInfo() {
    if (this.selectedRun) {
      return this.runOptions.find(({ name }) => this.selectedRun === name)
    }
    return this.runOptions[0]
  }

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

    const { provider, owner, repo } = this.$route.params
    let runName =
      (this.$localStore.get(`${provider}-${owner}-${repo}`, 'selected-run') as string) ??
      this.runOptions[0].name

    if (this.runOptions.some(({ name }) => name === runName)) {
      this.selectedRun = runName
    } else {
      this.selectedRun = this.runOptions[0].name
    }
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

  updateSelectedRun(opt: IRunOptions): void {
    this.selectedRun = opt.name
    const { provider, owner, repo } = this.$route.params
    this.$localStore.set(`${provider}-${owner}-${repo}`, 'selected-run', opt.name)
  }

  async fetch(): Promise<void> {
    await this.fetchAutofixRunList(this.baseArgs)
    await this.fetchRunList(this.baseArgs)
    await this.fetchRepoPerms(this.baseArgs)
    await this.fetchTransformList(this.baseArgs)
  }
}
</script>
