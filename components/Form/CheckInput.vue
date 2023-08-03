<template>
  <input-wrapper
    :label="label"
    :description="description"
    :input-id="inputId"
    :input-width="inputWidth"
  >
    <!-- TODO: Fix this magic component. -->
    <houdini :id="inputId" v-model="modelValue" class="space-y-5" @change="$emit('change')">
      <div v-for="opt in options" :key="opt.value" class="space-y-1 text-sm">
        <z-checkbox
          v-model="modelValue[opt.value]"
          :value="opt.value"
          :label="opt.label"
          spacing="4"
          size="small"
        />
        <p
          v-if="opt.description"
          class="ml-6 text-xs leading-5 text-vanilla-400"
          v-html="opt.description"
        ></p>
      </div>
    </houdini>
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
