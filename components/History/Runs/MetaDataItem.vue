<template>
  <div :class="[spacing]">
    <z-icon :icon="icon" :size="size" :color="iconColor" class="mb-px inline flex-shrink-0" />
    <span :class="[textColor, textSize, wordBreak, 'inline']">
      <slot>{{ label }}</slot>
    </span>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component({
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

  @Prop({
    default: 'break-all',
    validator: (value: string) => ['break-normal', 'break-words', 'break-all'].includes(value)
  })
  wordBreak: string
}
</script>
