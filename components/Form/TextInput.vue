<template>
  <input-wrapper
    :label="label"
    :description="description"
    :input-id="inputId"
    :input-width="inputWidth"
    :cascade-input="cascadeInput"
  >
    <template #label>
      <slot name="label"></slot>
    </template>
    <template #description>
      <slot name="description"></slot>
    </template>
    <div>
      <z-input
        :id="inputId"
        v-model="modelValue"
        :disabled="disabled"
        :read-only="readOnly"
        class="px-2"
        size="small"
        @blur="triggerBlur"
      />
    </div>
  </input-wrapper>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import InputWrapper from './InputWrapper.vue'
import { ModelSync } from 'vue-property-decorator'

@Component({
  components: {
    InputWrapper
  }
})
export default class TextInput extends Vue {
  @ModelSync('input', 'value', { type: String || Number })
  readonly modelValue: string | number

  @Prop({ required: true })
  label: string

  @Prop({ default: '' })
  description: string

  @Prop({ required: true })
  inputId: string

  @Prop({ default: 'small' })
  inputWidth: string

  @Prop({ default: false })
  disabled: boolean

  @Prop({ default: false })
  readOnly: boolean

  @Prop({ default: false })
  cascadeInput: boolean

  triggerBlur(ev: InputEvent): void {
    this.$emit('blur', ev)
  }
}
</script>
