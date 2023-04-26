<template>
  <picture :class="[width]">
    <source v-if="svgImagePath" :srcset="svgImagePath" type="image/svg+xml" />
    <source v-if="webpImagePath" :srcset="webpImagePath" type="image/webp" />
    <img
      v-if="pngImagePath"
      :src="pngImagePath"
      :alt="altText"
      :class="[imageClasses, width, height]"
    />
  </picture>
</template>
<script lang="ts">
import { Vue, Prop, Component } from 'nuxt-property-decorator'

/**
 * Component for displaying the picture in EmptyState.vue
 */
@Component
export default class EmptyStatePicture extends Vue {
  @Prop()
  webpImagePath: () => any

  @Prop({ required: true })
  pngImagePath: () => any

  @Prop()
  svgImagePath: () => any

  @Prop({ default: 'w-28' })
  width: string

  @Prop()
  height: string

  @Prop({ default: 'This page has no data' })
  altText: string

  @Prop({ default: 'mx-auto' })
  imageClasses: string
}
</script>
