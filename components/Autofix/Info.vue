<template>
  <div class="items-center hidden space-x-1 text-sm sm:flex">
    <slot>
      <z-icon :icon="icon" size="x-small" :color="color"></z-icon>
      <span class="text-sm" :class="[`text-${color}`]">{{ title }}</span>
    </slot>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsourcelabs/zeal'

@Component({
  components: {
    ZIcon
  }
})
export default class Info extends Vue {
  @Prop({ default: '' })
  title!: string

  @Prop({ default: '' })
  icon!: string

  @Prop({ default: 'vanilla-400' })
  color!: string
}
</script>
