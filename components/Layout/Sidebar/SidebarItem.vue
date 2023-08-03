<template>
  <component
    :is="linkAttrs.is"
    v-bind="linkAttrs"
    class="sidebar-item flex h-8 cursor-pointer items-center gap-x-2 rounded-sm px-2 text-sm hover:bg-ink-300"
    :class="[
      active ? 'bg-ink-300 text-vanilla-100' : 'text-vanilla-400',
      isCollapsed ? 'w-8 max-w-0' : 'w-full max-w-full'
    ]"
    @click="$emit('click')"
  >
    <z-icon
      v-if="icon"
      :icon="icon"
      size="small"
      :color="iconColor ? iconColor : active ? 'vanilla-100' : ''"
      class="min-h-4 min-w-4"
    />
    <div
      v-show="!isCollapsed"
      class="w-full overflow-x-hidden overflow-ellipsis whitespace-nowrap py-0.5 text-sm leading-none"
    >
      <slot></slot>
    </div>
  </component>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component({})
export default class SidebarItem extends Vue {
  @Prop()
  icon?: string

  @Prop()
  iconColor?: string

  @Prop({ default: false })
  active!: boolean

  @Prop({ default: false })
  isCollapsed!: boolean

  @Prop({ default: '' })
  to!: string

  get linkAttrs() {
    if (!this.to) {
      return {
        is: 'div'
      }
    }

    if (this.isExternalLink) {
      return {
        is: 'a',
        href: this.to
      }
    }

    return {
      is: 'nuxt-link',
      to: this.to
    }
  }

  get isExternalLink(): boolean {
    return (
      this.to.startsWith('mailto:') ||
      this.to.startsWith('https://') ||
      this.to.startsWith('http://')
    )
  }
}
</script>
