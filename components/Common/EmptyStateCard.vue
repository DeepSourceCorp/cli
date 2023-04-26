<template>
  <section
    class="empty-state-card-shadow mx-auto flex w-full flex-wrap justify-center gap-x-4 gap-y-1 rounded-md border border-solid border-ink-200 bg-ink-300 px-0 py-6 md:flex-nowrap"
  >
    <empty-state-picture
      :webp-image-path="webpImagePath"
      :png-image-path="pngImagePath"
      :svg-image-path="svgImagePath"
      :width="imageWidth ? imageWidth : 'w-auto'"
      :alt-text="altText"
      :height="imageWidth ? false : 'h-17 md:h-20'"
      :image-classes="imageClasses"
      class="w-full md:w-auto"
    />

    <div :class="contentStyles">
      <h3 class="mt-4 text-base font-medium text-vanilla-100 md:mt-0">
        <slot name="title">
          {{ title }}
        </slot>
      </h3>

      <p class="mt-2 text-sm leading-6 text-vanilla-400">
        <slot name="subtitle">
          {{ subtitle }}
        </slot>
      </p>
    </div>
  </section>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component({ name: 'EmptyStateCard' })
export default class EmptyStateCard extends Vue {
  @Prop({ default: 'This page has no data' })
  altText: string

  @Prop({ default: 'text-left px-4 max-w-sm', type: String })
  contentStyles: string

  @Prop({ default: 'md:mx-auto px-4 md:px-0', type: String })
  imageClasses: string

  @Prop()
  imageWidth: string

  @Prop({ default: '' })
  subtitle: string

  @Prop({ default: '' })
  title: string

  @Prop({ default: require('~/assets/images/ui-states/empty.gif') })
  pngImagePath: () => any

  @Prop({ default: '' })
  svgImagePath: () => any

  @Prop({ default: require('~/assets/images/ui-states/empty.webp') })
  webpImagePath: () => any
}
</script>

<style scoped>
.empty-state-card-shadow {
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.25);
}
</style>
