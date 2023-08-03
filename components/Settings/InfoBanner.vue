<template>
  <div class="border-l-4 border-slate-400 px-2">
    <div class="max-w-sm text-xs text-vanilla-400">
      <slot>
        <p v-html="info"></p>
      </slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component({})
export default class InfoBanner extends Vue {
  @Prop({ default: '' })
  info!: string
}
</script>
