<template>
  <portal to="modal">
    <z-confirm
      v-if="isOpen"
      @onClose="close"
      title="Confirm regenerate SSH keys for this repository?"
      subtitle="This action is irreversible, and will invalidate the old keys. You must replace the old keys with the new one everywhere you're using it."
      primary-action-label="Confirm and regenerate keys"
      @primaryAction="confirm"
    >
    </z-confirm>
  </portal>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon, ZConfirm, ZButton, ZCheckbox } from '@deepsource/zeal'

@Component({
  name: 'GenerateSshKeyConfirmModal',
  components: {
    ZIcon,
    ZConfirm,
    ZButton,
    ZCheckbox
  }
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
