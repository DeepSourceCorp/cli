<template>
  <div :class="[spacing]">
    <z-icon :icon="icon" :size="size" :color="iconColor" class="flex-shrink-0 inline mb-px" />
    <span :class="[textColor, textSize, 'inline']">
      <slot>{{ label }}</slot>
    </span>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsourcelabs/zeal'

@Component({
  components: {
    ZIcon
  },
  name: 'MetaDataItem'
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

  @Prop({ default: 'text-xs md:text-sm' })
  textSize: string

  @Prop({ default: 'space-x-1' })
  spacing: string
}
</script>
