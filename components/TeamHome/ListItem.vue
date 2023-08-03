<template>
  <component
    :is="to ? 'nuxt-link' : 'li'"
    :to="to"
    tag="li"
    class="flex cursor-pointer space-x-2 border-b border-slate-400 p-2 last:border-none hover:bg-ink-300"
  >
    <div class="flex w-2/3 items-center text-sm">
      <div class="flex w-8 items-center">
        <slot name="avatar">
          <z-icon :icon="icon" size="small" />
        </slot>
      </div>
      <slot name="label">
        {{ label }}
      </slot>
    </div>
    <div class="w-1/3 self-center text-right text-sm text-vanilla-400">
      <slot name="info">
        {{ info }}
      </slot>
    </div>
  </component>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component({})
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
