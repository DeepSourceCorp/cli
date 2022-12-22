<template>
  <component
    :is="to ? 'nuxt-link' : 'li'"
    :to="to"
    tag="li"
    class="flex space-x-2 hover:bg-ink-300 cursor-pointer border-b border-slate-400 last:border-none p-2"
  >
    <div class="w-2/3 flex items-center text-sm">
      <div class="w-8 flex items-center">
        <slot name="avatar">
          <z-icon :icon="icon" size="small"></z-icon>
        </slot>
      </div>
      <slot name="label">
        {{ label }}
      </slot>
    </div>
    <div class="w-1/3 text-right self-center text-sm text-vanilla-400">
      <slot name="info">
        {{ info }}
      </slot>
    </div>
  </component>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsource/zeal'

@Component({
  components: { ZIcon }
})
export default class ListItem extends Vue {
  @Prop({ default: undefined })
  icon: string

  @Prop({ default: undefined })
  label: string

  @Prop({ default: undefined })
  info: string

  @Prop({ default: undefined })
  to: string
}
</script>
