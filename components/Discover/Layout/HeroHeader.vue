<template>
  <div class="px-4 py-12 text-center md:py-10 md:text-left">
    <div class="max-w-2xl">
      <h1
        class="discover-mobile-hero-text text-2xl font-bold leading-none md:bg-none md:text-2.5xl"
      >
        {{ title }}
      </h1>
      <p class="mx-auto mt-2 max-w-md text-vanilla-400 md:mx-0 md:max-w-2xl">
        {{ subtitle }}
      </p>
      <slot></slot>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class HeroHeader extends Vue {
  @Prop({ required: true })
  title: string

  @Prop({ required: true })
  subtitle: string
}
</script>
