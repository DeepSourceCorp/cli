<template>
  <span
    class="z-menu relative"
    v-on="enableHover ? { mouseenter: handleMouseEnter, mouseleave: handleMouseLeave } : {}"
  >
    <div ref="menu-trigger" class="leading-none">
      <slot name="trigger" :toggle="toggle" :is-open="isOpen">
        <z-button :label="triggerLabel" @click="toggle" />
      </slot>
    </div>
    <transition
      enter-active-class="animate-slide-bottom-enter-active sm:animate-none sm:transition-all sm:duration-75 sm:ease-out-quad"
      leave-active-class="animate-slide-bottom-leave-active sm:animate-none sm:transition-all sm:duration-150 sm:ease-in-quad"
      enter-class="sm:opacity-0 sm:scale-75"
      enter-to-class="sm:opacity-100 sm:scale-100"
      leave-class="sm:opacity-100 sm:scale-100"
      leave-to-class="sm:opacity-0 sm:scale-75"
    >
      <!-- prettier-ignore -->
      <div
        v-if="isOpen"
        class="fixed flex items-end overflow-hidden bg-opacity-25 sm:overflow-visible h-100 sm:absolute text-vanilla-200 transform-gpu bg-ink-400 sm:bg-transparent sm:bg-opacity-0"
        :class="[directionClass, placementClasses, itemsZClass]"
      >
        <div
          ref="menu-body"
          v-outside-click="triggerClose"
          class="overflow-hidden rounded-t-lg bg-ink-300 sm:rounded-md shadow-double-dark"
          :class="[sizeClass, bodySpacing]"
        >
          <slot name="body" :is-open="isOpen" :close="close"></slot>
        </div>
      </div>
    </transition>
  </span>
</template>

<script lang="ts">
import Vue from 'vue'
import { containsElement } from '~/utils/zeal'
import outsideClickDirective from '~/utils/directives/outsideClick'
import ZButton from '../ZButton/ZButton.vue'

export default Vue.extend({
  name: 'ZMenu',
  components: { ZButton },
  directives: { 'outside-click': outsideClickDirective },
  props: {
    direction: {
      type: String,
      default: 'right',
      validator: function (value: string): boolean {
        return ['left', 'right'].includes(value)
      }
    },
    placement: {
      type: String,
      default: 'bottom',
      validator: function (value: string): boolean {
        return ['top', 'bottom'].includes(value)
      }
    },
    size: {
      type: String,
      default: 'base',
      validator: function (value: string): boolean {
        return ['small', 'base', 'large'].includes(value)
      }
    },
    width: {
      type: String,
      default: 'base',
      validator: function (value: string): boolean {
        return ['x-small', 'small', 'base', 'large', 'x-large', '2x-large'].includes(value)
      }
    },
    bodySpacing: {
      type: String,
      default: ''
    },
    collapseOnMobile: {
      type: Boolean,
      default: false
    },
    triggerLabel: {
      type: String,
      default: 'Menu'
    },
    triggerOnHover: {
      type: Boolean,
      default: false
    },
    itemsZClass: {
      type: String,
      default: 'z-10'
    }
  },
  data() {
    return {
      isOpen: false,
      enableHover: this.triggerOnHover
    }
  },
  methods: {
    toggle(): void {
      if (this.enableHover) this.enableHover = false
      else this.isOpen = !this.isOpen
    },
    close(): void {
      this.isOpen = false
    },
    open(): void {
      this.isOpen = true
    },
    handleMouseEnter(): void {
      if (this.enableHover) this.open()
    },
    handleMouseLeave(): void {
      if (this.enableHover) this.close()
    },
    triggerClose(event?: Event): void {
      // Trigger only if open
      if (this.isOpen) {
        // If click event is not present close directly
        if (!event) {
          this.isOpen = false
        } else {
          event.stopPropagation()
          const target = event.target as HTMLElement
          const menuTrigger = this.$refs['menu-trigger'] as HTMLElement
          const menuBody = this.$refs['menu-body'] as HTMLElement

          if (!containsElement(menuTrigger, target) && !containsElement(menuBody, target)) {
            this.isOpen = false
          }
        }
      }
    }
  },
  computed: {
    directionClass(): string {
      if (this.direction === 'right') {
        return this.placement === 'top'
          ? `sm:left-0 sm:origin-bottom-left`
          : `sm:left-0 sm:origin-top-left`
      }

      return this.placement === 'top'
        ? `sm:right-0 sm:origin-bottom-right`
        : `sm:right-0 sm:origin-top-right`
    },
    placementClasses(): string {
      if (this.placement === 'top') {
        return 'inset-0 sm:inset-auto sm:bottom-10'
      }
      return 'inset-0 sm:inset-auto'
    },
    sizeClass(): string {
      const sizes: Record<string, string> = {
        small: `text-xs w-full ${this.widthClass} mt-5 sm:mt-2`,
        base: `text-sm w-full ${this.widthClass} mt-5 sm:mt-2`,
        large: `text-base w-full ${this.widthClass} mt-5 sm:mt-4`
      }
      return sizes[this.size || 'base']
    },
    widthClass(): string {
      const widths: Record<string, string> = {
        'x-small': 'sm:w-48',
        small: 'sm:w-52',
        base: 'sm:w-64',
        large: 'sm:w-72',
        'x-large': 'sm:w-80',
        '2x-large': 'sm:w-96',
        '3x-large': 'sm:w-102'
      }
      return widths[this.width] || 'sm:w-64'
    }
  },
  watch: {
    isOpen(newState: boolean): void {
      this.$emit('menu-toggle', newState)
      this.enableHover = this.triggerOnHover
    }
  }
})
</script>
