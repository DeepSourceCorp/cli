<template>
  <z-confirm
    v-if="showModal"
    primary-action-type="danger"
    :primary-action-label="`Yes, remove ${fullName || email}`"
    :title="`Remove ${fullName || email}`"
    :subtitle="`Are you sure you want to remove ${
      fullName || email
    } from the team? The user will loose all access to repositories and issues on DeepSource.`"
    @primaryAction="removeMember"
    @onClose="close"
  />
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component({
  layout: 'dashboard'
})
export default class RemoveMemberModal extends Vue {
  @Prop({ default: false })
  showModal: boolean

  @Prop({ required: true })
  email: string

  @Prop({ default: undefined })
  fullName: string

  close(): void {
    this.$emit('close')
  }

  removeMember(): void {
    this.$emit('primaryAction', this.email)
  }
}
</script>
