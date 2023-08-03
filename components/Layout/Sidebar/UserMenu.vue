<template>
  <z-menu placement="top">
    <template #trigger="{ toggle }">
      <button
        ref="username"
        type="button"
        class="flex max-w-3xs items-center space-x-2 rounded-sm py-1 text-sm outline-none hover:bg-ink-300 focus:outline-none"
        :class="{
          'pl-1 pr-2': !isCollapsed,
          'px-1': isCollapsed
        }"
        @click="toggle"
      >
        <z-avatar
          :image="viewer.avatar"
          :fallback-image="getDefaultAvatar(viewer.email)"
          :user-name="viewer.fullName || viewer.email"
          size="sm"
          class="flex-shrink-0 rounded-full leading-none"
        />
        <span
          v-show="!isCollapsed"
          v-tooltip="{
            content: showTooltip ? `${viewer.fullName || viewer.email}` : '',
            delay: { show: 200, hide: 100 }
          }"
          class="overflow-hidden overflow-ellipsis whitespace-nowrap leading-none"
        >
          {{ viewer.fullName || viewer.email }}
        </span>
      </button>
    </template>

    <template v-if="viewer" #body>
      <z-menu-section title="Logged In As">
        <z-menu-item>{{ viewer.email }}</z-menu-item>
      </z-menu-section>
      <z-menu-section :divider="false">
        <z-menu-item icon="settings" as="nuxt-link" to="/settings">Settings</z-menu-item>
        <z-menu-item icon="dashboard" as="nuxt-link" to="/me">Dashboard</z-menu-item>
        <z-menu-item icon="log-out" as="button" class="w-full" @click="() => signOut()"
          >Sign out</z-menu-item
        >
      </z-menu-section>
    </template>
  </z-menu>
</template>

<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'

// mixins
import ActiveUserMixin from '~/mixins/activeUserMixin'
import AuthMixin from '~/mixins/authMixin'

import { getDefaultAvatar } from '~/utils/ui'

@Component({
  methods: { getDefaultAvatar }
})
export default class UserMenu extends mixins(ActiveUserMixin, AuthMixin) {
  @Prop()
  isCollapsed: boolean

  showTooltip = false

  /**
   * Mounted hook for Vue component
   *
   * @returns {void}
   */
  mounted(): void {
    const username = this.$refs.username as Element
    if (username) {
      this.showTooltip = username.scrollWidth >= username.clientWidth
    }
  }
}
</script>
