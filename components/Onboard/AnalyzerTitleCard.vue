<template>
  <div
    class="flex h-12 max-w-lg cursor-pointer items-center space-x-2 rounded-md bg-ink-300 p-2 hover:bg-ink-200"
    @click="handleClick()"
  >
    <analyzer-logo
      :analyzer-logo="analyzerLogo"
      :shortcode="icon"
      :name="name"
      :hide-tooltip="true"
    />
    <div class="flex-1 text-sm text-vanilla-200">{{ name }}</div>
    <z-icon icon="plus" size="small" class="cursor-pointer" color="vanilla-200" />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
@Component({})
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
