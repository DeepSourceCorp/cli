<template>
  <portal to="modal">
    <z-confirm
      v-if="isOpen"
      primary-action-label="Confirm and delete"
      primary-action-icon="trash-2"
      primary-action-type="danger"
      @onClose="close"
      @primaryAction="confirm"
    >
      <div class="mb-2 flex items-center text-base leading-relaxed text-vanilla-100">
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

@Component({
  name: 'IgnoreRuleDeleteModal'
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
