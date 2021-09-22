<template>
  <div class="container mx-auto">
    <div
      class="text-vanilla-400 text-sm text-center flex flex-col justify-between min-h-screen pb-24 pt-32"
    >
      <video
        autoplay
        loop
        muted
        playsinline
        class="max-h-84 mx-auto"
        :poster="require('~/assets/loader/installation-loader.png')"
      >
        <source src="~/assets/loader/loader.webm" type="video/webm" />
      </video>
      <div class="space-y-2">
        <h1 class="text-2xl text-vanilla-100 font-semibold">
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
export default class Running extends mixins(RepoDetailMixin) {
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
    if (data.status === RunStatus.Pend) {
      return
    }
    
    clearTimeout(this.timer)
    setTimeout(() => {
      this.status = 'Finishing Run'
    }, 300)
    const { provider, login, repo } = this.$route.params
    await this.fetchBasicRepoDetails({
      provider,
      owner: login,
      name: repo,
      refetch: true
    })
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
