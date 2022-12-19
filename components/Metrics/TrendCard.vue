<template>
  <div
    class="flex flex-row w-full overflow-hidden"
    :class="{
      'rounded-md': roundedCorners
    }"
  >
    <div v-if="showAccent" :class="`w-1 bg-${color}`"></div>
    <div
      class="flex flex-col flex-grow px-3 py-2 space-y-2"
      :class="{
        'border border-ink-300': showBorder,
        'border-l-0': showAccent && showBorder,
        'rounded-r-md': showAccent && roundedCorners,
        'rounded-md': !showAccent && roundedCorners
      }"
    >
      <div class="flex flex-row justify-between">
        <h5>
          <slot name="title">
            {{ title }}
          </slot>
        </h5>
        <z-icon v-if="icon" :icon="icon"></z-icon>
      </div>
      <div class="flex flex-col justify-between flex-grow space-y-1">
        <span class="text-xs text-vanilla-400">
          <slot name="trend"></slot>
        </span>
        <div class="text-2.5xl font-extralight leading-none">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsource/zeal'

@Component({
  components: {
    ZIcon
  }
})
export default class TrendCard extends Vue {
  @Prop()
  icon!: string

  @Prop()
  title!: string

  @Prop({ default: true })
  showBorder!: boolean

  @Prop({ default: true })
  roundedCorners!: boolean

  @Prop({ default: true })
  showAccent!: boolean

  @Prop({ default: 'cherry' })
  color!: string

  get wrapperClass(): string {
    if (this.showBorder) {
      return 'rounded-r-md border-l-0'
    }
    return 'rounded-md'
  }
}
</script>
