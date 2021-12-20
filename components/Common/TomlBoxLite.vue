<template>
  <div class="text-sm border border-ink-200 rounded-md p-3 relative min-h-13">
    <highlightjs v-if="toml" language="toml" :code="toml" />
    <copy-button
      :value="toml"
      :disabled="!toml"
      label="Click to copy"
      class="absolute top-2 right-2 w-36"
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
}
</script>
