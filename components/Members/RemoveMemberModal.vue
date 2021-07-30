<template>
  <z-confirm
    v-if="showModal"
    primaryActionType="danger"
    :primaryActionLabel="`Yes, remove ${fullName || email}`"
    :title="`Remove ${fullName || email}`"
    :subtitle="`Are you sure you want to remove ${
      fullName || email
    } from the team? The user will loose all access to repositories and issues on DeepSource.`"
    @primaryAction="removeMember"
    @onClose="close"
  >
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
