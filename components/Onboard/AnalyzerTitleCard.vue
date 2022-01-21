<template>
  <div
    class="flex items-center h-12 max-w-lg p-2 space-x-2 rounded-md cursor-pointer bg-ink-300 hover:bg-ink-200"
    @click="handleClick()"
  >
    <analyzer-logo
      :analyzerLogo="analyzerLogo"
      :shortcode="icon"
      :name="name"
      :hideTooltip="true"
    />
    <div class="flex-1 text-sm text-vanilla-200">{{ name }}</div>
    <z-icon icon="plus" size="small" class="cursor-pointer" color="vanilla-200"></z-icon>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsourcelabs/zeal'
@Component({
  components: {
    ZIcon
  }
})
export default class AnalyzerTitleCard extends Vue {
  @Prop({ default: 'globe' })
  icon!: string

  @Prop({ default: '' })
  analyzerLogo!: string

  @Prop({ default: '' })
  name!: string

  public handleClick(event: Event): void {
    this.$emit('click', event)
  }
}
</script>
