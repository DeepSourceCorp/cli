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
      :class="{ 'border-b border-b-ink-300': !hideBorder }"
      class="flex flex-grow flex-col gap-y-0.5 py-4"
    >
      <div class="flex justify-between">
        <p class="text-sm font-medium leading-6 text-vanilla-100">
          {{ fullName || email }}
        </p>

        <template v-if="showRoleOptions">
          <div
            v-if="isPrimaryUser && !isRepo && !showOwnerMenu"
            class="text-xxs font-medium uppercase leading-6 tracking-wide text-vanilla-400"
          >
            Owner
          </div>

          <z-menu v-else :width="isPrimaryUser && !isRepo ? 'small' : 'large'" direction="left">
            <template #trigger="{ toggle, isOpen }">
              <button
                type="button"
                data-testid="show-role-menu"
                class="flex items-center gap-x-1 leading-6"
                @click="toggle"
              >
                <span
                  class="text-xxs font-medium uppercase leading-6 tracking-wide"
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
                as="button"
                spacing="px-2.5 py-3.5"
                data-testid="transfer-ownership"
                class="w-full text-xs leading-none"
                @click="transferOwnership"
              >
                <div class="inline-flex w-full items-center gap-x-2">
                  <z-icon icon="users" color="current" size="x-small" />
                  <span>Transfer ownership</span>
                </div>
              </z-menu-item>

              <template v-else>
                <z-menu-section :divider="false" class="text-left text-xs text-vanilla-400">
                  <z-menu-item
                    v-for="(opt, key) in roles"
                    :key="key"
                    as="button"
                    spacing="px-2.5 py-3 first:pt-3.5 last:pb-3.5"
                    :data-testid="`${key}-button`"
                    class="w-full text-left text-xs"
                    @click="updateRole(key)"
                  >
                    <div class="flex gap-x-2">
                      <z-icon
                        v-if="key === role"
                        size="x-small"
                        icon="check"
                        color="vanilla-100"
                        class="mt-3px flex-shrink-0"
                      />
                      <div v-else class="h-3 w-3 flex-shrink-0"></div>
                      <div class="flex-grow space-y-1">
                        <div
                          class="text-xxs font-medium uppercase leading-5 tracking-wide"
                          :class="{ 'text-vanilla-100': key === role }"
                        >
                          {{ opt.title }}
                        </div>
                        <p class="text-xs leading-normal text-vanilla-400">
                          {{ opt.description }}
                        </p>
                      </div>
                    </div>
                  </z-menu-item>
                </z-menu-section>
                <hr class="w-full border-ink-100" />
                <z-menu-section :divider="false">
                  <z-menu-item
                    as="button"
                    spacing="px-2.5 py-3.5"
                    data-testid="remove-team-member"
                    class="w-full text-xs leading-none text-cherry"
                    @click="removeMember"
                  >
                    <z-icon
                      size="x-small"
                      icon="alert-circle"
                      color="current"
                      class="flex-shrink-0"
                    />
                    <span>Remove from {{ isRepo ? 'repository' : 'team' }}</span>
                  </z-menu-item>
                </z-menu-section>
              </template>
            </template>
          </z-menu>
        </template>

        <div v-else class="text-xxs font-medium uppercase leading-6 tracking-wide text-vanilla-400">
          {{ isPrimaryUser ? 'Owner' : roles[role].title }}
        </div>
      </div>

      <div
        class="flex flex-col flex-wrap gap-x-5 gap-y-1 text-xs leading-5 text-vanilla-400 sm:flex-row"
      >
        <div
          v-if="email"
          class="inline-flex items-center gap-x-1 lg:w-full lg:max-w-3xs lg:flex-grow"
        >
          <z-icon icon="mail" size="x-small" class="flex-shrink-0" />
          <span class="lg:truncate">{{ email }}</span>
        </div>

        <div v-if="isPermFromVcs" class="inline-flex items-center gap-x-1">
          <z-icon :icon="providerMeta.icon" size="x-small" class="flex-shrink-0" /> Synced from
          {{ providerMeta.text }}
        </div>

        <div v-else class="inline-flex items-center gap-x-1">
          <z-icon icon="logo" size="x-small" class="flex-shrink-0" /> Added on DeepSource
        </div>

        <!-- Every child element needs to be spaced out by 20px, except the last element, which needs to be right aligned.
        Hence, the ml-auto. -->
        <span v-if="!isRepo && joining" class="inline-flex items-center gap-x-1 sm:ml-auto">
          <z-icon icon="calendar" size="x-small" class="flex-shrink-0 sm:hidden sm:lowercase" />
          Since {{ joining }}
        </span>
      </div>
    </div>
  </li>
</template>
<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
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
    description:
      "Members will be able to only view the issues and metrics on private repositories they have access to, but won't be able to take any actions on issues or create Autofixes."
  }
}

@Component({
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
  hideBorder: boolean

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
