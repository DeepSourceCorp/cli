<template>
  <div
    class="z-expandable mt-2"
    @mouseover.stop.prevent="toggleExpandable(true)"
    @mouseleave.stop.prevent="toggleExpandable(false)"
  >
    <!-- prettier-ignore -->
    <div
      v-if="$slots.header"
      class="z-expandable__header p-2.5 font-semibold text-sm leading-6 cursor-pointer transition-all duration-300 ease-in-out"
      :class="openTextStyle"
    >
      <slot name="header"></slot>
    </div>
    <!-- prettier-ignore -->
    <div
      v-if="$slots.content"
      class="z-expandable__content bg-ink-400 text-vanilla-100 overflow-scroll transition-all duration-700 ease-in-out text-sm leading-6 border border-solid border-ink-300"
      :class="openHeightStyle"
    >
      <div class="py-5 px-2.5"><slot name="content"></slot></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ZExpandable',
  props: {
    open: {
      type: Boolean
    }
  },
  data() {
    return {
      isOpen: this.open
    }
  },
  computed: {
    openHeightStyle() {
      return this.isOpen ? 'max-h-52' : 'max-h-0'
    },
    openTextStyle() {
      return this.isOpen
        ? 'text-vanilla-100 bg-ink-400 border-b-0 border border-solid border-ink-300'
        : 'text-vanilla-400 bg-ink-300 border border-solid border-transparent'
    }
  },
  methods: {
    toggleExpandable: function (open) {
      this.isOpen = open
    }
  }
}
</script>
