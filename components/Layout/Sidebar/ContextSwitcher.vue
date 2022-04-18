<template>
  <z-menu v-if="viewer.dashboardContext" class="w-full">
    <template v-slot:trigger="{ toggle }">
      <button
        type="button"
        class="flex items-center w-full space-x-2 text-sm transition-all duration-75 rounded-sm outline-none text-vanilla-200 focus:outline-none p-1"
        :class="isCollapsed ? 'hover:opacity-75 px-0' : 'hover:bg-ink-200'"
        @click="toggle"
      >
        <z-avatar
          v-if="activeDashboardContext.avatar_url"
          size="sm"
          :image="activeDashboardContext.avatar_url"
          :user-name="activeDashboardContext.login"
          class="flex-shrink-0"
          stroke="bg-ink-100 p-1"
        ></z-avatar>
        <span v-show="!isCollapsed">{{
          activeDashboardContext.team_name || activeDashboardContext.login
        }}</span>
      </button>
    </template>
    <template v-slot:body="{ close }">
      <z-menu-section
        title="Select dashboard view"
        class="overflow-y-scroll hide-scroll"
        :divider="true"
      >
        <z-menu-item
          v-for="context in viewer.dashboardContext"
          as="nuxt-link"
          :key="context.id"
          :to="`/${context.vcs_provider}/${context.login}`"
          class="flex items-center w-full space-x-1"
          @click.native="close"
        >
          <z-avatar type="span" :image="context.avatar_url" :user-name="context.login"></z-avatar>
          <div class="flex-col flex-1">
            <span class="text-sm font-medium text-vanilla-200">{{
              context.team_name || context.login
            }}</span>
            <p class="mt-1 text-xs text-vanilla-400">
              {{ context.vcs_provider_display }}
              {{ context.type === 'user' ? 'Account' : 'Team' }}
            </p>
          </div>
          <div class="pr-2">
            <z-icon
              icon="star"
              size="small"
              :color="context.is_default ? 'juniper' : 'slate'"
              class="min-w-4 min-h-4"
              @click.stop.prevent="updateDefaultContext(context)"
              :class="{
                'fill-current': context.is_default
              }"
            ></z-icon>
          </div>
        </z-menu-item>
      </z-menu-section>
      <z-menu-section :divider="false">
        <z-menu-item :to="context.installationProvidersUrl" icon="plus" as="nuxt-link">
          Add new account
        </z-menu-item>
      </z-menu-section>
    </template>
  </z-menu>
</template>
<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import { ZAvatar, ZIcon, ZMenu, ZMenuItem, ZMenuSection } from '@deepsourcelabs/zeal'

// types
import ActiveUserMixin from '~/mixins/activeUserMixin'
import ContextMixin from '~/mixins/contextMixin'

@Component({
  components: {
    ZAvatar,
    ZIcon,
    ZMenu,
    ZMenuItem,
    ZMenuSection
  }
})
export default class ContextSwitcher extends mixins(ActiveUserMixin, ContextMixin) {
  @Prop()
  isCollapsed: boolean

  async fetch(): Promise<void> {
    await this.fetchContext()
  }

  public async updateDefaultContext(context: Record<string, string>): Promise<void> {
    if (!context.is_default) {
      await this.updateDefaultContextAPI({
        contextOwnerId: context.id
      })
      await this.refetchUser()
    }
  }
}
</script>
