<template>
  <input-wrapper
    :label="label"
    :description="description"
    :input-id="inputId"
    :remove-y-padding="removeYPadding"
    :input-width="inputWidth"
  >
    <template slot="label">
      <slot name="label"></slot>
    </template>
    <template slot="description">
      <slot name="description"></slot>
    </template>
    <div>
      <div class="h-8">
        <div v-if="isLoading" class="h-8 bg-opacity-50 rounded-md animate-pulse bg-ink-200"></div>
        <z-select
          v-else
          ref="select-input"
          :key="modelValue"
          v-model="modelValue"
          :placeholder="placeholder"
          :disabled="disabled"
          spacing="py-1 px-2"
          class="text-sm"
        >
          <z-option
            v-for="opt in options"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
            class="truncate"
          />
        </z-select>
      </div>
      <p v-if="isInvalid && errorMessage && !isLoading" class="mt-1 ml-0.5 text-xs text-cherry">
        {{ errorMessage }}
      </p>
    </div>
  </input-wrapper>
</template>
<script lang="ts">
import { Vue, Component, Prop, Ref, Watch } from 'nuxt-property-decorator'
import InputWrapper from './InputWrapper.vue'
import { ZSelect, ZOption, ZIcon } from '@deepsource/zeal'
import { ModelSync } from 'vue-property-decorator'

export interface SelectComponent extends Vue {
  clearSelected(): void
}

@Component({
  components: {
    InputWrapper,
    ZSelect,
    ZOption,
    ZIcon
  }
})
export default class TextInput extends Vue {
  @ModelSync('input', 'value', { type: String || Number })
  readonly modelValue: string | number

  @Prop({ required: true })
  label: string

  @Prop({ default: '' })
  description: string

  @Prop({ default: false })
  disabled: boolean

  @Prop({ required: true })
  inputId: string

  @Prop({ default: 'small' })
  inputWidth: string

  @Prop({ default: false })
  isInvalid: boolean

  @Prop({ default: false })
  removeYPadding: boolean

  @Prop({ default: '' })
  errorMessage: string

  @Prop({ default: 'Select an option' })
  placeholder: string

  @Prop({ required: true })
  options: { value: string; label: string }[]

  @Prop({ default: false })
  isLoading: boolean

  @Ref('select-input')
  selectComponent: SelectComponent

  /**
   * Reset component if the model value is set to empty
   *
   * @return {void}
   */
  @Watch('modelValue')
  resetSelect(): void {
    if (this.modelValue === '') this.selectComponent.clearSelected()
  }
}
</script>
