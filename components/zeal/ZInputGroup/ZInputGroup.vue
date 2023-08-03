<template>
  <div class="flex">
    <span
      class="flex items-center whitespace-nowrap rounded-bl-sm rounded-tl-sm border border-r-0 border-ink-100 px-2 outline-none"
      :class="[addonBgColor, addonClasses, { 'border-vanilla-400': inputInFocus }]"
    >
      <slot name="addon">
        {{ prefix }}
      </slot>
    </span>
    <z-input
      v-bind="$attrs"
      class="rounded-bl-none rounded-tl-none border-l-0"
      @focus="inputInFocus = true"
      @blur="inputInFocus = false"
      v-on="$listeners"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import ZInput from '../ZInput'

export default Vue.extend({
  name: 'ZInputGroup',

  props: {
    prefix: {
      type: String,
      default: ''
    },
    addonBgColor: {
      type: String,
      default: 'bg-ink-200'
    }
  },
  data() {
    return {
      inputInFocus: false
    }
  },
  computed: {
    addonClasses(): string {
      const classMap: Record<string, string> = {
        'x-small': 'h-6 text-xs leading-loose',
        small: 'h-8 text-xs leading-loose',
        medium: 'h-10 text-sm leading-8',
        large: 'h-12 text-base leading-9',
        'x-large': 'h-13 text-lg leading-9',
        xlarge: 'h-13 text-lg leading-9'
      }

      return classMap[this.$attrs.size || 'medium']
    }
  }
})
</script>
