<template>
  <hero-card>
    <h1 class="text-center text-2xl font-bold leading-snug text-vanilla-100">
      Choose a GitLab account
    </h1>
    <p class="mt-4 text-center text-base text-vanilla-400">
      You would be able to use DeepSource on all repositories that you have access to.
    </p>
    <div class="mt-10 flex flex-col items-center space-y-4">
      <button
        v-for="account in viewer.gitlabAccounts"
        :key="account.login"
        :disabled="loading"
        class="group mt-2 flex w-full items-center space-x-2 rounded-md px-3 py-2 text-vanilla-100"
        :class="account.installed ? 'cursor bg-ink-200' : 'bg-ink-200 hover:bg-ink-300'"
        @click="selectAccount(account)"
      >
        <z-avatar
          v-if="account.avatar_url"
          :image="account.avatar_url"
          :fallback-image="getDefaultAvatar(account.login, !account.is_team)"
          :user-name="account.login"
          class="flex-shrink-0"
        />
        <div class="flex-grow overflow-hidden overflow-ellipsis text-left">
          <div>{{ account.login }}</div>
          <p class="text-xs text-vanilla-400">
            {{ account.is_team ? 'Team Account' : 'Personal Account' }}
          </p>
        </div>
        <z-icon v-if="account.installed" icon="check-circle" size="medium" color="juniper" />
        <z-icon
          v-if="loadingAccount === account.login"
          icon="spin-loader"
          size="medium"
          color="juniper"
          class="animate-spin"
        />
        <z-icon
          v-else
          icon="chevron-right"
          size="medium"
          class="flex-shrink-0 transform duration-100 ease-linear group-hover:translate-x-1"
        />
      </button>
    </div>
    <p class="mt-4 text-sm text-vanilla-400">
      Need help? Write to us at
      <a
        :href="`mailto:${$config.supportEmail}`"
        class="cursor-pointer text-juniper hover:underline"
        >{{ $config.supportEmail }}</a
      >
    </p>
  </hero-card>
</template>

<script lang="ts">
import { ZAvatar, ZButton, ZIcon } from '@deepsource/zeal'
import { Component, mixins } from 'nuxt-property-decorator'

import ActiveUserMixin from '~/mixins/activeUserMixin'
import { getDefaultAvatar } from '~/utils/ui'

import GitlabMutation from '@/apollo/mutations/installation/gitlabInstallationLanding.gql'

@Component({
  components: {
    ZButton,
    ZAvatar,
    ZIcon
  },
  meta: {
    auth: {
      strict: true,
      redirectToLogin: true
    }
  },
  methods: { getDefaultAvatar }
})
export default class InstallationProvider extends mixins(ActiveUserMixin) {
  loading = false
  loadingAccount = ''

  timerId: ReturnType<typeof setTimeout>

  async fetch(): Promise<void> {
    try {
      await this.fetchActiveUser()
      await this.fetchActiveUserGitlabAccounts()
    } catch (e) {
      this.$logErrorAndToast(
        e as Error,
        'Unable to fetch GitLab accounts, please contact support.',
        this.viewer
      )
    }
  }

  beforeDestroy() {
    clearTimeout(this.timerId)
  }

  async selectAccount({ login, installed }: { login: string; installed: boolean }): Promise<void> {
    if (installed) {
      this.$router.push(['', 'gl', login].join('/'))
      return
    }

    this.loading = true
    this.loadingAccount = login
    try {
      await this.$applyGraphqlMutation(GitlabMutation, { input: { login } })
      this.$toast.success(`Successfully connected ${login} with DeepSource.`)

      this.timerId = setTimeout(() => {
        this.$router.push(['', 'onboard', 'gl', login, 'repositories'].join('/'))
      }, 300)
    } catch (e) {
      this.$toast.danger('Something went wrong while connecting your account')
    } finally {
      this.loading = false
      this.loadingAccount = ''
    }
  }
}
</script>
