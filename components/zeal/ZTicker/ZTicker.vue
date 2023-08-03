<template>
  <div class="z-indicator flex items-center">
    <div class="flex items-center space-x-0.5" :class="[`text-${color}`]">
      <span>{{ value }}</span>
      <z-icon
        icon="triangle-down"
        :color="color"
        size="x-small"
        class="transform"
        :class="[
          direction,
          {
            hidden: hideIcon
          }
        ]"
      />
    </div>
    <slot name="content"></slot>
  </div>
</template>

<script>
export default {
  name: 'ZTicker',
  props: {
    value: {
      type: [String, Number],
      default: 100
    },
    arrowDirection: {
      type: String,
      default: 'up'
    },
    hideIcon: {
      type: Boolean
    },
    color: {
      type: String,
      default: 'juniper'
    }
  },
  computed: {
    direction() {
      const directions = {
        down: 'rotate-0 -mt-px',
        up: 'rotate-180 mt-px'
      }
      return directions[this.arrowDirection]
    }
  }
}
</script>
