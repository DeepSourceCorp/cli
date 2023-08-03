<template>
  <div class="rounded-md bg-opacity-5 p-4 text-sm" :class="[bgColor]">
    <span class="bg-clip-text" :class="[textColor, bgColor]">
      <slot></slot>
    </span>
  </div>
</template>

<script lang="ts">
import { Vue, Prop, Component } from 'nuxt-property-decorator'

@Component({ name: 'AlertBox' })
export default class AlertBox extends Vue {
  @Prop({ default: 'text-vanilla-100 text-opacity-70' })
  textColor: string

  @Prop({ default: 'bg-robin' })
  bgColor: string
}
</script>
