<template>
  <span
    :class="sizeClass"
    class="inline-flex items-center rounded-full border border-ink-200 bg-ink-400 font-semibold uppercase leading-none tracking-wide text-vanilla-200"
  >
    <z-icon v-if="icon" :icon="icon" :size="iconSize" :color="baseColor" />
    <span>
      <slot></slot>
    </span>
  </span>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'ZLabel',

  props: {
    state: {
      type: String,
      default: 'info',
      validator(value: string): boolean {
        return ['success', 'error', 'warning', 'info'].includes(value)
      }
    },
    size: {
      type: String,
      default: 'base',
      validator(value: string): boolean {
        return ['base', 'large'].includes(value)
      }
    }
  },
  computed: {
    icon(): string {
      const colors: Record<string, string> = {
        success: 'check-circle',
        error: 'x-circle',
        warning: 'alert-circle',
        info: 'solid-circle'
      }
      return colors[this.state || 'info']
    },
    baseColor(): string {
      const colors: Record<string, string> = {
        success: 'juniper',
        error: 'cherry',
        warning: 'honey',
        info: 'robin'
      }
      return colors[this.state || 'default']
    },
    sizeClass(): string {
      const sizes: Record<string, string> = {
        base: 'text-xxs px-1 py-1 pr-2 space-x-1',
        large: 'text-xs px-1 py-1 pr-3 space-x-2'
      }
      return sizes[this.size || 'base']
    },
    iconSize(): string {
      const sizes: Record<string, string> = {
        small: 'x-small',
        base: 'small',
        large: 'medium'
      }
      return sizes[this.size || 'base']
    }
  }
})
</script>
