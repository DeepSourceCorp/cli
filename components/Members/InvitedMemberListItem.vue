<template>
  <li class="flex items-start gap-x-2.5 first:-mt-4">
    <z-avatar
      :image="getDefaultAvatar(email)"
      :user-name="email"
      type="span"
      class="mt-4 flex-shrink-0"
    />
    <div
      class="flex w-full justify-between gap-x-3 py-4 text-sm"
      :class="{ 'border-b border-ink-300': !hideBorder }"
    >
      <div class="items-center space-y-0.5 leading-none text-vanilla-100">
        <div class="text-sm leading-6">{{ email }}</div>
        <div v-if="createdAt" class="flex items-center gap-x-1 text-xs leading-6 text-vanilla-400">
          <z-icon icon="calendar" color="current" size="x-small" />
          <span class="leading-5">invited on {{ joining }}</span>
        </div>
      </div>

      <div class="space-y-2 text-right">
        <z-menu direction="left">
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
                {{ roles[role].title }}
              </span>
              <z-icon
                size="x-small"
                icon="chevron-down"
                class="transform duration-150"
                :class="{
                  'rotate-180': isOpen
                }"
              />
            </button>
          </template>
          <template #body>
            <z-menu-item
              as="button"
              spacing="px-2.5 py-3.5"
              data-testid="transfer-ownership"
              class="w-full text-xs text-cherry"
              @click="cancelInvite"
            >
              <div class="inline-flex w-full items-center gap-x-2">
                <z-icon icon="x" color="current" size="x-small" />
                <span>Cancel invite</span>
              </div>
            </z-menu-item>
          </template>
        </z-menu>
      </div>
    </div>
  </li>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon, ZMenu, ZMenuItem, ZMenuSection, ZAvatar } from '@deepsource/zeal'
import { formatDate, parseISODate } from '@/utils/date'
import { getDefaultAvatar } from '@/utils/ui'

import { TeamMemberRoleChoices } from '~/types/types'

@Component({
  components: { ZIcon, ZMenu, ZMenuItem, ZMenuSection, ZAvatar },
  methods: { getDefaultAvatar },
  layout: 'dashboard'
})
export default class MemberListItem extends Vue {
  @Prop({ required: true })
  role!: string

  @Prop({ required: true })
  email: string

  @Prop()
  createdAt: string

  @Prop()
  id: string

  @Prop({ default: false })
  hideBorder: boolean

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
