<template>
  <li class="flex items-center py-2 space-x-3 text-sm border-b border-slate-400">
    <div class="items-center w-1/2 space-y-2 leading-none text-vanilla-100">
      <div>{{ email }}</div>
      <z-button
        button-type="ghost"
        size="x-small"
        @click="cancelInvite"
        class="text-xs cursor-pointer text-cherry"
      >
        Cancel Invite
      </z-button>
    </div>
    <div class="flex items-center justify-end w-1/2">
      <div class="space-y-2 text-right">
        <!-- z-menu>
          <template slot="trigger">
            <div class="flex items-center space-x-2">
              <span>{{ roles[role].title }}</span>
              <z-icon size="small" icon="chevron-down"></z-icon>
            </div>
          </template>
          <template slot="body">
            <z-menu-item v-for="(opt, key) in roles" :key="key" class="text-sm text-left">
              <div @click="updateRole(key)">
                <div class="flex items-center space-x-2">
                  <span>{{ opt.title }}</span>
                  <z-icon v-if="key == role" size="small" icon="check"></z-icon>
                </div>
                <p class="mt-1 text-xs leading-snug text-vanilla-400">{{ opt.description }}</p>
              </div>
            </z-menu-item>
          </template>
        </z-menu -->
        <span>{{ roles[role].title }}</span>
        <div v-if="createdAt" class="text-xs text-vanilla-400">invited on {{ joining }}</div>
      </div>
    </div>
    <!-- div class="flex items-center justify-end w-1/3">
      <z-button size="small" buttonType="secondary" class="border-none whitespace-nowrap">
        <div class="flex items-center space-x-2">
          <z-icon icon="mail" size="small"></z-icon>
          <span>Send Reminder</span>
        </div>
      </z-button>
    </div -->
  </li>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon, ZMenu, ZMenuItem, ZMenuSection, ZButton } from '@deepsource/zeal'
import { formatDate, parseISODate } from '@/utils/date'
import { TeamMemberRoleChoices } from '~/types/types'

@Component({
  components: { ZIcon, ZMenu, ZMenuItem, ZMenuSection, ZButton },
  layout: 'dashboard'
})
export default class MemberListItem extends Vue {
  @Prop()
  role!: string

  @Prop()
  email: string

  @Prop()
  createdAt: string

  @Prop()
  id: string

  private roles = {
    [TeamMemberRoleChoices.Admin]: {
      title: 'Administrator',
      description:
        'Full access to all repositories and the team, including billing, adding, or removing members.'
    },
    [TeamMemberRoleChoices.Contributor]: {
      title: 'Contributor',
      description:
        "Contributors don't have any team level access or any access to change repo level settings."
    },
    [TeamMemberRoleChoices.Member]: {
      title: 'Member',
      description: 'Add and edit specific repositories'
    }
  }

  get joining(): string {
    return formatDate(parseISODate(this.createdAt))
  }

  updateRole(newRole: string): void {
    this.$emit('updateRole', {
      email: this.email,
      role: this.role,
      newRole
    })
  }

  cancelInvite(): void {
    this.$emit('cancelInvite', this.email)
  }
}
</script>
