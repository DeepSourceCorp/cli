<template>
  <z-tab
    class="z-tab-item"
    :icon="icon"
    :action="clickHandler"
    :is-active="isActive"
    :disabled="disabled"
    :remove-indicator-styles="removeIndicatorStyles"
    :border-active-color="borderActiveColor"
  >
    <slot :is-active="isActive"></slot>
  </z-tab>
</template>

<script>
const DEFAULT_BORDER_ACTIVE_COLOR = 'juniper'

export default {
  name: 'ZTabItem',
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    index: {
      type: Number
    },
    updateActiveIndex: {
      type: Function
    },
    icon: {
      type: String
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
    activeIndex() {
      return this.$parent.getActiveIndex
    },
    isActive() {
      return this.index === this.activeIndex
    }
  },
  methods: {
    clickHandler() {
      if (!this.disabled) {
        this.updateActiveIndex()
      }
    }
  }
}
</script>
