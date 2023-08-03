<template>
  <label
    class="z-input z-input__checkbox group relative flex items-center pl-6 text-base"
    :class="{
      'is-disabled cursor-not-allowed': disabled,
      'is-read-only cursor-not-allowed': readOnly
    }"
  >
    <input
      type="checkbox"
      :checked="isChecked"
      :value="value"
      :name="name"
      :disabled="disabled || readOnly"
      class="absolute h-0 w-0 opacity-0"
      @change="updateInput"
    />
    <span
      data-before="✓"
      data-content=""
      class="z-input__checkbox--checkmark"
      :class="{
        [checkBoxSize]: true,
        'absolute left-0 grid border border-solid bg-transparent text-center text-transparent': true,
        'cursor-pointer place-items-center rounded-sm border-slate before:content-before': true,
        'group-hover:border-juniper sibling-checked:border-juniper sibling-checked:bg-juniper sibling-checked:text-ink-100': true,
        'cursor-not-allowed group-hover:border-slate sibling-checked:border-slate sibling-checked:bg-slate sibling-checked:text-ink-300':
          disabled,
        'cursor-not-allowed opacity-80 sibling-checked:text-ink-200': readOnly,
        'group-hover:border-juniper': readOnly && isChecked,
        'group-hover:border-slate': readOnly && !isChecked
      }"
    ></span>
    <span
      v-if="label"
      class="z-input__checkbox--text"
      :class="{ [fontSize]: true, 'text-slate': disabled, 'text-vanilla-300': readOnly }"
    >
      {{ label }}
    </span>
  </label>
</template>
<script>
import Vue from 'vue'

export default Vue.extend({
  name: 'ZCheckbox',
  model: {
    prop: 'modelValue',
    event: 'change'
  },
  props: {
    label: {
      default: '',
      type: String
    },
    name: {
      default: '',
      type: String
    },
    value: {
      default: '',
      type: String
    },
    trueValue: {
      default: true,
      type: Boolean
    },
    falseValue: {
      default: false,
      type: Boolean
    },
    disabled: {
      default: false,
      type: Boolean
    },
    readOnly: {
      default: false,
      type: Boolean
    },
    modelValue: {
      default: false,
      type: [Boolean, String]
    },
    size: {
      default: 'base',
      type: String,
      validator: (value) => {
        return ['small', 'base', 'large'].includes(value)
      }
    }
  },
  computed: {
    isChecked() {
      if (this.modelValue instanceof Array) {
        return this.modelValue.includes(this.value)
      }
      return this.modelValue === this.trueValue
    },
    checkBoxSize() {
      const sizes = {
        small: 'h-4 w-4',
        base: 'h-5 w-5 font-medium',
        large: 'h-6 w-6 font-semibold'
      }
      return sizes[this.size] || 'h-5 w-5'
    },
    fontSize() {
      const sizes = {
        small: 'text-sm',
        base: 'text-base ml-1',
        large: 'text-lg ml-2'
      }
      return sizes[this.size] || 'text-base ml-2'
    }
  },
  methods: {
    updateInput(event) {
      const isChecked = event.target.checked

      if (this.modelValue instanceof Array) {
        const newValue = [...this.modelValue]

        if (isChecked) {
          newValue.push(this.value)
        } else {
          newValue.splice(newValue.indexOf(this.value), 1)
        }
        this.$emit('change', newValue, event)
      } else {
        this.$emit('change', isChecked ? this.trueValue : this.falseValue, event)
      }
    }
  }
})
</script>
