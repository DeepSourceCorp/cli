<template>
  <div aria-label="Breadcrumb" role="navigation" class="flex space-x-2">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'ZBreadcrumb',
  props: {
    separator: {
      type: String,
      default: '/'
    }
  },
  data() {
    return {
      items: [],
      length: 0
    }
  },
  mounted() {
    this.items = this.$children.filter((child) => child.$options.name === 'ZBreadcrumbItem')
    this.length = this.items.length
    this.items.forEach((item, index) => {
      item.index = index
    })
  }
}
</script>
