<template>
  <div class="p-4 w-full space-y-6">
    <!-- Available Autofixes -->
    <install-autofix-notice v-if="!repository.isAutofixEnabled && canEnableAutofix" />
    <stat-section
      v-if="
        (repository.autofixableIssuesPerAnalyzer &&
          repository.autofixableIssuesPerAnalyzer.length) ||
        (fetchingData && loaderCount > 0)
      "
      title="Available Autofixes"
      helpText="Summary of issues that can be Autofixed"
      :showBorder="false"
      spacingClass="gap-3"
      customGridClass="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
      :bodyIsGrid="fetchingData || showAvailableAutofixes"
    >
      <template v-if="fetchingData">
        <div
          v-for="idx in loaderCount"
          :key="idx"
          class="flex flex-col justify-between h-28 p-2 space-y-2 bg-ink-300 rounded-md"
        >
          <div class="flex justify-between space-x-2">
            <div class="w-48 h-5 rounded-md bg-ink-200 animate-pulse"></div>
            <div class="w-5 h-5 rounded-md bg-ink-200 animate-pulse"></div>
          </div>
          <div class="h-8 rounded-md bg-ink-200 w-40 animate-pulse"></div>
          <div class="w-16 h-4 rounded-md bg-ink-200 animate-pulse"></div>
        </div>
      </template>
      <template v-else-if="showAvailableAutofixes">
        <autofix-card
          v-for="autofix in repository.autofixableIssuesPerAnalyzer"
          :key="autofix.analyzer.shortcode"
          v-bind="autofix"
        ></autofix-card>
      </template>
      <!-- TODO: Empty state -->
      <div v-else class="w-full h-full flex justify-center items-center p-2">
        No Autofixes available
      </div>
    </stat-section>
    <!-- Autofix Stats -->
    <autofix-issues-graph />
    <!-- Recent Autofixes -->
    <div v-if="loading">
      <div class="w-full h-full flex space-x-2">
        <div class="h-full w-full flex flex-col space-y-3">
          <div class="h-20 bg-ink-300 rounded-md animate-pulse"></div>
          <div class="h-20 bg-ink-300 rounded-md animate-pulse"></div>
          <div class="h-20 bg-ink-300 rounded-md animate-pulse"></div>
          <div class="h-20 bg-ink-300 rounded-md animate-pulse"></div>
        </div>
      </div>
    </div>
    <div v-if="!loading && autofixRunList.edges.length > 0" class="w-full flex flex-col space-y-4">
      <stat-section
        v-if="autofixListItems.length > 0"
        title="Recent Autofixes"
        customGridClass="grid grid-cols-12-fr"
        :gridSpacing="2"
      >
        <div class="md:space-y-2 col-span-2 md:col-span-1 grid grid-cols-3 gap-1 md:block">
          <div
            v-for="opt in options"
            :key="opt.name"
            class="p-2 space-y-2 rounded-md hover:bg-ink-300 cursor-pointer text-center md:text-left"
            :class="{
              'bg-ink-300': selectedRun.name == opt.name
            }"
            @click="selectedRun = opt"
          >
            <h4 class="text-sm font-semi">{{ opt.name }}</h4>
          </div>
        </div>
        <div class="lg:col-span-1 col-span-2 space-y-2">
          <template v-if="selectedRun.name == 'Action needed'">
            <div
              v-if="pendingListItems && pendingListItems.length > 0"
              class="w-full flex flex-col space-y-3"
            >
              <autofix-list-item
                v-for="run in pendingListItems"
                :key="run.runId"
                :autofixRun="run"
                @autofix="createPullRequest"
                v-bind="run"
                :showInfo="false"
              ></autofix-list-item>
            </div>
            <div v-else class="w-full h-40 flex items-center justify-center">
              No pending commits
            </div>
          </template>
          <template v-else-if="selectedRun.name == 'History'">
            <div
              v-if="autofixListItems && autofixListItems.length > 0"
              class="w-full flex flex-col space-y-3"
            >
              <autofix-list-item
                v-for="run in autofixListItems"
                :key="run.runId"
                :autofixRun="run"
                @autofix="createPullRequest"
                v-bind="run"
              ></autofix-list-item>
            </div>
            <div v-else class="w-full h-40 flex items-center justify-center">
              No autofix runs available
            </div>
          </template>
        </div>
        <template slot="footer">
          <div class="border-t border-ink-300 flex justify-center py-1"></div>
        </template>
      </stat-section>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, namespace, mixins } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsourcelabs/zeal'
import { InfoIcon, AutofixCard, AutofixListItem } from '@/components/Autofix/index'
import { AutofixRunListActions } from '~/store/autofixRun/list'
import {
  AutofixRun,
  AutofixRunConnection,
  AutofixRunStatus,
  CreatePullRequestInput,
  Maybe
} from '~/types/types'
import { RunDetailActions } from '~/store/run/detail'
import { AutofixIssuesGraph } from '@/components/Graphs'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import { RepoPerms } from '~/types/permTypes'
import RoleAccessMixin from '~/mixins/roleAccessMixin'

