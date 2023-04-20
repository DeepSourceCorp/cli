<template>
  <input-wrapper
    :label="label"
    :description="description"
    :input-id="inputId"
    :input-width="inputWidth"
    :remove-y-padding="removeYPadding"
    :cascade-input="true"
  >
    <template #label>
      <slot name="label"></slot>
    </template>
    <template #description>
      <slot name="description"></slot>
    </template>
    <div class="text-left md:text-right" :class="fullWidth && 'col-span-full md:col-span-1'">
      <slot>
        <nuxt-link v-if="to" :to="to">
          <z-button
            :button-type="buttonType"
            size="small"
            :icon="icon"
            :full-width="fullWidth"
            :class="fullWidth && 'h-10 md:h-8'"
          >
            {{ buttonLabel }}
          </z-button>
        </nuxt-link>
        <z-button
          v-else
          :button-type="buttonType"
          size="small"
          :icon="icon"
          :full-width="fullWidth"
          :class="fullWidth && 'h-10 md:h-8'"
          @click="triggerClick"
        >
          {{ buttonLabel }}
        </z-button>
      </slot>
    </div>
  </input-wrapper>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import InputWrapper from './InputWrapper.vue'
import { ZButton } from '@deepsource/zeal'

@Component({
  components: {
    InputWrapper,
    ZButton
  }
})
export default class ButtonInput extends Vue {
  @Prop({ required: true })
  label: string

  @Prop({ default: '' })
  description: string

  @Prop({ required: true })
  inputId: string

  @Prop({ default: 'Continue' })
  buttonLabel: string

  @Prop({ default: 'small' })
  inputWidth: string

  @Prop({ default: 'secondary' })
  buttonType: string

  @Prop({ default: null })
  to: string

  @Prop({ default: null })
  icon: string

  @Prop({ default: false })
  fullWidth: boolean

  @Prop({ default: false })
  removeYPadding: boolean

  triggerClick(event: Event) {
    this.$emit('click', event)
  }
}
</script>
