<template>
  <div class="z-radio-group" role="radiogroup">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'ZRadioGroup',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readOnly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      value: ''
    }
  },
  model: {
    prop: 'modelValue',
    event: 'change'
  },
  watch: {
    value(newValue) {
      if (!this.disabled && !this.readOnly) {
        this.$emit('change', newValue)
      }
    }
  }
}
</script>
