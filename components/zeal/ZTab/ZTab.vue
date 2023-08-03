<template>
  <button
    role="tab"
    :aria-selected="selected"
    class="z-nav-item inline-flex items-end gap-2 px-1 pb-3 text-sm leading-none outline-none focus:outline-none"
    :disabled="disabled"
    :class="{
      'border-b-2': !removeIndicatorStyles,
      'text-vanilla-100': isActive && !disabled,
      [borderActive]: isActive && !disabled && !removeIndicatorStyles,
      'text-vanilla-400': !isActive && !disabled,
      'border-transparent hover:border-ink-100': !isActive && !disabled && !removeIndicatorStyles,
      'cursor-not-allowed border-transparent text-slate': disabled
    }"
    @click="action && action()"
  >
    <z-icon
      v-if="icon"
      :icon="icon"
      size="small"
      :color="isActive && !disabled ? 'vanilla-100' : 'vanilla-400'"
    />
    <slot></slot>
  </button>
</template>

<script lang="ts">
import Vue from 'vue'
import ZIcon from '../ZIcon/ZIcon.vue'

const DEFAULT_BORDER_ACTIVE_COLOR = 'juniper'

export default Vue.extend({
  name: 'ZTab',

  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: false
    },
    icon: {
      type: String
    },
    action: {
      type: Function
    },
    removeIndicatorStyles: {
      type: Boolean,
      default: false
    },
    borderActiveColor: {
      type: String,
      default: DEFAULT_BORDER_ACTIVE_COLOR
    }
  },
  computed: {
    selected(): string {
      return String(this.isActive)
    },
    borderActive(): string {
      return `border-${this.borderActiveColor}`
    }
  }
})
</script>
