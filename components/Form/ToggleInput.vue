<template>
  <input-wrapper
    :label="label"
    :removeYPadding="removeYPadding"
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
    <div class="text-right">
      <z-toggle :id="inputId" v-model="modelValue" :disabled="disabled"></z-toggle>
    </div>
  </input-wrapper>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import InputWrapper from './InputWrapper.vue'
import { ZToggle } from '@deepsourcelabs/zeal'
import { ModelSync } from 'vue-property-decorator'

@Component({
  components: {
    InputWrapper,
    ZToggle
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

  @Prop({ default: false })
  removeYPadding: boolean

  @Prop({ default: false })
  disabled: boolean
}
</script>
