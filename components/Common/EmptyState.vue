<template>
  <section
    class="w-full"
    :class="[
      {
        'rounded-md border border-dashed border-slate-400': showBorder,
        'flex flex-wrap items-start justify-center gap-x-7 gap-y-8 md:flex-nowrap': useV2
      },
      padding
    ]"
  >
    <empty-state-picture
      :webp-image-path="webpImagePath"
      :png-image-path="pngImagePath"
      :svg-image-path="svgImagePath"
      :width="imageWidth ? imageWidth : 'w-auto'"
      :alt-text="altText"
      :height="imageWidth ? undefined : 'h-17 md:h-20'"
      :class="{ 'w-full md:w-auto': useV2 }"
    />
    <div :class="[{ 'text-center md:text-left': useV2 }, { [contentWidth]: useV2 }]">
      <h3
        class="text-vanilla-100"
        :class="
          useV2
            ? 'mt-7 text-base font-medium md:mt-0'
            : 'mt-7 text-center text-lg font-semibold md:mt-5'
        "
      >
        <slot name="title"> {{ title }}</slot>
      </h3>
      <p
        class="text-sm text-vanilla-400"
        :class="useV2 ? 'mt-2 leading-6' : 'mx-auto mt-2 max-w-md text-center sm:mt-1'"
      >
        <slot name="subtitle">{{ subtitle }} </slot>
      </p>
      <div v-if="$slots.action" :class="useV2 ? 'mt-5' : 'mt-5 text-center'">
        <slot name="action"></slot>
      </div>
    </div>
  </section>
</template>
<script lang="ts">
import { Vue, Prop, Component } from 'nuxt-property-decorator'

@Component
export default class EmptyState extends Vue {
  @Prop({ required: false, default: '' })
  title: string

  @Prop({ required: false, default: '' })
  subtitle: string

  // Prop to specify if the updated version of empty-states needs to be used
  @Prop({ default: false, type: Boolean })
  useV2?: boolean

  @Prop({ default: require('~/assets/images/ui-states/empty.webp') })
  webpImagePath: () => any

  @Prop({ default: require('~/assets/images/ui-states/empty.gif') })
  pngImagePath: () => any

  @Prop({ default: '' })
  svgImagePath: () => any

  @Prop({ default: false, type: Boolean })
  showBorder: boolean

  @Prop()
  imageWidth: string

  @Prop({ default: 'This page has no data' })
  altText: string

  @Prop({ default: 'max-w-2xs', type: String })
  contentWidth: string

  @Prop({ default: 'px-3.5 py-12 md:px-12 md:py-19', type: String })
  padding: string
}
</script>
