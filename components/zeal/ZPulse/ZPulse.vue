<template>
  <div :class="`flex flex-shrink-0 h-${pulseSize} w-${pulseSize} items-center justify-center`">
    <span
      class="absolute inline-flex rounded-full"
      :class="[
        `h-${pulseSize} w-${pulseSize}`,
        { 'animate-ping': active },
        active ? `bg-${color}` : 'bg-ink-200'
      ]"
    ></span>
    <span
      :class="[
        `relative inline-flex rounded-full h-${dotSize} w-${dotSize} scale-125 transform`,
        active ? `bg-${color}` : 'bg-ink-200'
      ]"
    ></span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'ZPulse',
  props: {
    color: {
      type: String,
      default: 'juniper'
    },
    size: {
      type: String,
      default: 'base',
      validator: function (value: string): boolean {
        return ['small', 'base', 'large', 'xlarge'].includes(value)
      }
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    pulseSize(): number {
      const sizes: Record<string, number> = {
        small: 3,
        base: 4,
        large: 5,
        xlarge: 6
      }

      return sizes[this.size || 'base']
    },
    dotSize(): number {
      const sizes: Record<string, number> = {
        small: 1.5,
        base: 2,
        large: 2.5,
        xlarge: 4
      }

      return sizes[this.size || 'base']
    }
  }
})
</script>
