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
    <div>
      <z-select
        v-model="modelValue"
        :selected="modelValue"
        spacing="py-1"
        class="text-sm"
        @change="triggerChange"
      >
        <z-option v-for="opt in options" :key="opt.value" :label="opt.label" :value="opt.value">
        </z-option>
      </z-select>
    </div>
  </input-wrapper>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import InputWrapper from './InputWrapper.vue'
import { ZSelect, ZOption } from '@deepsourcelabs/zeal'
import { ModelSync } from 'vue-property-decorator'

@Component({
  components: {
    InputWrapper,
    ZSelect,
    ZOption
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

  @Prop({ required: true })
  options: { value: string; label: string }[]

  triggerChange() {
    this.$emit('change')
  }
}
</script>
