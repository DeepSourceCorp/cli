<template>
  <input-wrapper
    :label="label"
    :description="description"
    :inputId="inputId"
    :inputWidth="inputWidth"
    :cascadeInput="true"
  >
    <template slot="label">
      <slot name="label"></slot>
    </template>
    <template slot="description">
      <slot name="description"></slot>
    </template>
    <div class="text-left md:text-right">
      <slot>
        <nuxt-link v-if="to" :to="to">
          <z-button :buttonType="buttonType" size="small" :icon="icon">
            {{ buttonLabel }}
          </z-button>
        </nuxt-link>
        <z-button v-else :buttonType="buttonType" size="small" :icon="icon" @click="triggerClick">
          {{ buttonLabel }}
        </z-button>
      </slot>
    </div>
  </input-wrapper>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import InputWrapper from './InputWrapper.vue'
import { ZButton } from '@deepsourcelabs/zeal'

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

  triggerClick(event: Event) {
    this.$emit('click', event)
  }
}
</script>
