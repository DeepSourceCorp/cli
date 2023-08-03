<template>
  <div
    class="z-dialog-backdrop fixed inset-0 flex items-end bg-ink-400 bg-opacity-60 sm:items-center"
    @click="close"
  >
    <transition
      enter-active-class="transition-all duration-100 ease-in-out"
      leave-active-class="transition-all duration-100 ease-in-out"
      enter-class="translate-y-full sm:translate-y-0 sm:scale-95 sm:opacity-0"
      leave-to-class="translate-y-full sm:translate-y-0 sm:scale-105 sm:opacity-0"
    >
      <div
        v-if="showInternal"
        class="mx-auto w-full transform-gpu rounded-t-lg sm:mb-12 sm:w-auto sm:rounded-md"
        :class="[transparent ? 'bg-transparent' : 'bg-ink-300 shadow-md']"
      >
        <slot :show-internal="showInternal" :close="close"></slot>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'ZDialogGeneric',
  data() {
    return {
      showInternal: false
    }
  },
  mounted() {
    this.showInternal = true
    document.addEventListener('keyup', this.handleKeyup)
  },
  beforeDestroy() {
    document.removeEventListener('keyup', this.handleKeyup)
  },
  methods: {
    close(): void {
      this.showInternal = false
      setTimeout(() => {
        this.$emit('onClose')
      }, 200)
    },
    handleKeyup(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        this.close()
      }
    }
  },
  props: {
    transparent: {
      type: Boolean,
      default: false
    }
  }
})
</script>
