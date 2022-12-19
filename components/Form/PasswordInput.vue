<template>
  <input-wrapper
    :label="label"
    :description="description"
    :input-id="inputId"
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
        :type="showPassword ? 'text' : 'password'"
        placeholder="A randomly generated secret with at least 16 characters"
        :disabled="disabled"
        :read-only="readOnly"
        :value="value"
        size="small"
        class="px-2"
        @blur="triggerBlur"
      />
      <slot name="input-utilities">
        <password-strength
          v-if="modelValue && showStrength && !(disabled || readOnly)"
          size="small"
          class="absolute top-1 right-1 bg-ink-400 pl-0.5"
          :password="modelValue"
        />
      </slot>
    </div>
  </input-wrapper>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import InputWrapper from './InputWrapper.vue'
import { ZInput } from '@deepsource/zeal'
import { ModelSync } from 'vue-property-decorator'

@Component({
  components: {
    InputWrapper,
    ZInput
  },
  name: 'PasswordInput'
})
export default class PasswordInput extends Vue {
  @ModelSync('value', 'input', { type: [String, Number] })
  readonly modelValue: [string, number]

  @Prop({ required: true })
  label: string

  @Prop({ default: '' })
  value: string

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

  @Prop({ default: false })
  showPassword: boolean

  triggerBlur(ev: InputEvent): void {
    this.$emit('blur', ev)
  }
}
</script>
