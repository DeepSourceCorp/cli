<template>
  <input-wrapper
    :label="label"
    :description="description"
    :inputId="inputId"
    :inputWidth="inputWidth"
  >
    <!-- TODO: Fix this magic component. -->
    <houdini v-model="modelValue" @change="$emit('change')" :id="inputId" class="space-y-5">
      <div class="text-sm space-y-1" v-for="opt in options" :key="opt.value">
        <z-checkbox
          :value="opt.value"
          :label="opt.label"
          v-model="modelValue[opt.value]"
          spacing="4"
          size="small"
        ></z-checkbox>
        <p
          v-if="opt.description"
          class="text-xs text-vanilla-400 ml-6 leading-5"
          v-html="opt.description"
        ></p>
      </div>
    </houdini>
  </input-wrapper>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import InputWrapper from './InputWrapper.vue'
import { ZCheckbox } from '@deepsourcelabs/zeal'
import { ModelSync } from 'vue-property-decorator'

@Component({
  components: {
    InputWrapper,
    ZCheckbox
  }
})
export default class CheckInput extends Vue {
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
