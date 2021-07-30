<template>
  <div class="hidden sm:flex items-center space-x-1 text-sm">
    <slot>
      <z-icon :icon="icon" size="small" :color="color"></z-icon>
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
