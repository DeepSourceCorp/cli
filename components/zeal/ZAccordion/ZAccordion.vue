<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'ZAccordion',
  components: {},
  props: {
    defaultStyle: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    allowMultiple: {
      type: Boolean,
      default: true
    },
    showBorders: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      accordionItems: []
    }
  },
  computed: {}
}
</script>