const autofixRunListStore = namespace('autofixRun/list')
const runStore = namespace('run/detail')

interface Trend {
  labels: string[]
  values: number[]
}

@Component({
  components: {
    ZIcon,
    InfoIcon,
    AutofixCard,
    AutofixListItem,
    AutofixIssuesGraph
  },
  layout: 'repository'
})
export default class Autofix extends mixins(RepoDetailMixin, RoleAccessMixin) {
  @autofixRunListStore.State
  autofixRunList!: AutofixRunConnection

  @autofixRunListStore.State
  loading!: boolean

  @autofixRunListStore.Action(AutofixRunListActions.FETCH_AUTOFIX_RUN_LIST)
  fetchAutofixRunList: (args: {
    provider: string
    owner: string
    name: string
    refetch: boolean
  }) => Promise<void>

  @runStore.Action(RunDetailActions.CREATE_PR)
  createPR: (
    params: Record<string, Record<string, string[] | string>>
  ) => { data: { input: CreatePullRequestInput } }

  @runStore.Action(RunDetailActions.COMMIT_TO_PR)
  commitFixToPR: (
    params: Record<string, Record<string, string[] | string>>
  ) => { data: { input: CreatePullRequestInput } }

  public unCommittedCommits = 0
  public lastDays = 30
  public autofixRun: AutofixRun | null = null
  public selectedHunkIds: Array<string> = []
  public filesAffected: AutofixRun | Array<string> = []
  public fetchingData = false
  private options = [
    { name: 'Action needed', link: ['history', 'runs'] },
    { name: 'History', link: 'autofix' }
  ]
  private selectedRun = this.options[0]

  mounted(): void {
    this.$socket.$on('refetch-autofix-run', (data: Record<string, string>) => {
      this.fetchAutofixRunList({
        ...this.baseRouteParams,
        refetch: true
      })
    })
  }

  created(): void {
    this.setAnalysisUpdateEvent()
  }

  async fetch(): Promise<void> {
    this.fetchingData = true
    await this.fetchBasicRepoDeatils(this.baseRouteParams)
    await this.fetchRepoPerms(this.baseRouteParams)
    await this.fetchAutofixRunList({
      ...this.baseRouteParams,
      refetch: false
    })
    this.fetchingData = false
    this.setLoaderCount(this.repository.autofixableIssuesPerAnalyzer?.length ?? 4)
  }

  get showAvailableAutofixes(): boolean {
    const available = this.repository.autofixableIssuesPerAnalyzer
    return Boolean(available && available.length > 0)
  }

  get pendingListItems(): Array<Maybe<AutofixRun> | undefined> {
    const items: Array<Maybe<AutofixRun> | undefined> = []
    if (this.autofixRunList.edges && this.autofixRunList.edges.length > 0) {
      this.autofixRunList.edges.forEach((run) => {
        if (run?.node?.status === AutofixRunStatus.Pend) {
          this.unCommittedCommits++
          items.push(run?.node)
        }
      })
    }
    return items
  }

  get autofixListItems(): Array<Maybe<AutofixRun> | undefined> {
    const items: Array<Maybe<AutofixRun> | undefined> = []
    if (this.autofixRunList.edges && this.autofixRunList.edges.length > 0) {
      this.autofixRunList.edges.forEach((run) => {
        if (run?.node?.status !== AutofixRunStatus.Pend) {
          items.push(run?.node)
        }
      })
    }
    return items
  }

  public async createPullRequest(autofixItem: {
    autofix: AutofixRun
    filesAffected: Array<string>
    selectedHunkIds: Array<string>
  }): Promise<void> {
    this.autofixRun = { ...autofixItem.autofix }
    this.filesAffected = autofixItem.filesAffected
    this.selectedHunkIds = autofixItem.selectedHunkIds
    try {
      await this.createPR({
        input: {
          patches: this.selectedHunkIds,
          repoId: this.repository.id,
          autofixRunId: this.autofixRun?.runId
        }
      })
      this.$toast.success('PR is created for the Autofix run successfully')
      this.$socket.$emit('refetch-autofix-run')
    } catch (e) {
      this.$toast.danger('Something went wrong')
    }
  }

  setLoaderCount(count: number): void {
    const { provider, owner, repo } = this.$route.params
    this.$localStore.set(`${provider}-${owner}-${repo}`, 'autofix-available-autofixes-count', count)
  }

  get canEnableAutofix(): boolean {
    return this.$gateKeeper.repo(RepoPerms.INSTALL_AUTOFIX_APP, this.repoPerms.permission)
  }

  get loaderCount(): number {
    const { provider, owner, repo } = this.$route.params
    const localCountFromStore = this.$localStore.get(
      `${provider}-${owner}-${repo}`,
      'autofix-available-autofixes-count'
    ) as number
    return localCountFromStore ?? 3
  }

  head(): Record<string, string> {
    const { repo, owner } = this.$route.params
    return {
      title: `Autofix • ${owner}/${repo}`,
      description:
        'DeepSource is an automated code review tool that helps developers automatically find and fix issues in their code.'
    }
  }
}
</script>
