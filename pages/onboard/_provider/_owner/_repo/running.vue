<template>
  <section class="space-y-4">
    <div class="border rounded-md bg-ink-400 border-ink-200">
      <div class="p-5 font-medium border-ink-200">Your first analysis is running...</div>
      <div
        v-for="(stage, index) in stages"
        :key="stage.title"
        class="flex items-center justify-between px-5 py-5 text-sm"
        :class="{
          'bg-ink-300 border-t border-ink-200': stage.status === 'in-progress',
          'border-t border-ink-200': index === 0,
          'border-b': stage.status === 'in-progress' && index !== stages.length - 1,
          'border-b-0': index === stages.length - 1
        }"
      >
        <div>
          <div>{{ stage.title }}</div>
          <span
            class="mt-1 text-xs text-vanilla-400"
            v-if="stage.message && stage.status === 'in-progress'"
          >
            {{ stage.message }}
          </span>
        </div>
        <div
          v-if="stage.status === 'complete'"
          class="flex items-center justify-center w-4 h-4 rounded-full bg-juniper"
        >
          <z-icon icon="check" color="ink-400" class="stroke-2.5" size="x-small" />
        </div>
        <z-icon v-else-if="stage.status === 'pending'" icon="circle" color="ink-200" />
        <z-icon
          v-else-if="stage.status === 'in-progress'"
          icon="spin-loader"
          class="animate-spin"
          color="juniper"
        />
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsource/zeal'
import { WSRepoAnalysisUpdatedPayload } from '~/types/websockets'
import { RunStatus } from '~/types/types'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import MetaMixin from '~/mixins/metaMixin'

export enum STATUS {
  IN_PROGRESS = 'in-progress',
  PENDING = 'pending',
  COMPLETE = 'complete'
}

/**
 * A read only page that shows a fake loader while the analysis is being run
 * for the repository being onboarded
 */
@Component({
  components: {
    ZIcon
  },
  middleware: ['restrictOnboarding'],
  meta: {
    auth: {
      strict: true,
      redirectToLogin: true
    }
  }
})
export default class OnboardRunning extends mixins(
  RepoDetailMixin,
  ActiveUserMixin,
  OwnerDetailMixin,
  MetaMixin
) {
  public timer: ReturnType<typeof setTimeout>

  public stages = [
    { title: 'Fetching your code', duration: 8, status: STATUS.IN_PROGRESS },
    { title: 'Setting up Analyzers', duration: 10, status: STATUS.PENDING },
    {
      title: 'Analyzing your code',
      message: 'This might take a few seconds, hang tight!',
      duration: 100,
      status: STATUS.PENDING
    },
    { title: 'Calculating metrics', duration: 40, status: STATUS.PENDING }
  ]

  /**
   * Created hook to set the metaTitle
   *
   * @return {void}
   */
  created(): void {
    const { owner, repo } = this.$route.params
    this.metaTitle = `Analyzing ${owner}/${repo} • DeepSource`
  }

  /**
   * Vue mounted hook, this function starts the ticker and mounts the websocket event
   * @return {void}
   */
  mounted(): void {
    this.next(0)
    this.$socket.$on('repo-analysis-updated', this.openIssuesPage)
  }

  /**
   * Vue beforeDestroy hook, removes the websocket listener
   * @return {void}
   */
  beforeDestroy(): void {
    this.$socket.$off('repo-analysis-updated', this.openIssuesPage)
  }

  /**
   * Open the issues page for the selected repository
   * This is triggered only when the run is concluded
   * @param {WSRepoAnalysisUpdatedPayload} data
   * @return {Promise<void>}
   */
  async openIssuesPage(data: WSRepoAnalysisUpdatedPayload): Promise<void> {
    if ([RunStatus.Pend, 'pend', 'PEND', 'Pend'].includes(data.status)) {
      return
    }

    clearTimeout(this.timer)

    setTimeout(() => {
      this.stages = this.stages.map((stage) => {
        stage.status = STATUS.COMPLETE
        return stage
      })
    }, 300)

    const { provider, owner, repo } = this.$route.params

    await Promise.all([
      this.fetchBasicRepoDetails({
        provider,
        owner,
        name: repo,
        refetch: true
      }),
      this.fetchActiveUser({
        refetch: true
      }),
      this.fetchOwnerDetails({
        login: owner,
        provider,
        refetch: true
      })
    ])

    setTimeout(() => {
      this.$router.push(`/${provider}/${owner}/${repo}/issues`)
    }, 300)
  }

  /**
   * Recursive ticker that shows the next step
   * in repo activation
   * @param {number} index
   * @return {void}
   */
  next(index: number): void {
    if (index > 3) return

    if (index > 0) {
      this.stages[index - 1].status = STATUS.COMPLETE
    }

    this.stages[index].status = STATUS.IN_PROGRESS

    this.timer = setTimeout(() => {
      this.next(index + 1)
    }, this.stages[index].duration * 1000)
  }
}
</script>
