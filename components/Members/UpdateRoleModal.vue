<template>
  <z-confirm
    v-if="showModal"
    @onClose="close"
    primaryActionLabel="Confirm and update role"
    @primaryAction="updateRole"
  >
    <div class="mb-2 text-base leading-relaxed text-vanilla-100 flex items-center">
      <z-icon icon="alert-circle" size="small" class="mr-2"></z-icon> Update member role to
      {{ roles[newRole] }}
    </div>
    <p class="text-sm leading-relaxed text-vanilla-400" v-html="roleMessage"></p>
  </z-confirm>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon, ZConfirm } from '@deepsourcelabs/zeal'

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
  newRole: string

  @Prop({ required: true })
  role: 'ADMIN' | 'CONTRIBOTR' | 'MEMBER'

  @Prop({ required: true })
  email: string

  @Prop({ default: undefined })
  fullName: string

  close(): void {
    this.$emit('close')
  }

  private roles: Record<string, string> = {
    ADMIN: 'administrator',
    CONTRIBUTOR: 'contributor',
    MEMBER: 'member'
  }

  get roleMessage(): string {
    const name = this.fullName ? this.fullName : this.email
    const role = this.roles[this.newRole]

    const confirmMessage = `Are you sure you want to make <span class="text-vanilla-100">${name}</span> an <span class="text-vanilla-100">${role}</span>?`

    if (this.newRole == 'ADMIN') {
      return `${confirmMessage} This will give them full access to all repositories and the team, including billing, adding, or removing members.`
    }
    if (this.newRole == 'CONTRIBUTOR') {
      return `${confirmMessage} Contributors don't have any team level access or any access to change repo level settings.`
    }
    if (this.newRole == 'MEMBER') {
      return `${confirmMessage} Members have the ability to activate analysis on new repositories.`
    }
    return 'Are you sure you want to update the role?'
  }

  updateRole(): void {
    this.$emit('primaryAction', this.email, this.newRole)
  }
}
</script>
