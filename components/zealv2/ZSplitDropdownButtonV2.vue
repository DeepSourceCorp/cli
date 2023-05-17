<template>
  <div class="inline-flex items-center">
    <slot name="primary-button"></slot>
    <z-divider
      :color="dividerColor"
      direction="vertical"
      margin="mx-0"
      :class="['flex-shrink-0', dividerHeight]"
    />
    <slot name="menu"></slot>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { ZDivider } from '@deepsource/zeal'

@Component({ components: { ZDivider } })
export default class ZSplitDropdownButtonV2 extends Vue {
  @Prop({ default: 'slate-400' })
  dividerColor: string

  @Prop({ default: 'h-full' })
  dividerHeight: string
}
</script>
