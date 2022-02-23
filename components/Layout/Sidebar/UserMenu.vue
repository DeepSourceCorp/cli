<template>
  <z-menu placement="top">
    <template v-slot:trigger="{ toggle }">
      <button
        type="button"
        class="flex items-center max-w-3xs py-1 space-x-2 text-sm rounded-sm outline-none hover:bg-ink-300 focus:outline-none"
        :class="{
          'pr-2 pl-1': !isCollapsed,
          'px-1': isCollapsed
        }"
        ref="username"
        @click="toggle"
      >
        <z-avatar
          :image="viewer.avatar"
          :userName="viewer.fullName || viewer.email"
          size="sm"
          class="flex-shrink-0 leading-none rounded-full"
        />
        <span
          v-show="!isCollapsed"
          v-tooltip="{
            content: showTooltip ? `${viewer.fullName || viewer.email}` : '',
            delay: { show: 200, hide: 100 }
          }"
          class="leading-none overflow-ellipsis overflow-hidden whitespace-nowrap"
        >
          {{ viewer.fullName || viewer.email }}
        </span>
      </button>
    </template>
    <template v-if="viewer" slot="body" class="z-10">
      <z-menu-section title="Logged In As">
        <z-menu-item>{{ viewer.email }}</z-menu-item>
      </z-menu-section>
      <z-menu-section :divider="false">
        <z-menu-item icon="settings" as="nuxt-link" to="/settings">Settings</z-menu-item>
        <z-menu-item icon="dashboard" as="nuxt-link" to="/me">Dashboard</z-menu-item>
        <z-menu-item icon="log-out" @click="() => signOut()">Sign out</z-menu-item>
      </z-menu-section>
    </template>
  </z-menu>
</template>

<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import { ZAvatar, ZMenu, ZMenuItem, ZMenuSection } from '@deepsourcelabs/zeal'

// mixins
import ActiveUserMixin from '~/mixins/activeUserMixin'
import AuthMixin from '~/mixins/authMixin'

@Component({
  components: {
    ZAvatar,
    ZMenuItem,
    ZMenu,
    ZMenuSection
  }
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

    this.showTooltip = username.scrollWidth >= username.clientWidth
  }

  public async signOut(): Promise<void> {
    await this.logOutUser({ onPrem: this.$config.onPrem })
    this.$router.push('/login')
  }
}
</script>
