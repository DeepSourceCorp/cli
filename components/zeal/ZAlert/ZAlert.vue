<template>
  <div
    v-if="isVisible"
    class="rounded-md px-4"
    :class="[bgColor, dismissible ? 'py-2' : 'py-3.5', { 'bg-opacity-10': type !== 'neutral' }]"
  >
    <div class="flex items-center">
      <div
        ref="text-container"
        class="flex-grow text-sm"
        :class="[textColor, dismissible && textContainerHeight > 32 ? 'my-1.5' : '-mb-px']"
      >
        <slot></slot>
      </div>

      <z-button
        v-if="dismissible"
        button-type="ghost"
        icon="x"
        :color="colors[type]"
        size="small"
        class="flex-shrink-0 place-self-start hover:bg-opacity-0"
        @click="hideAlert"
      />
    </div>

    <slot name="code-snippet"></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import ZButton from '../ZButton/ZButton.vue'

export default Vue.extend({
  name: 'ZAlert',

  props: {
    type: {
      type: String,
      required: true,
      validator(val: string) {
        return ['info', 'warning', 'danger', 'neutral'].includes(val)
      }
    },
    dismissible: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data: function () {
    return {
      isVisible: true,
      textContainerHeight: 0,
      colors: {
        info: 'robin',
        warning: 'honey',
        danger: 'cherry',
        neutral: 'vanilla-100'
      },
      observer: {} as ResizeObserver
    }
  },

  /**
   * Mounted hook for Vue component
   *
   * @returns {void}
   */
  mounted() {
    // Initialize the observer on mount
    this.initObserver()
  },

  /**
   * BeforeDestroy hook for Vue component
   *
   * @returns {void}
   */
  beforeDestroy() {
    // Unobserve before destroy
    if (this.observer.unobserve && this.$refs['text-container']) {
      this.observer.unobserve(this.$refs['text-container'] as Element)
    }
  },
  methods: {
    /**
     * Callback function passed to ResizeObserver constructor
     *
     * @returns {void}
     */
    onResize() {
      if (this.$refs['text-container']) {
        this.textContainerHeight = (this.$refs['text-container'] as HTMLElement).offsetHeight
      }
    },

    /**
     * Initialize observer
     *
     * @returns {void}
     */
    initObserver() {
      const observer = new ResizeObserver(this.onResize)
      observer.observe(this.$refs['text-container'] as Element)
      this.observer = observer
    },

    /**
     * Hide Alert
     *
     * @returns {void}
     */
    hideAlert() {
      this.isVisible = false
      this.$emit('dismiss')
    }
  },
  computed: {
    bgColor(): string {
      const bgColors: Record<string, string> = {
        info: 'bg-robin',
        warning: 'bg-honey',
        danger: 'bg-cherry',
        neutral: 'bg-ink-300'
      }
      return bgColors[this.type]
    },
    textColor(): string {
      const textColors: Record<string, string> = {
        info: 'text-robin-400',
        warning: 'text-honey-400',
        danger: 'text-cherry-400',
        neutral: 'text-vanilla-100'
      }
      return textColors[this.type]
    }
  }
})
</script>
