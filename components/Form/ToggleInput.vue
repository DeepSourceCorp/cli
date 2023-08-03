<template>
  <input-wrapper
    :label="label"
    :remove-y-padding="removeYPadding"
    :description="description"
    :input-id="inputId"
    :input-width="inputWidth"
  >
    <template #label>
      <slot name="label"></slot>
    </template>
    <template #description>
      <slot name="description"></slot>
    </template>
    <div class="text-right">
      <z-toggle :id="inputId" v-model="modelValue" :disabled="disabled" :class="toggleClass" />
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
export default class ToggleInput extends Vue {
  @ModelSync('value', 'input', { type: [String, Number, Boolean] })
  readonly modelValue: [string, number, boolean]

  @Prop({ required: true })
  label: string

  @Prop({ default: '' })
  description: string

  @Prop({ required: true })
  inputId: string

  @Prop({ default: 'small' })
  inputWidth: string

  @Prop({ default: '' })
  toggleClass: string

  @Prop({ default: false })
  removeYPadding: boolean

  @Prop({ default: false })
  disabled: boolean
}
</script>
