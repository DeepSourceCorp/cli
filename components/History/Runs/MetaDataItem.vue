<template>
  <div class="flex items-center gap-x-1.5">
    <z-icon :icon="icon" :size="size" :color="iconColor" class="flex-shrink-0" />
    <p :class="[textColor, textSize]">
      <slot>{{ label }}</slot>
    </p>
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
export default class MetaDataItem extends Vue {
  @Prop({ default: '' })
  label: string

  @Prop({ required: true })
  icon: string

  @Prop({ default: 'x-small' })
  size: string

  @Prop({ default: 'vanilla-400' })
  iconColor: string

  @Prop({ default: 'text-vanilla-400' })
  textColor: string

  @Prop({ default: 'text-xxs md:text-sm' })
  textSize: string
}
</script>
