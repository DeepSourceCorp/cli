<template>
  <div
    class="z-card flex h-full flex-col overflow-hidden rounded-md text-vanilla-100 transition-all"
    @click="handleClick"
  >
    <div v-if="$slots.header" class="z-card__header">
      <slot name="header"></slot>
    </div>
    <div v-if="$slots.body" class="z-card__body flex-1">
      <slot name="body"></slot>
    </div>
    <div v-if="$slots.footer" class="z-card__footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ZCard',
  methods: {
    handleClick(event) {
      this.$emit('click', event)
    }
  }
}
</script>
