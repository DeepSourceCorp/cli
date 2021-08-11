<template>
  <section class="w-full p-12">
    <picture class="w-1/2 mx-auto">
      <source :srcSet="require('~/assets/images/ui-states/empty.webp')" type="image/webp" />
      <source :srcSet="require('~/assets/images/ui-states/empty.png')" type="image/png" />
      <img
        class="w-1/2 mx-auto"
        :src="require('~/assets/images/ui-states/empty.png')"
        alt="This page has no data"
      />
    </picture>
    <h3 class="text-lg font-semibold text-center mt-5">
      <slot name="title"> {{ title }}</slot>
    </h3>
    <p class="text-vanilla-400 text-center max-w-md mx-auto">
      <slot name="subtitle">{{ subtitle }} </slot>
    </p>
    <div class="text-center mt-5"><slot name="action"></slot></div>
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
}
</script>
