<template>
  <portal to="modal">
    <z-confirm
      v-if="isOpen"
      @onClose="close"
      @primaryAction="confirm"
      primaryActionLabel="Confirm and delete"
      primaryActionIcon="trash-2"
      primaryActionType="danger"
    >
      <div class="mb-2 text-base leading-relaxed text-vanilla-100 flex items-center">
        Confirm, delete this ignore rule?
      </div>
      <p class="text-sm leading-relaxed text-vanilla-400">
        Removal of this ignore rule will come in effect from the next analysis onward.
        <span class="font-bold text-vanilla-100">This action cannot be reversed.</span>
      </p>
    </z-confirm>
  </portal>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon, ZConfirm, ZButton, ZCheckbox } from '@deepsourcelabs/zeal'

@Component({
  name: 'IgnoreRuleDeleteModal',
  components: {
    ZIcon,
    ZConfirm,
    ZButton,
    ZCheckbox
  }
})
export default class IgnoreRuleDeleteModal extends Vue {
  @Prop({ default: false })
  isOpen!: boolean

  public close(): void {
    this.$emit('close')
  }

  public confirm(): void {
    this.$emit('delete')
  }
}
</script>
