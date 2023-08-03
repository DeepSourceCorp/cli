<template>
  <div
    class="flex w-full flex-row overflow-hidden"
    :class="{
      'rounded-md': roundedCorners
    }"
  >
    <div v-if="showAccent" :class="`w-1 bg-${color}`"></div>
    <div
      class="flex flex-grow flex-col space-y-2 px-3 py-2"
      :class="{
        'border border-slate-400': showBorder,
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
        <z-icon v-if="icon" :icon="icon" />
      </div>
      <div class="flex flex-grow flex-col justify-between space-y-1">
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

@Component({})
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
