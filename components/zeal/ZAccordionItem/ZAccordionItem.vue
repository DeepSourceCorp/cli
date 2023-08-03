<template>
  <div
    class="z-accordion-item"
    :class="{
      'border-b border-t border-ink-200 first:border-0 last:border-0 hover:bg-ink-300': showBorders,
      'text-vanilla-200': !isDisabled,
      'text-slate': isDisabled
    }"
  >
    <slot name="title" :open="open" :toggle-accordion="toggleAccordion">
      <div
        class="group flex items-center transition-all duration-700 ease-in-out"
        :class="{
          'cursor-not-allowed': isDisabled,
          'cursor-pointer': !isDisabled && !isList
        }"
        @click="toggleAccordion()"
      >
        <span class="flex-1 font-medium">{{ title }}</span>
        <z-icon
          icon="chevron-right"
          color="slate"
          class="duration-DEFAULT group transform stroke-1.5 transition-all ease-in-out"
          size="medium"
          :class="[
            accordionHeaderAnimations,
            {
              'rotate-90 text-vanilla-200': open,
              'text-slate': isDisabled,
              'group-hover:text-vanilla-200': !isDisabled,
              hidden: isList
            }
          ]"
        />
      </div>
    </slot>
    <div
      class="overflow-hidden text-sm leading-6 transition-max-height duration-300 ease-in-out"
      :class="[
        open ? (spanCustomHeight ? customMaxHeight : 'max-h-52') : 'max-h-0',
        { 'max-h-full': isList }
      ]"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ZAccordionItem',
  props: {
    title: {
      default: '',
      type: String
    },
    isOpen: {
      type: Boolean,
      default: false
    },
    icon: {
      type: String,
      default: 'down'
    },
    isList: {
      type: Boolean,
      default: false
    },
    spanCustomHeight: {
      type: Boolean,
      default: false
    },
    customMaxHeight: {
      type: String,
      default: 'max-h-screen'
    }
  },
  data() {
    return {
      open: this.isOpen,
      accordionHeaderAnimations: '',
      isDisabled: this.$parent.disabled,
      showBorders: this.$parent.showBorders
    }
  },
  watch: {
    isOpen() {
      this.toggleAccordion()
    }
  },
  methods: {
    toggleAccordion() {
      if (this.isDisabled) return
      if (this.isList) return
      this.open = !this.open
      this.accordionHeaderAnimations = this.open
        ? 'animate-first-quarter-spin rotate-90'
        : 'animate-reverse-quarter-spin rotate-0'
      this.$emit('isOpen', this.open)
    }
  }
}
</script>
