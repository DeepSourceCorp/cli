<template>
  <input-wrapper
    :label="label"
    :description="description"
    :inputId="inputId"
    :inputWidth="inputWidth"
  >
    <div>
      <z-radio-group v-model="modelValue" @change="$emit('change')" :id="inputId" class="space-y-5">
        <div class="text-sm space-y-1" v-for="opt in options" :key="opt.value">
          <z-radio :value="opt.value" :label="opt.label"></z-radio>
          <p
            v-if="opt.description"
            class="text-xs text-vanilla-400 ml-6 leading-5"
            v-html="opt.description"
          ></p>
        </div>
      </z-radio-group>
    </div>
  </input-wrapper>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import InputWrapper from './InputWrapper.vue'
import { ZRadioGroup, ZRadio } from '@deepsourcelabs/zeal'
import { ModelSync } from 'vue-property-decorator'

@Component({
  components: {
    InputWrapper,
    ZRadioGroup,
    ZRadio
  }
})
export default class RadioGroupInput extends Vue {
  @ModelSync('input', 'value', { type: String || Number })
  readonly modelValue: string | number

  @Prop({ required: true })
  options: Record<string, string>[]

  @Prop({ required: true })
  label: string

  @Prop({ default: '' })
  description: string

  @Prop({ required: true })
  inputId: string

  @Prop({ default: 'small' })
  inputWidth: string
}
</script>
