<template>
  <section
    class="grid border-2 border-dashed rounded-md border-ink-200 place-content-center"
    :class="[heightClass, spacingClass]"
  >
    <slot name="hero"></slot>
    <slot name="title">
      <h1 class="text-base font-semibold text-center text-vanilla-100">{{ title }}</h1>
    </slot>
    <div class="max-w-xl mt-2 text-center text-vanilla-400 text-sm">
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

  @Prop({ default: 'min-h-92 max-h-screen' })
  heightClass: string

  @Prop({ default: 'p-12' })
  spacingClass: string
}
</script>
