<template>
  <span
    class="inline-flex items-center justify-center w-5 h-5 text-sm rounded-full select-none bg-slate cursor-help"
    v-tooltip="helpText"
  >
    ?
  </span>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component({})
export default class InfoIcon extends Vue {
  @Prop({ default: '' })
  helpText!: string
}
</script>
