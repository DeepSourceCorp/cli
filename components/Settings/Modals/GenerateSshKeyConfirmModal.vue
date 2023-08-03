<template>
  <portal to="modal">
    <z-confirm
      v-if="isOpen"
      title="Confirm regenerate SSH keys for this repository?"
      subtitle="This action is irreversible, and will invalidate the old keys. You must replace the old keys with the new one everywhere you're using it."
      primary-action-label="Confirm and regenerate keys"
      @onClose="close"
      @primaryAction="confirm"
    />
  </portal>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component({
  name: 'GenerateSshKeyConfirmModal'
})
export default class GenerateSshKeyConfirmModal extends Vue {
  @Prop({ default: false })
  isOpen!: boolean

  public close(): void {
    this.$emit('close')
  }

  public confirm(): void {
    this.$emit('generate')
  }
}
</script>
