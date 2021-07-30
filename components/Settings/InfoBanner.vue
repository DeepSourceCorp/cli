<template>
  <div class="border-l-4 border-ink-200 px-2">
    <div class="text-vanilla-400 w-96 text-xs">
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
