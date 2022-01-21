<template>
  <section class="w-full p-12">
    <picture class="mx-auto" :class="[imageWidth]">
      <source v-if="svgImagePath" :srcset="svgImagePath" type="image/svg+xml" />
      <source v-else :srcset="webpImagePath" type="image/webp" />
      <source :srcset="pngImagePath" type="image/png" />
      <img :src="pngImagePath" :alt="altText" class="mx-auto" :class="[imageWidth]" />
    </picture>
    <h3 class="mt-5 text-lg font-semibold text-center">
      <slot name="title"> {{ title }}</slot>
    </h3>
    <p class="max-w-md mx-auto mt-1 text-sm text-center text-vanilla-400">
      <slot name="subtitle">{{ subtitle }} </slot>
    </p>
    <div class="mt-6 text-center"><slot name="action"></slot></div>
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

  @Prop({ default: require('~/assets/images/ui-states/empty.webp') })
  webpImagePath: () => any

  @Prop({ default: require('~/assets/images/ui-states/empty.png') })
  pngImagePath: () => any

  @Prop({ default: '' })
  svgImagePath: () => any

  @Prop({ default: 'w-28' })
  imageWidth: string

  @Prop({ default: 'This page has no data' })
  altText: string
}
</script>
