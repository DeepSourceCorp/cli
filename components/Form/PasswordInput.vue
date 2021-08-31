<template>
  <input-wrapper
    :label="label"
    :description="description"
    :inputId="inputId"
    :inputWidth="inputWidth"
  >
    <template slot="label">
      <slot name="label"></slot>
    </template>
    <template slot="description">
      <slot name="description"></slot>
    </template>
    <div class="relative">
      <z-input
        :id="inputId"
        v-model="modelValue"
        type="password"
        placeholder="A randomly generated secret with at least 16 characters"
        :disabled="disabled"
        :readOnly="readOnly"
        @blur="triggerBlur"
        class="px-2"
        size="small"
      ></z-input>
      <password-strength
        v-if="modelValue && showStrength && !(disabled || readOnly)"
        size="small"
        class="absolute top-1 right-1 bg-ink-400 pl-0.5"
        :password="modelValue"
      />
    </div>
  </input-wrapper>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import InputWrapper from './InputWrapper.vue'
import { ZInput } from '@deepsourcelabs/zeal'
import { ModelSync } from 'vue-property-decorator'

@Component({
  components: {
    InputWrapper,
    ZInput
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

  @Prop({ default: true })
  showStrength: boolean

  triggerBlur(ev: InputEvent): void {
    this.$emit('blur', ev)
  }
}
</script>
