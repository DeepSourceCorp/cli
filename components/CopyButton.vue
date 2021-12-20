<template>
  <z-button
    v-bind="zButtonBindings"
    :icon="btnIcon"
    :icon-color="btnIconColor"
    :label="btnLabel"
    :disabled="disabled"
    @click="copyContent"
  />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'
import { ZButton } from '@deepsourcelabs/zeal'

@Component({ components: { ZButton }, name: 'CopyButton' })
export default class CopyButton extends Vue {
  @Prop({ default: 'Copy' })
  label: string

  @Prop({ default: 'Copied' })
  succesLabel: string

  @Prop({ default: 'copy' })
  icon: string

  @Prop({ default: 'check' })
  succesIcon: string

  @Prop({ default: false })
  iconOnly: boolean

  @Prop({ default: false })
  disabled: boolean

  @Prop({ default: 1000 })
  timeout: number

  @Prop({ required: true })
  value: string

  hasCopied = false
  btnIconColor = 'vanilla-100'

  get btnIcon(): string {
    return this.hasCopied ? this.succesIcon : this.icon
  }

  get btnLabel(): string | null {
    if (this.iconOnly) {
      return null
    }
    return this.hasCopied ? this.succesLabel : this.label
  }

  get zButtonBindings(): Record<string, string> {
    const attrsBinding = this.$attrs
    const btnHasType = Object.keys(attrsBinding).includes('buttonType')
    if (!btnHasType) {
      attrsBinding['buttonType'] = 'secondary'
    }
    const btnHasSize = Object.keys(attrsBinding).includes('size')
    if (!btnHasSize) {
      attrsBinding['size'] = 'small'
    }
    //? Safety net to avoid multiple props being sent to ZButton
    const btnHasIconColor = Object.keys(attrsBinding).includes('iconColor')
    if (btnHasIconColor) {
      delete attrsBinding.iconColor
    }
    return attrsBinding
  }

  copyContent(): void {
    if (!this.disabled) {
      this.$copyToClipboard(this.value)
      this.hasCopied = true
      setTimeout(() => {
        this.hasCopied = false
      }, this.timeout)
    }
  }
}
</script>
