<template>
  <div class="z-badge relative inline-block">
    <slot></slot>
    <div
      v-show="!hidden && (content || content === 0 || isDot)"
      class="z-badge-content transform text-center"
      :class="[
        bgColor,
        sizeClasses,
        !isNotification && positionClasses,
        isNotification && notificationClasses,
        !isDot && typeClasses,
        `text-${textColor}`,
        {
          'absolute -translate-y-1/2 translate-x-1/2': !isNotification,
          'rounded-full p-0': !isNotification && isDot,
          'rounded-full leading-4': value
        }
      ]"
    >
      <span>{{ content }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'ZBadge',
  components: {},
  props: {
    value: [String, Number],
    max: Number,
    isDot: Boolean,
    hidden: Boolean,
    size: {
      type: String,
      default: 'sm',
      validator(val: string) {
        return ['sm', 'md', 'lg'].includes(val)
      }
    },
    type: {
      type: String,
      default: 'default',
      validator(val: string) {
        return ['default', 'success', 'warning', 'info', 'danger'].includes(val)
      }
    },
    position: {
      type: String
    },
    textColor: {
      type: String,
      default: 'vanilla-100'
    },
    isNotification: {
      type: Boolean
    }
  },
  computed: {
    bgColor() {
      const colors: Record<string, string> = {
        default: '',
        success: 'juniper',
        warning: 'honey',
        info: 'aqua',
        danger: 'cherry'
      }
      return `bg-${colors[this.type as string]}`
    },
    notificationClasses() {
      return 'relative top-0 right-0 translate-x-0 translate-y-0'
    },
    typeClasses() {
      if (typeof this.value === 'number') {
        return `h-6 w-6 flex justify-center items-center text-xxs font-bold`
      }
      return 'inline-block text-xs px-2'
    },
    sizeClasses() {
      const sizes: Record<string, string> = {
        sm: 'w-2 h-2',
        md: 'w-2.5 h-2.5',
        lg: 'w-3 h-3'
      }
      return this.isDot ? sizes[this.size as string] : ''
    },
    positionClasses(): string {
      if (this.position) return this.position as string
      else {
        if (this.value) return 'top-px right-0'
        if (this.isDot) return 'top-px right-px'
        return 'top-0'
      }
    },
    content() {
      if (this.isDot) return
      const value = this.value,
        max = this.max
      if (typeof value === 'number' && typeof max === 'number') {
        return max < value ? `${max}+` : value
      }
      return value
    }
  }
})
</script>
