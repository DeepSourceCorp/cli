<template>
  <div
    class="flex w-full items-center space-x-2 rounded-sm p-1 outline-none"
    :class="[
      borderStyles,
      `bg-${backgroundColor}`,
      {
        'cursor-not-allowed text-slate': disabled,
        'cursor-not-allowed text-vanilla-400': readOnly,
        'text-vanilla-300': !disabled && !readOnly,
        'h-6 space-x-1 text-xs leading-loose': size === 'x-small',
        'h-8 space-x-1 text-xs leading-loose': size === 'small',
        'h-10 space-x-2 text-sm leading-8': size === 'medium',
        'h-12 space-x-2.5 text-base leading-9': size === 'large',
        'h-13 space-x-3 text-lg leading-9': ['x-large', 'xlarge'].includes(size),
        'px-1.5 py-0.5': size === 'x-small' && !padding,
        'px-2 py-1': size === 'small' && !padding,
        'px-3 py-2': size === 'medium' && !padding,
        'px-4 py-2.5': size === 'large' && !padding,
        'px-4 py-3': ['x-large', 'xlarge'].includes(size) && !padding,
        'pr-1': $slots.right && !$slots.left && !padding,
        'pl-1': $slots.left && !$slots.right && !padding,
        [padding]: padding
      }
    ]"
  >
    <!-- Any icon/content to the left renders here -->
    <slot name="left"></slot>
    <input
      ref="input"
      v-debounce:[debounceDelay]="updateDebounce"
      class="flex w-full flex-grow overflow-hidden overflow-ellipsis bg-transparent outline-none"
      :class="{
        'cursor-not-allowed': disabled || readOnly
      }"
      :aria-label="label"
      :value="value"
      :name="name"
      :type="type"
      :max="max"
      :maxlength="maxLength"
      :min="min"
      :minlength="minLength"
      :multiple="multiple"
      :required="required"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readOnly"
      :autocomplete="autocomplete"
      @input="updateSelf($event.target.value)"
      @blur="blurHandler"
      @focus="focusHandler"
      @keydown="keydownHandler"
      @keyup="keyupHandler"
      @invalid="invalidHandler"
    />
    <!-- Any icon/content to the right renders here -->
    <slot name="right">
      <z-icon
        v-if="clearable"
        icon="x"
        size="small"
        class="cursor-pointer"
        @click.stop="clearInput"
      />
    </slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ZIcon from '../ZIcon/ZIcon.vue'
import debounceDirective from '~/utils/directives/debounce'

export default Vue.extend({
  name: 'ZInput',

  directives: {
    debounce: debounceDirective
  },
  props: {
    name: {
      default: '',
      type: String
    },
    value: {
      default: '',
      type: [String, Number]
    },
    label: {
      default: '',
      type: String
    },
    type: {
      default: 'text',
      type: String
    },
    padding: {
      type: String,
      default: undefined
    },
    max: {
      type: [String, Number],
      default: undefined
    },
    min: {
      type: [String, Number],
      default: undefined
    },
    placeholder: {
      default: 'Enter a value',
      type: String
    },
    disabled: {
      default: false,
      type: Boolean
    },
    readOnly: {
      default: false,
      type: Boolean
    },
    debounceDelay: {
      default: 350,
      type: Number
    },
    icon: {
      type: String,
      default: undefined
    },
    clearable: {
      type: Boolean
    },
    autocomplete: {
      type: String,
      default: undefined
    },
    size: {
      default: 'medium',
      type: String,
      validator(val: string) {
        return ['x-small', 'small', 'medium', 'large', 'x-large'].includes(val)
      }
    },
    backgroundColor: {
      type: String,
      default: 'ink-400'
    },
    showBorder: {
      type: Boolean,
      default: true
    },
    isInvalid: {
      type: Boolean,
      default: false
    },
    errorBorderColor: {
      type: String,
      default: 'cherry'
    },
    maxLength: {
      type: [String, Number],
      default: undefined
    },
    minLength: {
      type: [String, Number],
      default: undefined
    },
    multiple: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    validateOnBlur: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      invalidState: false
    }
  },
  computed: {
    borderStyles(): string {
      if (this.isInvalid || this.invalidState) {
        return `border border-cherry`
      }

      if (this.showBorder) {
        return `focus-within:border-vanilla-400 border border-ink-100`
      }

      return ''
    }
  },
  methods: {
    focus(): void {
      ;(this.$refs.input as HTMLInputElement).focus()
    },
    updateSelf(value: string): void {
      this.$emit('input', value)
    },
    updateDebounce(value: unknown): void {
      this.$emit('debounceInput', value)
    },
    clearInput() {
      this.updateSelf('')
      this.updateDebounce('')
    },
    blurHandler(e: FocusEvent) {
      this.$emit('blur', e)
      if (this.validateOnBlur) {
        const eventTarget = e.target as HTMLInputElement
        this.invalidState = !eventTarget.checkValidity()
      }
    },
    focusHandler(e: FocusEvent) {
      this.$emit('focus', e)
    },
    keyupHandler(e: KeyboardEvent) {
      this.$emit('keyup', e)
    },
    keydownHandler(e: KeyboardEvent) {
      this.$emit('keydown', e)
    },
    invalidHandler(e: Event) {
      if (this.validateOnBlur) {
        this.invalidState = true
      }
      this.$emit('invalid', e)
    }
  }
})
</script>
