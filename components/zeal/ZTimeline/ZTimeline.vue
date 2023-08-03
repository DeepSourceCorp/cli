<template>
  <div class="timeline flex flex-col gap-y-2">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'ZTimeline',
  props: {},
  data() {
    return {
      items: [],
      length: 0
    }
  },
  mounted() {
    this.items = this.$children.filter((child) => child.$options.name === 'ZTimelineItem')
    this.length = this.items.length
    this.items.forEach((item, index) => {
      item.index = index
    })
  }
}
</script>
