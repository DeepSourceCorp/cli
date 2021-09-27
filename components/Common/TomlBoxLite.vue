<template>
  <div class="text-sm border border-ink-200 rounded-md p-3 relative min-h-13">
    <highlightjs v-if="toml" language="toml" :code="toml" />
    <z-button
      :icon="btnIcon"
      :icon-color="btnIconColor"
      size="small"
      button-type="secondary"
      :label="btnLabel"
      class="absolute top-2 right-2"
      @click="copyToml"
    />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'
import { ZButton } from '@deepsourcelabs/zeal'

@Component({
  name: 'TomlBoxLite',
  components: { ZButton }
})
export default class TomlBoxLite extends Vue {
  @Prop({ default: '' })
  toml: string

  private btnIcon = 'copy'
  private btnIconColor = 'vanilla-100'
  private btnLabel = 'Click to copy'

  copyToml(): void {
    this.$copyToClipboard(this.toml)
    this.btnIcon = 'check'
    this.btnIconColor = 'juniper'
    this.btnLabel = 'Copied'
    setTimeout(() => {
      this.btnIcon = 'clipboard'
      this.btnIconColor = 'vanilla-100'
      this.btnLabel = 'Click to copy'
    }, 800)
  }
}
</script>
