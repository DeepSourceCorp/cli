<template>
  <li class="flex items-center py-2 space-x-3 text-sm" @click="$emit('click')">
    <div>
      <z-avatar :image="avatar" :userName="fullName"></z-avatar>
    </div>
    <div class="items-center w-1/2 space-y-1 leading-none text-vanilla-100">
      <div>{{ fullName || email }}</div>
      <div class="text-xs text-vanilla-400" v-if="fullName">{{ email }}</div>
    </div>
    <div v-if="showRoleOptions" class="flex items-center justify-end flex-grow">
      <div class="text-right">
        <div v-if="isPrimaryUser && !isRepo" class="text-juniper">Owner</div>
        <z-menu v-else width="large">
          <template v-slot:trigger="{ toggle }">
            <button
              type="button"
              class="flex items-center space-x-2 outline-none focus:outline-none"
              @click="toggle"
            >
              <span>{{ roles[role].title }}</span>
              <z-icon size="small" icon="chevron-down"></z-icon>
            </button>
          </template>
          <template slot="body">
            <z-menu-section class="text-left">
              <z-menu-item v-for="(opt, key) in roles" :key="key" class="text-sm">
                <div @click="updateRole(key)">
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
              <z-menu-item @click="removeMember" icon="alert-triangle" class="text-cherry"
                >Remove from {{ isRepo ? 'repository' : 'team' }}</z-menu-item
              >
            </z-menu-section>
          </template>
        </z-menu>
        <div class="text-xs text-vanilla-400">since {{ joining }}</div>
      </div>
    </div>
    <div v-else class="flex items-center justify-end flex-grow">
      <div class="text-right">
        <div class="text-vanilla-200">{{ isPrimaryUser ? 'Owner' : roles[role].title }}</div>
        <div class="text-xs text-vanilla-400">since {{ joining }}</div>
      </div>
    </div>
  </li>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon, ZMenu, ZMenuItem, ZMenuSection, ZAvatar } from '@deepsourcelabs/zeal'
import { formatDate } from '@/utils/date'
import TEAM_PERMS from '~/utils/teamPerms'

import { User } from '~/types/types'

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
  layout: 'dashboard'
})
export default class MemberListItem extends Vue {
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
}
</script>
