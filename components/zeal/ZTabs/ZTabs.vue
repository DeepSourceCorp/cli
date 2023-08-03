<template>
  <div class="z-tabs text-vanilla-400">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'ZTabs',
  props: {
    defaultActive: {
      type: Number,
      default: 0
    },
    active: {
      type: Number,
      default: 0
    }
  },
  data() {
    return { activeIndex: 0 }
  },
  computed: {
    getActiveIndex() {
      // Return the current active tab index
      return this.active >= 0 ? this.active : this.activeIndex
    }
  },
  mounted() {
    this.activeIndex = this.defaultActive
  },
  methods: {
    updateActiveIndex(index) {
      const previous = this.activeIndex
      this.activeIndex = index
      this.$emit('onTabChange', { index, previous })
    }
  }
}
</script>
