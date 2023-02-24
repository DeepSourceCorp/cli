<template>
  <li class="flex items-start gap-x-2.5" @click="$emit('click')">
    <z-avatar
      :image="avatar"
      :user-name="fullName"
      :fallback-image="getDefaultAvatar(email)"
      type="span"
      class="mt-4 flex-shrink-0"
    />

    <div
      :class="{ 'border-b border-b-ink-300': !isLastListItem }"
      class="flex flex-col flex-grow gap-y-0.5 py-4"
    >
      <div class="flex justify-between">
        <p class="text-vanilla-100 font-medium text-sm leading-6">
          {{ fullName || email }}
        </p>

        <template v-if="showRoleOptions">
          <div
            v-if="isPrimaryUser && !isRepo && !showOwnerMenu"
            class="text-xs font-medium tracking-wider uppercase text-vanilla-400 leading-6"
          >
            Owner
          </div>

          <z-menu v-else :width="isPrimaryUser && !isRepo ? 'small' : 'large'" direction="left">
            <template #trigger="{ toggle, isOpen }">
              <button
                type="button"
                data-testid="show-role-menu"
                class="flex items-center gap-x-2 leading-6"
                @click="toggle"
              >
                <span
                  class="text-xs font-medium tracking-wider uppercase"
                  :class="isOpen ? 'text-vanilla-100' : 'text-vanilla-400'"
                >
                  {{ isPrimaryUser && !isRepo && showOwnerMenu ? 'Owner' : roles[role].title }}
                </span>
                <z-icon
                  size="x-small"
                  icon="chevron-down"
                  :class="{
                    'rotate-180': isOpen
                  }"
                  class="transform duration-150"
                />
              </button>
            </template>
            <template #body>
              <z-menu-item
                v-if="isPrimaryUser && !isRepo && showOwnerMenu"
                data-testid="transfer-ownership"
                class="text-sm"
                @click="transferOwnership"
              >
                <div class="inline-flex items-center w-full">
                  <z-icon icon="users" class="mr-1" />
                  Transfer ownership
                </div>
              </z-menu-item>

              <template v-else>
                <z-menu-section class="text-left">
                  <z-menu-item v-for="(opt, key) in roles" :key="key" class="text-sm">
                    <div :data-testid="`${key}-button`" @click="updateRole(key)">
                      <div class="flex items-center space-x-2">
                        <span :class="key === role ? 'font-semibold' : ''">{{ opt.title }}</span>
                        <z-icon v-if="key === role" size="small" icon="check" color="vanilla-100" />
                      </div>
                      <p class="mt-1 text-xs leading-snug text-vanilla-400">
                        {{ opt.description }}
                      </p>
                    </div>
                  </z-menu-item>
                </z-menu-section>
                <z-menu-section :divider="false">
                  <z-menu-item
                    icon="alert-triangle"
                    data-testid="remove-team-member"
                    class="text-cherry"
                    @click="removeMember"
                    >Remove from {{ isRepo ? 'repository' : 'team' }}</z-menu-item
                  >
                </z-menu-section>
              </template>
            </template>
          </z-menu>
        </template>

        <div v-else class="text-xs font-medium tracking-wider uppercase text-vanilla-400 leading-6">
          {{ isPrimaryUser ? 'Owner' : roles[role].title }}
        </div>
      </div>

      <div class="flex flex-wrap gap-x-5 gap-y-1 text-xs text-vanilla-400">
        <div v-if="email" class="inline-flex items-center gap-x-1">
          <z-icon icon="mail" size="x-small" /> {{ email }}
        </div>

        <div v-if="isPermFromVcs" class="inline-flex items-center gap-x-1">
          <z-icon :icon="providerMeta.icon" size="x-small" /> Synced from {{ providerMeta.text }}
        </div>

        <div v-else class="inline-flex items-center gap-x-1">
          <z-icon icon="logo" size="x-small" /> Added on DeepSource
        </div>

        <!-- Every child element needs to be spaced out by 20px, except the last element, which needs to be right aligned.
        Hence, the ml-auto. -->
        <span v-if="!isRepo && joining" class="sm:ml-auto">since {{ joining }}</span>
      </div>
    </div>
  </li>
</template>
<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZMenu, ZMenuItem, ZMenuSection, ZAvatar } from '@deepsource/zeal'
import { formatDate } from '@/utils/date'
import TEAM_PERMS from '~/utils/teamPerms'

import { RepositoryCollaboratorPermission, TeamMemberRoleChoices, User } from '~/types/types'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'

import { getDefaultAvatar } from '~/utils/ui'
import { ProviderMeta } from '~/plugins/helpers/provider'

const REPO_PERMS = {
  ADMIN: {
    title: 'Admin',
    value: 'ADMIN',
    description:
      'Members will have full access to all repository settings, including the ability to add or remove members from the repository.'
  },
  WRITE: {
    title: 'Write',
    value: 'WRITE',
    description:
      'Members will have full access to all repositories which they have access to, except the ability to add or remove members, and deactivating or activating analysis on them.'
  },
  READ: {
    title: 'Read-only',
    value: 'READ',
    description: `Members will be able to only view the issues and metrics on private repositories they have access to, but won't be able to take any actions on issues or create Autofixes.`
  }
}

@Component({
  components: { ZIcon, ZMenu, ZMenuItem, ZMenuSection, ZAvatar },
  methods: { getDefaultAvatar }
})
export default class MemberListItem extends mixins(OwnerDetailMixin) {
  @Prop({ required: true })
  role: RepositoryCollaboratorPermission | TeamMemberRoleChoices

  @Prop({ required: true })
  id: User['id']

  @Prop()
  dateJoined: User['dateJoined']

  @Prop()
  avatar: User['avatar']

  @Prop()
  email: User['email']

  @Prop()
  fullName: User['fullName']

  @Prop({ default: false })
  isRepo: boolean

  @Prop({ default: false })
  isPrimaryUser: boolean

  @Prop({ default: true })
  showRoleOptions: boolean

  @Prop({ default: true })
  clickable: boolean

  @Prop({ default: false })
  allowTransfer: boolean

  @Prop({ default: false })
  isPermFromVcs: boolean

  @Prop({ default: false })
  isLastListItem: boolean

  @Prop()
  teamAvatarUrl: string

  @Prop()
  login: string

  @Prop()
  accountType: string

  @Prop()
  vcsProvider: string

  get roles(): Record<string, Record<string, string>> {
    if (this.isRepo) {
      return REPO_PERMS
    }
    return TEAM_PERMS
  }

  get showOwnerMenu(): boolean {
    return Boolean(this.allowTransfer && this.owner?.isViewerPrimaryUser)
  }

  get providerMeta(): ProviderMeta {
    return this.$providerMetaMap[this.vcsProvider]
  }

  get joining(): string {
    return formatDate(this.dateJoined)
  }

  updateRole(newRole: string): void {
    this.$emit('updateRole', {
      id: this.id,
      email: this.email,
      fullName: this.fullName,
      role: this.role,
      newRole
    })
  }

  removeMember(): void {
    this.$emit('removeMember', {
      id: this.id,
      email: this.email,
      fullName: this.fullName
    })
  }

  transferOwnership(): void {
    this.$emit('transferOwnership', {
      id: this.id,
      email: this.email,
      fullName: this.fullName
    })
  }
}
</script>
