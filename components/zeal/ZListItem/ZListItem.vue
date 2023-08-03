<template>
  <div class="z-list-item flex space-x-1">
    <z-icon v-if="icon" :icon="icon" :size="iconSize" />
    <component :is="as" v-bind="$attrs" :class="[tagSpecificStyles]">
      <slot></slot>
    </component>
  </div>
</template>

<script>
export default {
  name: 'ZListItem',
  props: {
    as: {
      type: String,
      default: 'div'
    },
    icon: {
      type: String
    },
    iconSize: {
      type: String,
      default: 'small'
    }
  },
  data() {
    return {
      styles: {
        a: 'hover:text-juniper transition-all duration-300 ease-in-out'
      }
    }
  },
  computed: {
    tagSpecificStyles() {
      return this.styles[this.as] || ''
    }
  }
}
</script>
