<template>
  <div
    class="z-slide absolute bottom-0 left-0 right-0 top-0 h-full w-full opacity-0 transition-opacity duration-1000 ease-in-out"
    :class="[`${visible && 'opacity-100'}`]"
  >
    <div class="z-slide__content h-full w-full">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ZSlide',
  data() {
    return {
      index: 0
    }
  },
  computed: {
    visible() {
      return this.index === this.$parent.currentIndex
    }
  }
}
</script>
