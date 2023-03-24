<template>
  <section class="grid max-w-3xl grid-cols-1 p-4 pb-12 gap-5">
    <div class="flex justify-between text-left">
      <div class="space-y-1">
        <h2 class="font-medium">Account</h2>
        <p class="text-vanilla-400 text-sm">Manage your account settings.</p>
      </div>
    </div>

    <user-profile />

    <div class="divide-y divide-ink-200 rounded-md border border-ink-200 bg-ink-300">
      <div class="flex items-center w-full justify-between p-4">
        <span class="font-medium text-xs uppercase text-vanilla-400 tracking-wider"
          >login connections</span
        >
        <nuxt-link :to="context.installationProvidersUrl">
          <z-icon icon="plus" />
        </nuxt-link>
      </div>

      <div v-if="isLoading" class="bg-ink-300 animate-pulse h-14"></div>

      <template v-else>
        <div
          v-for="(connection, idx) in viewer.socialConnections"
          :key="idx"
          class="flex w-full justify-between items-center p-4"
        >
          <div class="flex items-center gap-2 text-sm">
            <z-icon :icon="providerData(connection.provider).icon" size="base" />
            <span>{{ providerData(connection.provider).name }}</span>
          </div>

          <div class="text-vanilla-400 text-sm">{{ enabledOnDisplay(connection.enabledOn) }}</div>
        </div>
      </template>
    </div>

    <div class="grid grid-cols-2 gap-5">
      <nuxt-link
        to="/settings/workspaces"
        class="border border-ink-200 rounded-md bg-ink-300 hover:bg-ink-200 p-4 space-y-1 group"
      >
        <div class="flex gap-x-2 items-center">
          <z-icon icon="layout" />
          <span class="text-vanilla-100 text-sm">Workspaces</span>
        </div>
        <div class="space-y-6 pl-6">
          <div class="text-vanilla-400 text-sm">Manage your workspaces</div>

          <div
            v-if="isLoading"
            class="animate-pulse bg-ink-400 rounded-full h-7 w-26 py-1 px-4"
          ></div>
          <z-tag
            v-else
            bg-color="ink-400 group-hover:bg-ink-300"
            class="border border-ink-200 group-hover:border-ink-100"
            ><span class="text-xs">{{ workspaceCountString }}</span></z-tag
          >
        </div>
      </nuxt-link>

      <nuxt-link
        to="/settings/tokens"
        class="border border-ink-200 rounded-md bg-ink-300 hover:bg-ink-200 p-4 space-y-1 group"
      >
        <div class="flex gap-x-2 items-center">
          <z-icon icon="coins" />
          <span class="text-vanilla-100 text-sm">Tokens</span>
        </div>
        <div class="space-y-6 pl-6">
          <div class="text-vanilla-400 text-sm">Manage your personal access tokens</div>
          <z-tag
            bg-color="ink-400 group-hover:bg-ink-300"
            class="border border-ink-200 group-hover:border-ink-100"
            ><span class="text-xs">{{ tokenCountString }}</span></z-tag
          >
        </div>
      </nuxt-link>
    </div>

    <delete-user v-if="!$config.onPrem" />
  </section>
</template>
<script lang="ts">
import { ZButton, ZIcon, ZTag } from '@deepsource/zeal'
import { Component, mixins } from 'nuxt-property-decorator'

import { fromNow } from '@/utils/date'

import DeleteUser from '~/components/Settings/DeleteUser.vue'
import UserProfile from '~/components/Settings/UserProfile.vue'

import AccessTokenMixin from '~/mixins/accessTokenMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import ContextMixin from '~/mixins/contextMixin'

/**
 * Account settings page
 */
@Component({
  components: {
    UserProfile,
    DeleteUser,
    ZIcon,
    ZTag,
    ZButton
  },
  meta: {
    auth: {
      strict: true,
      redirectToLogin: true
    }
  },
  layout: 'user'
})
export default class PersonalAccessTokenPage extends mixins(
  ActiveUserMixin,
  AccessTokenMixin,
  ContextMixin
) {
  isLoading = false
  timeoutId: ReturnType<typeof setTimeout>

  /**
   * Fetch the user account related information
   * Prevent showing skeleton loaders if hitting the cache
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    try {
      await Promise.all([
        this.fetchAccountInfo({ login: '', isViewerPrimaryUser: true }),
        this.fetchContext()
      ])
    } catch (e) {
      this.$logErrorAndToast(e as Error, 'Unable to fetch user data. Please contact support.')
    } finally {
      this.isLoading = false
    }
  }

  /**
   * The created hook
   * Prevent showing skeleton loaders if hitting the cache
   *
   * @returns {void}
   */
  created(): void {
    this.timeoutId = setTimeout(() => {
      if (this.$fetchState.pending) {
        this.isLoading = true
      }
    }, 300)
  }

  /**
   * Before destroy hook to clear timeout.
   */
  beforeDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
  }

  get tokenCountString() {
    return `${this.totalUserAccessTokens} Active token${
      this.totalUserAccessTokens === 1 ? '' : 's'
    }`
  }

  get workspaceCountString() {
    const workspaceCount =
      (this.viewer.teamAccounts?.totalCount ?? 0) + (this.viewer.personalAccounts?.totalCount ?? 0)
    return `${workspaceCount} Workspace${workspaceCount === 1 ? '' : 's'}`
  }

  /**
   * Returns the provider display name and icon name for the given provider
   *
   * @param {string} vcsName - Provider name
   * @returns {Record<string, string>}
   */
  providerData(vcsName: string): Record<string, string> {
    return {
      name: this.$providerMetaMap[vcsName].text,
      icon: this.$providerMetaMap[vcsName].icon
    }
  }

  /**
   * Display string for login connection `enabledOn`
   *
   * @param timeStamp - Raw timestamp string
   * @returns {string}
   */
  enabledOnDisplay(timeStamp: string): string {
    return `Connected ${fromNow(timeStamp)}`
  }
}
</script>
