<template>
  <nuxt-link :to="workspaceLink" class="flex items-center w-full gap-2 p-3 hover:bg-ink-300">
    <z-avatar :image="avatar" :fallback-image="getDefaultAvatar(login, false)" :user-name="login" />
    <div class="space-y-1.5">
      <div class="leading-6 flex items-center gap-x-2">
        {{ login }}
        <z-tag v-if="showRoleTag" :bg-color="tagBgColor" spacing="px-2 h-4"
          ><span :class="tagTextColor" class="text-8px font-semibold tracking-wider">{{
            role
          }}</span></z-tag
        >
      </div>
      <div class="flex items-center gap-4">
        <div v-if="numMembersTotal" class="flex items-center gap-1">
          <z-icon icon="users" size="x-small" />
          <span class="text-vanilla-400 text-sm"
            >{{ numMembersTotal }} {{ numMembersTotal === 1 ? 'member' : 'members' }}</span
          >
        </div>
        <div class="flex items-center gap-1">
          <z-icon icon="globe" size="x-small" />
          <span class="text-vanilla-400 text-sm"
            >{{ activeRepositoryCount }} active
            {{ activeRepositoryCount === 1 ? 'respository' : 'repositories' }}</span
          >
        </div>
        <div class="flex items-center gap-1">
          <z-icon :icon="vcsProviderIcon" size="x-small" />
          <span class="text-vanilla-400 text-sm">{{ vcsProviderName }}</span>
        </div>
      </div>
    </div>
  </nuxt-link>
</template>

<script lang="ts">
import { ZAvatar, ZIcon, ZTag } from '@deepsource/zeal'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { getDefaultAvatar } from '~/utils/ui'

/**
 * Card to display account (workspace) details. Works for team and personal accounts
 */
@Component({
  components: {
    ZAvatar,
    ZIcon,
    ZTag
  },
  methods: {
    getDefaultAvatar
  }
})
export default class AccountCard extends Vue {
  @Prop()
  avatar: string

  @Prop({ required: true })
  login: string

  @Prop()
  numMembersTotal: number

  @Prop()
  isViewerPrimaryUser: boolean

  @Prop()
  roleInGroup: string

  @Prop({ required: true })
  activeRepositoryCount: number

  @Prop({ required: true })
  vcsProvider: string

  /**
   * Returns the icon name for the given VCS Provider
   *
   * @param {string} vcsProvider
   * @returns {string}
   */
  get vcsProviderIcon(): string {
    return this.$providerMetaMap[this.vcsProvider.toLowerCase()].icon
  }

  /**
   * Returns the display name for the given VCS Provider
   *
   * @param {string} vcsProvider
   * @returns {string}
   */
  get vcsProviderName(): string {
    return this.$providerMetaMap[this.vcsProvider.toLowerCase()].text
  }

  /**
   * Returns a link to the account page
   *
   * @returns {string}
   */
  get workspaceLink(): string {
    return `/${this.vcsProvider.toLowerCase()}/${this.login}`
  }

  /**
   * The role of the user as either 'ADMIN' or 'OWNER'
   *
   * @returns {'ADMIN' | 'OWNER' | ''}
   */
  get role() {
    if (this.roleInGroup === 'ADMIN') {
      if (this.isViewerPrimaryUser) return 'OWNER'
      return 'ADMIN'
    }
    return ''
  }

  /**
   * Whether to show the role tag. Only to be shown if the role is ADMIN or OWNER
   *
   * @returns {boolean}
   */
  get showRoleTag() {
    return this.role === 'ADMIN' || this.role === 'OWNER'
  }

  /**
   * Background color for the role tag
   *
   * @returns {string}
   */
  get tagBgColor() {
    if (this.role === 'ADMIN') {
      return 'ink-50'
    }
    if (this.role === 'OWNER') {
      return 'robin-400'
    }
    return ''
  }

  /**
   * Text color for the role tag
   *
   * @returns {string}
   */
  get tagTextColor() {
    if (this.role === 'ADMIN') {
      return 'text-vanilla-400'
    }
    if (this.role === 'OWNER') {
      return 'text-ink-400'
    }
    return ''
  }
}
</script>

<style scoped>
.text-8px {
  font-size: 8px;
}
</style>
