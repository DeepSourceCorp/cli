<template>
  <z-menu placement="top">
    <template v-slot:trigger="{ toggle }">
      <button
        type="button"
        class="flex items-center py-1 space-x-2 text-sm rounded-sm outline-none hover:bg-ink-300 focus:outline-none"
        :class="{
          'pr-2 pl-1': !isCollapsed,
          'px-1': isCollapsed
        }"
        @click="toggle"
      >
        <z-avatar
          :image="viewer.avatar"
          :userName="viewer.fullName || viewer.email"
          size="sm"
          class="flex-shrink-0 leading-none rounded-full"
        />
        <span v-show="!isCollapsed" class="leading-none">{{
          viewer.fullName || viewer.email
        }}</span>
      </button>
    </template>
    <template v-if="viewer" slot="body" class="z-10">
      <z-menu-section title="Logged In As" class="py-1">
        <z-menu-item>{{ viewer.email }}</z-menu-item>
      </z-menu-section>
      <z-menu-section :divider="false">
        <z-menu-item @click="() => switchToLegacy()">Switch to DeepSource Retro</z-menu-item>
        <z-menu-item
          as="a"
          href="https://deepsource.io/discord"
          target="_blank"
          rel="noopener noreferrer"
          >Join Discord</z-menu-item
        >
        <z-menu-item @click="() => this.$router.push('/me')">Dashboard</z-menu-item>
        <z-menu-item @click="() => signOut()">Sign out</z-menu-item>
      </z-menu-section>
    </template>
  </z-menu>
</template>

<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import { ZAvatar, ZMenu, ZMenuItem, ZMenuSection } from '@deepsourcelabs/zeal'
import SwitchAccountMutation from '~/apollo/mutations/auth/switchAccount.gql'

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

  async switchToLegacy() {
    try {
      await this.$applyGraphqlMutation(SwitchAccountMutation, { input: {} })
      this.$nuxt.$cookies.remove('bifrost')
      window.location.href = '/dashboard/'
    } catch (e) {}
  }

  public async signOut(): Promise<void> {
    await this.logOutUser()
    this.$router.push('/login')

    // Unset distinct IDs post logout
    if (!this.$config.onPrem) {
      this.$posthog.reset()
    }
  }
}
</script>
