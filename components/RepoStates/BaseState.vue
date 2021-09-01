<template>
  <section
    class="border-2 border-dashed border-ink-200 p-12 grid place-content-center rounded-md min-h-92 max-h-screen"
  >
    <slot name="hero"></slot>
    <h1 class="text-center text-xl font-bold text-vanilla-300">{{ title }}</h1>
    <div class="text-center text-vanilla-400 mt-2 max-w-xl">
      <slot></slot>
    </div>
  </section>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component({})
export default class BaseState extends Vue {
  @Prop()
  title: string
}
</script>
