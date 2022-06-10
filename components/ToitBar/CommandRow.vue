<template>
  <li
    tabindex="-1"
    role="option"
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
      :fallback-image="context.emptyAvatarUrl"
      class="flex-shrink-0"
      stroke="bg-ink-100 p-1"
    ></z-avatar>
    <!-- skipcq JS-0693 -->
    <span class="flex-grow text-sm font-medium" v-html="labelHTML || label"></span>
    <div v-if="shortkey" class="flex space-x-1">
      <span
        v-for="(key, index) in shortkeyCombination"
        :key="index"
        class="flex items-center justify-center w-5 h-5 text-xs rounded-sm bg-ink-200"
        :class="[active ? 'text-vanilla-100' : 'text-vanilla-400']"
      >
        {{ formatKey(key) }}
      </span>
    </div>
    <div v-else-if="hint && active" class="text-xs text-vanilla-400" v-html="hint"></div>
  </li>
</template>
<script lang="ts">
import { mixins, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon, ZAvatar } from '@deepsourcelabs/zeal'
import ContextMixin from '~/mixins/contextMixin'
import { parseKeybinding } from 'tinykeys'

/**
 * Command Row component for the palette
 */
@Component({
  components: {
    ZIcon,
    ZAvatar
  }
})
export default class CommandRow extends mixins(ContextMixin) {
  @Prop()
  label: string

  @Prop()
  labelHTML: string

  @Prop()
  icon?: string

  @Prop()
  active?: boolean

  @Prop()
  image?: string

  @Prop()
  shortkey?: string

  @Prop()
  hint?: string

  get shortkeyCombination(): [string[], string] | [] {
    return this.shortkey ? parseKeybinding(this.shortkey)[0] : []
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
    if (Array.isArray(key)) {
      return this.formatKey(key[0])
    }

    if (key.startsWith('Key')) {
      return this.formatKey(key.replace('Key', ''))
    }

    if (key.toLowerCase() === 'alt') {
      return this.isMacintosh ? '⌥' : 'Alt'
    }
    if (['meta', 'cmd', 'ctrl'].includes(key.toLowerCase())) {
      return this.isMacintosh ? '⌘' : 'Ctrl'
    }
    return key
  }
}
</script>
