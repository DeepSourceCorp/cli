<template>
  <nuxt-link
    :to="to"
    class="
      z-btn
      inline-flex
      items-center
      justify-center
      font-medium
      transition-colors
      duration-300
      ease-in-out
      rounded-sm
      focus:outline-none
      whitespace-nowrap
      h-8
      px-4
      py-1
      text-xs
      space-x-1
      leading-loose
    "
    :class="[colors]"
  >
    <slot></slot>
  </nuxt-link>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'

@Component({
  name: 'NuxtLinkButton'
})
export default class NuxtLinkButton extends Vue {
  @Prop({ default: 'primary' })
  buttonType: string

  @Prop({ required: true, default: '' })
  to: string

  get colors(): string {
    const colorTypeMap: Record<string, string> = {
      primary: 'text-ink-400 bg-juniper hover:bg-juniper-600',
      secondary: 'text-vanilla-100 bg-ink-300 hover:bg-ink-200'
    }
    return colorTypeMap[this.buttonType]
  }
}
</script>
