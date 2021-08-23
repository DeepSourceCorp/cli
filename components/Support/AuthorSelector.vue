<template>
  <z-menu ref="authorSelector">
    <template slot="trigger">
      <span
        class="
          bg-ink-300
          flex
          items-center
          space-x-1
          text-vanilla-200
          px-4
          py-2
          text-sm
          rounded-sm
          hover:bg-ink-200
          transition-all
          duration-75
        "
      >
        <z-avatar
          type="span"
          size="sm"
          class="flex-shrink-0 mr-1"
          :image="selectedContext.avatar_url"
          :user-name="selectedContext.login"
        ></z-avatar>
        <span class="leading-none text-left min-w-44">
          {{ selectedContext.team_name || selectedContext.login }}
        </span>
        <z-icon icon="chevron-down" size="small" color="vanilla-200"></z-icon>
      </span>
    </template>
    <template slot="body">
      <z-menu-section
        title="Select an account"
        class="max-h-64 overflow-y-scroll hide-scroll"
        :divider="false"
      >
        <z-button
          v-for="context in selectionContexts"
          :key="context.id"
          button-type="ghost"
          :full-width="true"
          class="h-full"
          @click="selectionChanged(context)"
        >
          <span class="flex space-x-2 items-center w-full leading-none text-left">
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
          </span>
        </z-button>
      </z-menu-section>
    </template>
  </z-menu>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon, ZButton, ZMenu, ZMenuSection, ZAvatar } from '@deepsourcelabs/zeal'
import { DashboardContext } from '~/mixins/activeUserMixin'

interface AuthorSelectorInterface extends Vue {
  close(): () => void
}

@Component({ components: { ZIcon, ZButton, ZMenu, ZMenuSection, ZAvatar } })
export default class AuthorSelector extends Vue {
  @Prop()
  selectedContext: DashboardContext | Record<string, string>

  @Prop()
  selectionContexts: []

  selectionChanged(selectedContext: DashboardContext): void {
    this.$emit('change', selectedContext)
    ;(this.$refs['authorSelector'] as AuthorSelectorInterface).close()
  }
}
</script>
