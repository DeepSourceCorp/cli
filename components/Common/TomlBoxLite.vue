<template>
  <div class="relative min-h-13 rounded-md border border-slate-400 p-3 text-sm">
    <highlightjs v-if="toml" language="toml" :code="toml" />
    <copy-button :value="toml" :disabled="!toml" label="Copy" class="absolute right-2 top-2" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'

@Component({
  name: 'TomlBoxLite'
})
export default class TomlBoxLite extends Vue {
  @Prop({ default: '' })
  toml: string
}
</script>
