<script>
export default {
  name: 'ZTabPanes',
  computed: {
    activeIndex() {
      const $parent = this.$parent
      return $parent.activeIndex
    }
  },
  render(h) {
    return h(
      'div',
      {
        class: 'outline-none focus:outline-none z-tab-items',
        attrs: {
          role: 'tabpanel',
          tabindex: 0
        }
      },
      [this.$slots.default?.[this.activeIndex]] // activeIndex is reactive
    ) // Render the pane for the active tabs
  }
}
</script>
