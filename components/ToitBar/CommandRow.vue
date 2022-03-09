<template>
  <div
    tabindex="-1"
    class="flex items-center w-full h-10 space-x-3 focus:outline-none"
    :class="active ? 'bg-ink-300 text-vanilla-100 pr-4' : 'text-vanilla-400 px-4 py-2'"
    @focus="$emit('focus')"
  >
    <div v-if="active" class="w-0.5 mr-0.5 h-full rounded-r-lg -py-2 bg-juniper"></div>
    <z-icon v-if="icon" :icon="icon" />
    <z-avatar
      v-else-if="image"
      size="xs"
      :image="image"
      :user-name="label"
      class="flex-shrink-0"
      stroke="bg-ink-100 p-1"
    ></z-avatar>
    <span class="flex-grow text-sm font-medium" v-html="label"></span>
    <div v-if="shortkey" class="flex space-x-1">
      <span
        v-for="key in shortkeyCombination"
        :key="key"
        class="flex items-center justify-center w-5 h-5 text-xs rounded-sm bg-ink-200"
        :class="[active ? 'text-vanilla-100' : 'text-vanilla-400']"
      >
        {{ formatKey(key) }}
      </span>
    </div>
    <div v-else-if="hint" class="text-xs text-vanilla-400">
      {{ hint }}
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon, ZAvatar } from '@deepsourcelabs/zeal'

/**
 * Command Row component for the palette
 */
@Component({
  components: {
    ZIcon,
    ZAvatar
  }
})
export default class CommandRow extends Vue {
  @Prop()
  label: string

  @Prop()
  icon?: string

  @Prop()
  active?: boolean

  @Prop()
  image?: string

  @Prop()
  shortkey?: string[] | string

  @Prop()
  hint?: string

  get shortkeyCombination(): string[] {
    if (!this.shortkey) return []
    return Array.isArray(this.shortkey) ? this.shortkey : [this.shortkey]
  }

  get isMacintosh() {
    const platform = (navigator?.userAgentData as any)?.platform || navigator?.platform || 'unknown'
    return platform.toLowerCase().indexOf('mac') > -1
  }

  /**
   * Format key based on the operating system
   *
   * @param {string} key
   *
   * @return {string}
   */
  formatKey(key: string): string {
    if (key.toLowerCase() === 'opt') {
      return this.isMacintosh ? '⌥' : 'Alt'
    }
    if (['meta', 'cmd', 'ctrl'].includes(key.toLowerCase())) {
      return this.isMacintosh ? '⌘' : 'Ctrl'
    }
    return key
  }
}
</script>
