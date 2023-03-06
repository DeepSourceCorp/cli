<template>
  <z-confirm
    v-if="showModal"
    @onClose="close"
    primary-action-label="Confirm and update role"
    @primaryAction="updateRole"
  >
    <div class="mb-2 text-base leading-relaxed text-vanilla-100 flex items-center">
      <z-icon icon="alert-circle" size="small" class="mr-2"></z-icon> Update {{ roles[role] }} role
      to
      {{ roles[newRole] }}
    </div>
    <p class="text-sm leading-relaxed text-vanilla-400 blur" v-html="roleMessage"></p>
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

  private roles: Record<TeamMemberRoleChoices, string> = {
    [TeamMemberRoleChoices.Admin]: 'administrator',
    [TeamMemberRoleChoices.Contributor]: 'contributor',
    [TeamMemberRoleChoices.Member]: 'member'
  }

  get roleMessage(): string {
    const name = this.fullName ? this.fullName : this.email
    const role = this.roles[this.newRole]

    const formattedArticle = this.newRole === TeamMemberRoleChoices.Admin ? 'an' : 'a'

    const confirmMessage = `Are you sure you want to make <span class="text-vanilla-100">${name}</span> ${formattedArticle} <span class="text-vanilla-100">${role}</span>?`

    if (this.newRole === TeamMemberRoleChoices.Admin) {
      return `${confirmMessage} This will give them full access to all repositories and the team, including billing, adding, or removing members.`
    }
    if (this.newRole === TeamMemberRoleChoices.Contributor) {
      return `${confirmMessage} Contributors don't have any team level access or any access to change repo level settings.`
    }
    if (this.newRole === TeamMemberRoleChoices.Member) {
      return `${confirmMessage} Members have the ability to activate analysis on new repositories.`
    }
    return 'Are you sure you want to update the role?'
  }

  updateRole(): void {
    this.$emit('primaryAction', this.email, this.newRole)
  }
}
</script>
