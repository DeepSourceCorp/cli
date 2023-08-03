<template>
  <nuxt-link
    :to="to"
    class="z-btn inline-flex h-8 items-center justify-center space-x-1 whitespace-nowrap rounded-sm px-4 py-1 text-xs font-medium leading-loose transition-colors duration-300 ease-in-out focus:outline-none"
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
