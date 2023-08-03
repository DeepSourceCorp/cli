<template>
  <div :class="['relative', 'z-divider', getDirectionClasses, `bg-${color}`]">
    <div v-if="direction !== 'vertical'" class="z-divider--content"><slot></slot></div>
  </div>
</template>

<script>
export default {
  name: 'ZDivider',
  props: {
    direction: {
      default: 'horizontal',
      type: String
    },
    margin: {
      type: String
    },
    color: {
      type: String,
      default: 'ink-200'
    }
  },
  computed: {
    getDirectionClasses() {
      return this.direction === 'vertical'
        ? `inline-block w-px h-4 ${this.margin || 'my-0 mx-2'} align-middle`
        : `block h-px w-full ${this.margin || 'my-6 mx-0'}`
    }
  }
}
</script>
