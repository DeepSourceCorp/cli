<template>
  <section
    class="flex flex-col justify-between"
    :class="{
      'border rounded-md border-slate-400': showBorder
    }"
  >
    <div
      v-if="title || $slots.controls || $slots.title"
      class="grid grid-cols-1 gap-2"
      :class="{
        'md:gap-0 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5': fullWidth,
        'xl:gap-0 xl:grid-cols-2': !fullWidth,
        'border-b border-slate-400 px-4': showBorder,
        'py-2': $slots.controls && showBorder && !headerSpacingClass,
        'py-3': !$slots.controls && showBorder && !headerSpacingClass,
        'pt-0 pb-2': $slots.controls && !showBorder && !headerSpacingClass,
        'pt-0 pb-3': !$slots.controls && !showBorder && !headerSpacingClass,
        [headerSpacingClass]: headerSpacingClass
      }"
    >
      <div
        class="text-vanilla-100 col-span-full"
        :class="{
          'sm:col-span-1 md:col-span-1 xl:col-span-2': fullWidth && $slots.controls,
          'xl:col-span-1': !fullWidth && $slots.controls
        }"
      >
        <slot name="title">
          <div class="flex items-center h-full space-x-2">
            <span class="text-base font-semibold tracking-snug">{{ title }}</span>
            <z-icon
              v-if="helpText"
              icon="help"
              class="stroke-1.5 transition-opacity duration-75 flex-shrink-0"
              color="vanilla-400"
              v-tooltip="{ content: helpText, delay: { show: 0, hide: 100 } }"
            ></z-icon>
          </div>
        </slot>
      </div>
      <div
        v-if="$slots.controls"
        class="col-span-full"
        :class="{
          'md:col-span-2 xl:col-span-2 2xl:col-span-3': fullWidth,
          'xl:col-span-1': !fullWidth
        }"
      >
        <slot name="controls"></slot>
      </div>
    </div>
    <div
      class="flex-grow"
      :class="{
        'p-0': !spacingClass && bodySpacing === 0,
        'p-2': !spacingClass && bodySpacing === 2,
        'p-4': !spacingClass && bodySpacing === 4,
        'gap-0': gridGap === 0,
        'gap-2': gridGap === 2,
        'gap-4': gridGap === 4,
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5':
          bodyIsGrid && !customGridClass,
        [customGridClass]: customGridClass && bodyIsGrid,
        [spacingClass]: spacingClass
      }"
    >
      <slot></slot>
    </div>
    <div>
      <slot name="footer"></slot>
    </div>
  </section>
</template>
<script lang="ts">
// Internals
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsource/zeal'

/**
 * A wrapper with a header to encapsulate
 * multiple type of sections for the various pages
 */
@Component({
  components: {
    ZIcon
  }
})
export default class StatSection extends Vue {
  @Prop()
  title: string

  @Prop()
  helpText: string

  @Prop({ default: 2 })
  bodySpacing!: number

  @Prop({ default: 2 })
  gridSpacing!: number

  @Prop({ default: true })
  bodyIsGrid!: boolean

  @Prop({ default: null })
  customGridClass!: string

  @Prop({ default: null })
  spacingClass!: string

  @Prop({ default: null })
  headerSpacingClass!: string

  @Prop({ default: true })
  showBorder!: boolean

  @Prop({ default: true })
  fullWidth!: boolean

  get gridGap(): number | null {
    // If body is grid, return grid spacing or body spacing whichever is available
    return this.bodyIsGrid ? this.gridSpacing ?? this.bodySpacing : null
  }
}
</script>
