<template>
  <div
    class="flex h-full items-start overflow-scroll rounded-sm border border-ink-200 p-1 focus-within:shadow-white"
    :class="{
      'cursor-not-allowed': disabled,
      'resize-none': !resizable,
      resize: resizable
    }"
  >
    <textarea
      :maxlength="maxLength"
      class="h-full w-full resize-none bg-transparent p-1 outline-none"
      :class="[
        `text-${textSize}`,
        disabled ? 'text-slate' : `text-${textColor}`,
        {
          'cursor-not-allowed': disabled
        }
      ]"
      :placeholder="placeholder"
      :disabled="disabled"
      :value="value"
      @input="updateSelf($event.target.value)"
    >
    </textarea>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'ZTextarea',
  props: {
    value: {
      default: '',
      type: String
    },
    placeholder: {
      default: 'Once upon a time...',
      type: String
    },
    textSize: {
      type: String,
      default: 'xs'
    },
    textColor: {
      type: String,
      default: 'vanilla-400'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    resizable: {
      type: Boolean,
      default: false
    },
    maxLength: {
      type: Number,
      default: null,
      required: false
    }
  },
  model: {
    prop: 'value',
    event: 'input'
  },

  methods: {
    updateSelf(value: string): void {
      if (!this.disabled) this.$emit('input', value)
    }
  }
})
</script>
