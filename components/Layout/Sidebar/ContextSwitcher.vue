<template>
  <z-menu v-if="viewer.dashboardContext">
    <template slot="trigger">
      <span
        class="flex items-center space-x-1 text-vanilla-200 p-1 text-sm rounded-sm hover:bg-ink-200 transition-all duration-75"
      >
        <z-avatar
          type="span"
          size="sm"
          class="flex-shrink-0"
          :image="activeDashboardContext.avatar_url"
          :user-name="activeDashboardContext.login"
        ></z-avatar>
        <span v-show="!isCollapsed">
          {{ activeDashboardContext.team_name || activeDashboardContext.login }}
        </span>
        <z-icon icon="chevron-down" size="small" color="vanilla-200" v-show="!isCollapsed"></z-icon>
      </span>
    </template>
    <template slot="body">
      <z-menu-section
        title="Select dashboard view"
        class="max-h-64 overflow-y-scroll hide-scroll"
        :divider="true"
      >
        <z-menu-item v-for="context in viewer.dashboardContext" :key="context.id">
          <nuxt-link
            :to="`/${context.vcs_provider}/${context.login}`"
            class="flex space-x-2 items-center w-full"
          >
            <z-avatar type="span" :image="context.avatar_url" :user-name="context.login"></z-avatar>
            <div class="flex-col flex-1">
              <span class="text-sm font-medium text-vanilla-200">{{
                context.team_name || context.login
              }}</span>
              <p class="mt-1 text-xs text-vanilla-400">
                {{ context.vcs_provider_display }}
                {{ context.type === 'user' ? 'Account' : 'Organization' }}
              </p>
            </div>
            <div class="pr-2">
              <z-icon
                icon="star"
                size="small"
                :color="context.is_default ? 'juniper' : slate"
                class="min-w-4 min-h-4"
                @click.stop.prevent="updateDefaultContext(context)"
                :class="{
                  'fill-current': context.is_default
                }"
              ></z-icon>
            </div>
          </nuxt-link>
        </z-menu-item>
      </z-menu-section>
      <z-menu-section :divider="false">
        <z-menu-item icon="plus"
          ><nuxt-link :to="context.installationProvidersUrl"
            >Add new account</nuxt-link
          ></z-menu-item
        >
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
