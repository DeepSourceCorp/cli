<template>
  <input-wrapper
    :label="label"
    :description="description"
    :input-id="inputId"
    :input-width="inputWidth"
  >
    <div>
      <z-radio-group
        :id="inputId"
        v-model="modelValue"
        :disabled="disabled"
        :read-only="readOnly"
        class="space-y-5"
        @change="$emit('change')"
      >
        <div v-for="opt in options" :key="opt.value" class="space-y-1 text-sm">
          <div class="inline-flex gap-x-2">
            <z-radio :value="opt.value" :label="opt.label" />
            <z-tag
              v-if="opt.badgeText"
              bg-color="ink-100"
              text-size="xs"
              spacing="px-2 py-1"
              class="font-semibold leading-none tracking-wider uppercase text-vanilla-200"
            >
              {{ opt.badgeText }}
            </z-tag>
          </div>
          <p
            v-if="opt.description"
            class="ml-6 text-xs leading-5 text-vanilla-400"
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
import { ZRadioGroup, ZRadio, ZTag } from '@deepsource/zeal'
import { ModelSync } from 'vue-property-decorator'

@Component({
  components: {
    InputWrapper,
    ZRadioGroup,
    ZRadio,
    ZTag
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

  @Prop({ default: false })
  disabled: boolean

  @Prop({ default: false })
  readOnly: boolean
}
</script>
