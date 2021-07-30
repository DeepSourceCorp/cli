<template>
  <div class="container mx-auto">
    <div
      class="text-vanilla-400 text-sm text-center flex flex-col justify-between min-h-screen pb-24 pt-32"
    >
      <div class="space-y-2">
        <video class="max-w-xl mx-auto" poster="/installation-loader.png" autoplay>
          <source src="/loading.mp4" type="video/mp4" />
        </video>
        <h1 class="text-2xl text-vanilla-100 font-semibold">
          Analyzing {{ this.$route.params.login }}/{{ this.$route.params.repo }}
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
import { Vue, Component } from 'nuxt-property-decorator'

@Component({
  meta: {
    auth: {
      strict: true
    }
  }
})
export default class Running extends Vue {
  public status = 'Waking up marvin'
  public timer: ReturnType<typeof setTimeout>

  public stages = [
    { status: 'Waking up marvin', duration: 3 },
    { status: 'Setting up analyzer', duration: 5 },
    { status: 'Analyzing the repository for issues, this may take a while', duration: 30 },
    { status: 'Calculating Metrics', duration: 15 }
  ]

  mounted(): void {
    this.next(0)
    this.$socket.$on('repo-analysis-updated', (data: Record<string, string>) => {
      clearTimeout(this.timer)
      this.status = 'Finishing Run'
      const { provider, login, repo } = this.$route.params
      setTimeout(() => {
        this.$router.push(`/${provider}/${login}/${repo}/issues`)
      }, 300)
    })
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
