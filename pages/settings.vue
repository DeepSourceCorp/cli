<template>
  <main>
    <div id="tabs" class="flex border-b border-slate-400 pb-0 pt-2.5 xl:col-span-2">
      <div class="flex flex-nowrap space-x-5 self-end overflow-auto px-2 md:px-4">
        <template v-for="settings in settingsOptions">
          <nuxt-link :key="settings.name" :to="settings.route">
            <z-tab
              :is-active="$route && $route.path === settings.route"
              border-active-color="juniper"
              class="flex items-center space-x-1"
              :class="settings.isBeta ? 'pb-2.5' : ''"
            >
              <z-icon :icon="settings.icon" />
              <span>
                {{ settings.label }}
              </span>
              <z-tag
                v-if="settings.isBeta"
                :bg-color="
                  $route && $route.path === settings.route ? 'ink-200' : 'ink-200 opacity-50'
                "
                text-size="xxs"
                spacing="px-2 py-1"
                class="font-semibold uppercase leading-none tracking-wider text-current"
              >
                Beta
              </z-tag>
            </z-tab>
          </nuxt-link>
        </template>
      </div>
    </div>
    <nuxt-child />
  </main>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import ActiveUserMixin from '@/mixins/activeUserMixin'
import AccessTokenMixin from '~/mixins/accessTokenMixin'
import { Context } from '@nuxt/types'

/**
 * User settings page
 */
@Component({
  meta: {
    auth: {
      strict: true,
      redirectToLogin: true
    }
  },
  middleware: [
    function ({ redirect, route }: Context): void {
      if (route.name === 'settings') {
        redirect('/settings/account')
      }
    }
  ],
  layout: 'user'
})
export default class UserSettings extends mixins(ActiveUserMixin, AccessTokenMixin) {
  get settingsOptions(): Record<string, unknown>[] {
    return [
      {
        name: 'user-account',
        route: '/settings/account',
        label: 'Account',
        icon: 'tool',
        isBeta: false,
        routeName: 'provider-owner-settings-account'
      },
      {
        name: 'user-token',
        route: '/settings/tokens',
        label: 'Tokens',
        icon: 'coins',
        isBeta: false,
        routeName: 'provider-owner-settings-tokens'
      },
      {
        name: 'user-workspaces',
        route: '/settings/workspaces',
        label: 'Workspaces',
        icon: 'layout',
        isBeta: false,
        routeName: 'provider-owner-settings-workspaces'
      }
    ]
  }

  /**
   * Meta info for user settings page
   * @return {Record<string, string>}
   */
  head(): Record<string, string> {
    return {
      title: this.viewer.fullName
        ? `Settings • ${this.viewer.fullName} • DeepSource`
        : 'Settings • Me • DeepSource',
      description:
        'DeepSource is an automated code review tool that helps developers automatically find and fix issues in their code.'
    }
  }

  /**
   * Fetch hook for settings pages.
   * Fetches tokens and workspaces
   *
   * @returns {Promise<void>}
   */
  async fetch() {
    await this.fetchAccessTokenList({
      currentPage: 0,
      limit: 0,
      refetch: true
    })
  }
}
</script>
