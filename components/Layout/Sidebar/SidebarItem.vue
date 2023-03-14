<template>
  <component
    :is="linkAttrs.is"
    v-bind="linkAttrs"
    class="flex items-center h-8 px-2 text-sm rounded-sm cursor-pointer gap-x-2 sidebar-item hover:bg-ink-300"
    :class="[
      active ? 'bg-ink-300 text-vanilla-100' : 'text-vanilla-400',
      isCollapsed ? 'max-w-0 w-8' : 'max-w-full w-full'
    ]"
    @click="$emit('click')"
  >
    <z-icon
      v-if="icon"
      :icon="icon"
      size="small"
      :color="iconColor ? iconColor : active ? 'vanilla-100' : ''"
      class="min-w-4 min-h-4"
    />
    <div
      v-show="!isCollapsed"
      class="w-full overflow-x-hidden text-sm whitespace-nowrap overflow-ellipsis leading-none py-0.5"
    >
      <slot></slot>
    </div>
  </component>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsource/zeal'

@Component({
  components: {
    ZIcon
  }
})
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
