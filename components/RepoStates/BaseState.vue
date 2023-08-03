<template>
  <section
    class="grid place-content-center rounded-md border border-dashed border-slate-400"
    :class="[heightClass, spacingClass]"
  >
    <slot name="hero"></slot>
    <slot name="title">
      <h1
        class="text-center text-base font-semibold text-vanilla-100"
        :class="{ 'mt-6': $slots.hero }"
      >
        {{ title }}
      </h1>
    </slot>
    <div class="mt-2 max-w-xl text-center text-sm text-vanilla-400">
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
