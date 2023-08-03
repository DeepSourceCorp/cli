<template>
  <div class="timeline__item relative flex gap-x-2">
    <div class="flex flex-col items-center justify-center gap-y-2">
      <div class="flex h-6 w-6 items-center justify-center">
        <slot name="icon">
          <span class="inline-block h-full w-full rounded-full bg-juniper"></span>
        </slot>
      </div>
      <span
        class="left-4 h-full rounded-sm border-l"
        :class="[
          {
            'border-transparent': index === lastIndex,
            'border-ink-100': index !== lastIndex
          },
          borderWidthClass
        ]"
      ></span>
    </div>
    <slot>
      <div class="flex flex-col space-y-2 text-xs">
        <div class="text-vanilla-100">{{ content }}</div>
        <div class="text-vanilla-400">{{ timestamp }}</div>
      </div>
    </slot>
  </div>
</template>

<script>
export default {
  name: 'ZTimelineItem',
  props: {
    content: {
      type: String,
      default: ''
    },
    timestamp: {
      type: String,
      default: ''
    },
    borderWidthClass: {
      type: String,
      default: 'border-2'
    }
  },
  data() {
    return {
      index: 0
    }
  },
  computed: {
    lastIndex() {
      return this.$parent.length - 1
    }
  }
}
</script>
