<template>
  <div>
    <img
      v-if="analyzerLogo"
      v-tooltip="hideTooltip ? '' : name"
      class="w-auto flex-shrink-0"
      :class="sizeStyle"
      :src="analyzerLogo"
      :alt="name"
    />
    <z-icon
      v-else
      v-tooltip="hideTooltip ? '' : name"
      :icon="shortcode"
      color="transparent"
      :size="size"
    />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component({})
export default class AnalyzerLogo extends Vue {
  @Prop({ default: '' })
  analyzerLogo!: string

  @Prop({ default: '' })
  name!: string

  @Prop({ default: '' })
  shortcode!: string

  @Prop({ default: 'base' })
  size!: string

  @Prop({ default: false })
  hideTooltip: boolean

  get sizeStyle() {
    const sizes: Record<string, string> = {
      'x-small': 'w-3 h-3',
      small: 'w-4 h-4',
      base: 'w-5 h-5',
      medium: 'w-6 h-6',
      large: 'w-8 h-8'
    }

    return sizes[this.size] || 'w-5 h-4'
  }
}
</script>
