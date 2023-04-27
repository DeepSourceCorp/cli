<template>
  <button :disabled="disabled" @click="copyContent">
    <slot :has-copied="hasCopied">
      <z-icon :icon="btnIcon" :size="iconSize" :color="iconColor" />
      {{ btnLabel }}
    </slot>
  </button>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsource/zeal'

@Component({ name: 'UnstyledCopyButton', components: { ZIcon } })
export default class UnstyledCopyButton extends Vue {
  @Prop({ required: true })
  value: string

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

  @Prop({ default: 'base' })
  iconSize: string

  @Prop({ default: 'current' })
  iconColor: string

  @Prop({ default: false })
  disabled: boolean

  @Prop({ default: 1000 })
  timeout: number

  hasCopied = false

  get btnIcon(): string {
    return this.hasCopied ? this.succesIcon : this.icon
  }

  get btnLabel(): string | null {
    if (this.iconOnly) {
      return null
    }
    return this.hasCopied ? this.succesLabel : this.label
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
