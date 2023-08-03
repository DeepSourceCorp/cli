<template>
  <div class="hidden items-center space-x-1 text-sm sm:flex">
    <slot>
      <z-icon :icon="icon" size="x-small" :color="color" />
      <span class="text-sm" :class="[`text-${color}`]">{{ title }}</span>
    </slot>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component({})
export default class Info extends Vue {
  @Prop({ default: '' })
  title!: string

  @Prop({ default: '' })
  icon!: string

  @Prop({ default: 'vanilla-400' })
  color!: string
}
</script>
