<template>
  <div class="px-4 py-12 text-center md:py-10 md:text-left">
    <div class="max-w-2xl">
      <h1
        class="text-2xl font-bold leading-none md:text-2.5xl discover-mobile-hero-text md:bg-none"
      >
        {{ title }}
      </h1>
      <p class="max-w-md mx-auto mt-2 md:mx-0 md:max-w-2xl text-vanilla-400">
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
