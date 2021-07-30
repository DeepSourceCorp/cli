<template>
  <stat-section title="Recent runs" customGridClass="grid grid-cols-12-fr" :gridSpacing="2">
    <div class="md:space-y-2 col-span-2 md:col-span-1 grid grid-cols-3 gap-1 md:block">
      <div
        v-for="opt in runOptions"
        :key="opt.name"
        class="p-2 space-y-2 rounded-md hover:bg-ink-300 cursor-pointer text-center md:text-left"
        :class="{
          'bg-ink-300': selectedRun.name == opt.name
        }"
        @click="selectedRun = opt"
      >
        <h4 class="text-base font-semi whitespace-nowrap overflow-x-hidden overflow-ellipsis">
          {{ opt.name }}
        </h4>
      </div>
    </div>
    <div class="lg:col-span-1 col-span-2 space-y-2">
      <template v-if="runList.edges && selectedRun.name == 'Analysis runs'">
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
          :showInfo="false"
          :status="run.node.status"
          v-bind="run.node"
        ></autofix-list-item>
      </template>
    </div>
    <template slot="footer">
      <div class="border-t border-ink-300 flex justify-center py-1">
        <z-button
          :to="$generateRoute(selectedRun.link)"
          buttonType="ghost"
          class="text-vanilla-400"
          size="small"
        >
          <div class="text-xs flex items-center leading-none space-x-1">
            <span>View all {{ selectedRun.name.toLowerCase() }}</span>
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
import { Vue, Component, namespace } from 'nuxt-property-decorator'
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
export default class RecentRunsSection extends Vue {
  @runListStore.State
  runList: RunConnection // Stores all the runs groubed by branch

  @transformRunListStore.State
  transformerRunList: TransformerRunConnection

  @autofixRunListStore.State
  autofixRunList: AutofixRunConnection

  @runListStore.Action(RunListActions.FETCH_RUN_LIST)
  fetchRunList: (args: Record<string, string | number>) => Promise<void>

  @transformRunListStore.Action(TransformListActions.FETCH_TRANSFORMER_RUN_LIST)
  fetchTransformList: (args: Record<string, string | number>) => Promise<void>

  @autofixRunListStore.Action(AutofixRunListActions.FETCH_AUTOFIX_RUN_LIST)
  fetchAutofixRunList: (args: Record<string, string | number>) => Promise<void>

  private runOptions = [
    { name: 'Analysis runs', link: ['history', 'runs'] },
    { name: 'Autofixes', link: 'autofix' },
    { name: 'Transforms', link: ['history', 'transforms'] }
  ]

  private selectedRun = this.runOptions[0]

  get baseArgs(): { provider: string; owner: string; name: string } {
    const { provider, repo, owner } = this.$route.params
    return {
      name: repo,
      provider,
      owner
    }
  }

  async fetch(): Promise<void> {
    await this.fetchAutofixRunList({ ...this.baseArgs, limit: 5 })

    await this.fetchRunList({
      ...this.baseArgs,
      currentPageNumber: 0,
      limit: 5
    })

    await this.fetchTransformList({
      ...this.baseArgs,
      currentPageNumber: 0,
      limit: 5
    })
  }
}
</script>
