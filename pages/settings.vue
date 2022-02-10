<template>
  <main>
    <div id="tabs" class="flex xl:col-span-2 pt-2.5 pb-0 border-b border-ink-200">
      <div class="flex self-end px-2 space-x-5 overflow-auto md:px-4 flex-nowrap">
        <template v-for="settings in settingsOptions">
          <nuxt-link :key="settings.name" :to="settings.route">
            <z-tab
              :is-active="$route && $route.path === settings.route"
              border-active-color="vanilla-400"
              class="flex items-center space-x-1"
              :class="settings.isBeta ? 'pb-2.5' : ''"
            >
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
                class="font-semibold leading-none tracking-wider text-current uppercase"
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
import { Context } from '@nuxt/types'
import { ZTab, ZTag } from '@deepsourcelabs/zeal'

/**
 * User settings page
 */
@Component({
  components: { ZTab, ZTag },
  meta: {
    auth: {
      strict: true,
      redirectToLogin: true
    }
  },
  middleware: [
    function ({ redirect, route }: Context): void {
      if (route.name === 'settings') {
        redirect(`/settings/tokens`)
      }
    }
  ],
  layout: 'user'
})
export default class UserSettings extends mixins(ActiveUserMixin) {
  get settingsOptions(): Record<string, unknown>[] {
    return [
      {
        name: 'user-token',
        route: '/settings/tokens',
        label: 'Tokens',
        isBeta: true,
        routeName: 'provider-owner-settings-webhooks'
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
        : `Settings • Me • DeepSource`,
      description:
        'DeepSource is an automated code review tool that helps developers automatically find and fix issues in their code.'
    }
  }
}
</script>
