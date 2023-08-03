<template>
  <svg
    :class="[
      'z-icon',
      strokeClass,
      getSizeStyle,
      icon && `z-icon--${icon}`,
      position && `${getPositionStyle}`,
      `text-${color}`
    ]"
    viewBox="0 0 24 24"
    stroke-linecap="round"
    stroke-linejoin="round"
    fill="none"
    @click="handleClick"
    v-html="getIcon(icon)"
  />
</template>

<script>
import feather from 'feather-icons'
import customIcons from '~/utils/icon.ts'

export default {
  name: 'ZIcon',
  props: {
    icon: {
      default: '',
      type: String
    },
    size: {
      default: 'small',
      type: String,
      validator: (val) => ['x-small', 'small', 'base', 'medium', 'large'].includes(val)
    },
    position: {
      default: '',
      type: String
    },
    color: {
      type: String,
      default: 'vanilla-400'
    }
  },
  data() {
    return {
      customStyle: '',
      strokeClass: ''
    }
  },
  computed: {
    getSizeStyle() {
      const sizes = {
        'x-small': 'w-3 h-3',
        small: 'w-4 h-4',
        base: 'w-5 h-5',
        medium: 'w-6 h-6',
        large: 'w-8 h-8'
      }

      return sizes[this.size] || 'w-5 h-5'
    },
    getPositionStyle() {
      if (this.position === 'left') {
        return 'absolute left-2 w-4'
      } else if (this.position === 'right') {
        return 'absolute right-2 w-4'
      }
      return ''
    }
  },
  methods: {
    getIcon(iconName) {
      let DOM = null
      if (customIcons[iconName]) {
        DOM = customIcons[iconName] && customIcons[iconName].contents
        this.strokeClass = 'stroke-1.5'
      } else {
        DOM = feather.icons[iconName] && feather.icons[iconName].contents
        this.strokeClass = 'stroke-current'
        // For feathericons, stroke has to be added, while for custom icons it has to be none
      }
      return DOM
    },
    handleClick(event) {
      this.$emit('click', event)
    }
  }
}
</script>
