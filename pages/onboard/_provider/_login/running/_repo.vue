<template>
  <div class="container mx-auto">
    <div
      class="flex flex-col justify-between min-h-screen pt-32 pb-24 text-sm text-center text-vanilla-400"
    >
      <video
        autoplay
        loop
        muted
        playsinline
        class="mx-auto max-h-84"
        :poster="require('~/assets/loader/installation-loader.png')"
      >
        <source src="~/assets/loader/loader.webm" type="video/webm" />
      </video>
      <div class="space-y-2">
        <h1 class="text-2xl font-semibold text-vanilla-100">
          Analyzing {{ $route.params.login }}/{{ $route.params.repo }}
        </h1>
        <transition enter-active-class="animate-slide-bottom-enter-active" mode="out-in">
          <p v-bind:key="status">{{ status }}</p>
        </transition>
      </div>
      <div class="space-y-2">
        <p>This page will refresh automatically.</p>
        <p class="font-semibold">Please do not close this window.</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import { RunStatus } from '~/types/types'
import { WSRepoAnalysisUpdatedPayload } from '~/types/websockets'

@Component({
  meta: {
    auth: {
      strict: true
    }
  }
})
export default class Running extends mixins(RepoDetailMixin, ActiveUserMixin, OwnerDetailMixin) {
  public status = 'Waking up marvin'
  public timer: ReturnType<typeof setTimeout>

  public stages = [
    { status: 'Waking up marvin', duration: 8 },
    { status: 'Setting up analyzer', duration: 12 },
    { status: 'Analyzing the repository for issues, this may take a while', duration: 90 },
    { status: 'Calculating metrics', duration: 15 }
  ]

  mounted(): void {
    this.next(0)
    this.$socket.$on('repo-analysis-updated', this.openIssuesPage)
  }

  beforeDestroy(): void {
    this.$socket.$off('repo-analysis-updated', this.openIssuesPage)
  }

  async openIssuesPage(data: WSRepoAnalysisUpdatedPayload): Promise<void> {
    if ([RunStatus.Pend, 'pend', 'PEND', 'Pend'].includes(data.status)) {
      return
    }

    clearTimeout(this.timer)
    setTimeout(() => {
      this.status = 'Finishing Run'
    }, 300)
    const { provider, login, repo } = this.$route.params

    await Promise.all([
      this.fetchBasicRepoDetails({
        provider,
        owner: login,
        name: repo,
        refetch: true
      }),
      this.fetchActiveUser({
        refetch: true
      }),
      this.fetchOwnerDetails({
        login,
        provider,
        refetch: true
      })
    ])

    setTimeout(() => {
      this.$router.push(`/${provider}/${login}/${repo}/issues`)
    }, 1000)
  }

  next(index: number): void {
    if (index > 3) return
    this.status = this.stages[index].status
    this.timer = setTimeout(() => {
      this.next(index + 1)
    }, this.stages[index].duration * 1000)
  }
}
</script>
