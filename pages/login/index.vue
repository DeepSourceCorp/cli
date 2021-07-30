<template>
  <div
    class="text-vanilla-100 flex flex-col items-center justify-center min-h-screen max-w-md mx-auto"
  >
    <div class="p-6 lg:text-left flex flex-col">
      <div class="mb-12">
        <img
          src="~/assets/images/logo-wordmark-white.svg"
          alt="DeepSource Logo"
          class="h-6 w-auto"
        />
      </div>
      <h1 class="leading-tight text-3xl font-bold sm:text-left">Log in to DeepSource</h1>
      <div class="flex flex-col items-center mt-8 space-y-4 left-section__btn-group">
        <a
          v-for="opt in loginOptions.filter((opt) => opt.enabled)"
          :key="opt.provider"
          :href="buildUrl(opt.provider)"
          class="w-full flex items-center left-section__btn"
        >
          <button
            class="p-2 text-vanilla-100 w-full space-x-2 flex items-center rounded-sm justify-center hover:bg-opacity-90"
            :class="opt.bg"
          >
            <z-icon :icon="opt.icon" />
            <span>Continue with {{ opt.label }}</span>
          </button>
        </a>
      </div>
      <div class="mt-8 text-vanilla-400">
        Don't have an account?
        <nuxt-link to="/signup" class="text-juniper hover:underline">Sign up</nuxt-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZButton, ZIcon } from '@deepsourcelabs/zeal'
// Import State & Types
import AuthMixin from '~/mixins/authMixin'

@Component({
  components: {
    ZButton,
    ZIcon
  },
  middleware: ['redirectToHome'],
  head: {
    title: 'Login — DeepSource'
  }
})
export default class SignUp extends mixins(AuthMixin) {
  async fetch(): Promise<void> {
    await this.fetchAuthUrls()
  }

  async mounted() {
    const { provider } = this.$route.query
    await this.fetchAuthUrls()

    // XXX: Ugly
    switch (provider) {
      case 'github':
        var url = this.authUrls['github']
        break
      case 'bitbucket':
        var url = this.authUrls['github']
        window.location.href = url
        break
      case 'gitlab':
        var url = this.authUrls['github']
        window.location.href = this.authUrls['gitlab']
        break
      default:
        break
    }
  }

  buildUrl(provider: string): string {
    if (provider in this.authUrls) {
      const oldUrl = this.authUrls[provider]
      const url = new URL(oldUrl)
      if (this.nextParam) {
        const redirectURI = url.searchParams.get('redirect_uri')
        url.searchParams.set('redirect_uri', `${redirectURI}${this.nextParam}`)
      }

      return url.toString()
    }
    return ''
  }

  get nextParam(): string {
    return 'next' in this.$route.query ? `?next=${this.$route.query.next}` : ''
  }

  private loginOptions = [
    {
      provider: 'github',
      icon: 'github',
      label: 'GitHub',
      bg: 'bg-ink-200',
      enabled: this.$config.githubEnabled
    },
    {
      provider: 'gitlab',
      icon: 'gitlab',
      label: 'GitLab',
      bg: 'bg-gitlab',
      enabled: this.$config.gitlabEnabled
    },
    {
      provider: 'bitbucket',
      icon: 'bitbucket',
      label: 'Bitbucket',
      bg: 'bg-bitbucket',
      enabled: this.$config.bitbucketEnabled
    }
  ]
}
</script>
