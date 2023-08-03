<template>
  <div
    class="inline-flex items-center justify-evenly space-x-2 rounded-full text-vanilla-100"
    :class="[spacing, `text-${textSize}`, getBaseColor, `bg-${bgColor}`]"
  >
    <z-icon v-if="iconLeft" :icon="iconLeft" :color="iconColor" :size="size" />
    <slot></slot>
    <z-icon v-if="iconRight" :icon="iconRight" :color="iconColor" :size="size" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ZIcon from '../ZIcon'

export default Vue.extend({
  name: 'ZTag',
  props: {
    state: {
      type: String,
      default: 'default',
      validator(value: string): boolean {
        return ['success', 'error', 'warning', 'info', 'default'].includes(value)
      }
    },
    iconLeft: {
      type: String
    },
    iconRight: {
      type: String
    },
    size: {
      type: String,
      default: 'small',
      validator(value: string): boolean {
        return ['x-small', 'small', 'base', 'medium', 'large'].includes(value)
      }
    },
    bgColor: {
      default: 'ink-300',
      type: String
    },
    textSize: {
      default: 'sm',
      type: String
    },
    spacing: {
      type: String,
      default: 'py-1 px-4'
    },
    iconColor: {
      type: String,
      default: 'current'
    }
  },
  computed: {
    getBaseColor(): string {
      const states: Record<string, string> = {
        success: 'border-2 border-solid border-juniper',
        default: '',
        info: 'border-2 border-solid border-aqua',
        warning: 'border-2 border-solid border-honey',
        error: 'border-2 border-solid border-cherry'
      }
      return states[this.state]
    }
  }
})
</script>
