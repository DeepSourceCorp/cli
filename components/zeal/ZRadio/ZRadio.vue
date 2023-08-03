<template>
  <label
    class="z-radio flex items-center text-vanilla-100"
    :class="isDisabled || isReadOnly ? 'cursor-not-allowed' : 'cursor-pointer'"
    @click="updateInput"
  >
    <span
      class="z-radio--inner relative box-border inline-block h-4 w-4 cursor-pointer rounded-full border-2 border-solid"
      :class="{
        'border-slate bg-slate': isDisabled && isChecked,
        'border-juniper bg-juniper': !isDisabled && isChecked,
        'border-slate bg-transparent': !isChecked,
        'cursor-not-allowed hover:border-slate': isDisabled || isReadOnly,
        'cursor-pointer hover:border-juniper': !isDisabled,
        'opacity-80': isReadOnly
      }"
    >
      <span
        v-if="isChecked"
        class="absolute left-50 top-50 h-2 w-2 -translate-x-1/2 -translate-y-1/2 transform rounded-full"
        :class="isDisabled ? 'bg-vanilla-400' : 'bg-vanilla-100'"
      >
      </span>
    </span>
    <input
      type="radio"
      :checked="isChecked"
      :value="value"
      :disabled="isDisabled || isReadOnly"
      class="absolute h-0 w-0 opacity-0"
      @change="updateInput"
    />
    <span
      class="label ml-2"
      :class="{
        'text-slate': isDisabled,
        'text-vanilla-300': isReadOnly,
        'cursor-not-allowed': isDisabled || isReadOnly,
        'cursor-pointer': !isDisabled && !isReadOnly
      }"
    >
      {{ label }}
    </span>
  </label>
</template>

<script>
export default {
  name: 'ZRadio',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      required: true
    },
    value: {
      type: String
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
  computed: {
    modelData() {
      const $parent = this.$parent
      return ($parent && $parent.modelValue) || this.modelValue
    },
    isChecked() {
      return this.modelData === this.value
    },
    isDisabled() {
      const $parent = this.$parent
      return ($parent && $parent.disabled) || this.disabled
    },
    isReadOnly() {
      const $parent = this.$parent
      return ($parent && $parent.readOnly) || this.readOnly
    }
  },
  methods: {
    updateInput() {
      const $parent = this.$parent
      if (!this.isDisabled && !this.isReadOnly) {
        $parent.value = this.value
      }
    }
  }
}
</script>
