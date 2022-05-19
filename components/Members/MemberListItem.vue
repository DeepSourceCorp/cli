<template>
  <li
    class="flex items-center md:grid grid-cols-2 md:grid-cols-5 py-2 space-x-6 space-y-0.5 text-sm"
    @click="$emit('click')"
  >
    <div class="h-full flex flex-row align-bottom space-x-2.5 md:col-span-2">
      <div>
        <z-avatar :image="avatar" :user-name="fullName" :fallback-image="context.emptyAvatarUrl" />
      </div>
      <div
        class="flex flex-col justify-center text-sm sm:text-base w-3/4 space-y-1.5 leading-none text-vanilla-100"
      >
        <div class="font-medium">{{ fullName || email }}</div>

        <div v-if="fullName" class="inline-flex items-end">
          <span class="text-xs leading-none sm:text-sm text-vanilla-400">{{ email }}</span>
        </div>

        <div class="inline-flex items-center md:hidden w-max">
          <z-icon icon="calendar" size="x-small" class="mr-1" />
          <span class="text-xs leading-none sm:text-sm text-vanilla-400">Joined {{ joining }}</span>
        </div>
      </div>
    </div>
    <div class="flex flex-row h-full align-bottom md:col-span-2">
      <div class="items-center hidden md:inline-flex">
        <z-icon icon="calendar" size="x-small" class="mr-1" />
        <span class="text-xs leading-none sm:text-sm text-vanilla-400">Joined {{ joining }}</span>
      </div>
    </div>
    <div v-if="showRoleOptions" class="flex items-center justify-end flex-grow">
      <div class="text-right">
        <div
          v-if="isPrimaryUser && !isRepo && !showOwnerMenu"
          class="text-vanilla-100 text-xs font-semibold tracking-wider uppercase"
        >
          Owner
        </div>
        <z-menu v-else :width="isPrimaryUser && !isRepo ? 'small' : 'large'" direction="left">
          <template v-slot:trigger="{ toggle }">
            <button
              type="button"
              data-testid="show-role-menu"
              class="flex items-center justify-end w-full space-x-2 outline-none focus:outline-none"
              @click="toggle"
            >
              <span class="text-xs font-semibold tracking-wider uppercase">
                {{ isPrimaryUser && !isRepo && showOwnerMenu ? 'Owner' : roles[role].title }}
              </span>
              <z-icon size="small" icon="chevron-down"></z-icon>
            </button>
          </template>
          <template v-if="isPrimaryUser && !isRepo && showOwnerMenu" slot="body">
            <z-menu-item
              class="text-sm"
              @click="transferOwnership"
              data-testid="transfer-ownership"
            >
              <div class="inline-flex items-center w-full">
                <z-icon icon="users" size="small" class="mr-1" />
                Transfer ownership
              </div>
            </z-menu-item>
          </template>
          <template v-else slot="body">
            <z-menu-section class="text-left">
              <z-menu-item v-for="(opt, key) in roles" :key="key" class="text-sm">
                <div :data-testid="`${key}-button`" @click="updateRole(key)">
                  <div class="flex items-center space-x-2">
                    <span :class="key === role ? 'font-semibold' : ''">{{ opt.title }}</span>
                    <z-icon
                      v-if="key === role"
                      size="small"
                      icon="check"
                      color="vanilla-100"
                    ></z-icon>
                  </div>
                  <p class="mt-1 text-xs leading-snug text-vanilla-400">{{ opt.description }}</p>
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
        </z-menu>
      </div>
    </div>
    <div v-else class="flex items-center justify-end flex-grow">
      <div class="text-right">
        <div class="text-vanilla-200">{{ isPrimaryUser ? 'Owner' : roles[role].title }}</div>
        <div class="inline-flex text-xs text-vanilla-400">
          <z-icon icon="calendar" />since {{ joining }}
        </div>
      </div>
    </div>
  </li>
</template>
<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZMenu, ZMenuItem, ZMenuSection, ZAvatar } from '@deepsourcelabs/zeal'
import { formatDate } from '@/utils/date'
import TEAM_PERMS from '~/utils/teamPerms'

import { User } from '~/types/types'
import ContextMixin from '~/mixins/contextMixin'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'

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
  components: { ZIcon, ZMenu, ZMenuItem, ZMenuSection, ZAvatar }
})
export default class MemberListItem extends mixins(ContextMixin, OwnerDetailMixin) {
  @Prop()
  role!: string

  @Prop()
  avatar: User['avatar']

  @Prop()
  email: User['email']

  @Prop()
  dateJoined: User['dateJoined']

  @Prop()
  fullName: User['fullName']

  @Prop()
  id: User['id']

  @Prop({ default: false })
  isRepo!: boolean

  @Prop({ default: false })
  isPrimaryUser!: boolean

  @Prop({ default: true })
  showRoleOptions!: boolean

  @Prop({ default: true })
  clickable!: boolean

  @Prop({ default: false })
  allowTransfer!: boolean

  // private roles = {}

  get joining(): string {
    return formatDate(this.dateJoined)
  }

  get roles(): Record<string, Record<string, string>> {
    if (this.isRepo) {
      return REPO_PERMS
    }
    return TEAM_PERMS
  }

  get showOwnerMenu() {
    return this.allowTransfer && this.owner.isViewerPrimaryUser
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
