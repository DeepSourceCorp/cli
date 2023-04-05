<template>
  <z-confirm
    v-if="showModal"
    primary-action-label="Confirm and update role"
    @onClose="close"
    @primaryAction="updateRole"
  >
    <div class="mb-2 flex items-center text-base leading-relaxed text-vanilla-100">
      <z-icon icon="alert-circle" size="small" class="mr-2" /> Update {{ ROLES[role] }} role to
      {{ ROLES[newRole] }}
    </div>
    <p class="blur text-sm leading-relaxed text-vanilla-400">
      Are you sure you want to make <span class="text-vanilla-100">{{ userName }}</span>
      {{ formattedArticle }} <span class="text-vanilla-100">{{ ROLES[newRole] }}</span
      >? {{ roleAccessMessage }}
    </p>
  </z-confirm>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon, ZConfirm } from '@deepsource/zeal'
import { TeamMemberRoleChoices } from '~/types/types'

@Component({
  components: {
    ZIcon,
    ZConfirm
  },
  layout: 'dashboard'
})
export default class UpdateRoleModal extends Vue {
  @Prop({ default: false })
  showModal: boolean

  @Prop({ required: true })
  newRole: TeamMemberRoleChoices

  @Prop({ required: true })
  role: TeamMemberRoleChoices

  @Prop({ required: true })
  email: string

  @Prop({ default: undefined })
  fullName: string

  close(): void {
    this.$emit('close')
  }

  private readonly ROLES: Record<TeamMemberRoleChoices, string> = {
    [TeamMemberRoleChoices.Admin]: 'administrator',
    [TeamMemberRoleChoices.Contributor]: 'contributor',
    [TeamMemberRoleChoices.Member]: 'member'
  }

  get userName() {
    return this.fullName ? this.fullName : this.email
  }

  get formattedArticle() {
    return this.newRole === TeamMemberRoleChoices.Admin ? 'an' : 'a'
  }

  get roleAccessMessage(): string {
    if (this.newRole === TeamMemberRoleChoices.Admin) {
      return `This will give them full access to all repositories and the team, including billing, adding, or removing members.`
    }
    if (this.newRole === TeamMemberRoleChoices.Contributor) {
      return `Contributors don't have any team level access or any access to change repo level settings.`
    }
    if (this.newRole === TeamMemberRoleChoices.Member) {
      return `Members have the ability to activate analysis on new repositories.`
    }
    return 'Are you sure you want to update the role?'
  }

  updateRole(): void {
    this.$emit('primaryAction', this.email, this.newRole)
  }
}
</script>
