<template>
  <input-wrapper
    :label="label"
    :description="description"
    :input-id="inputId"
    :input-width="inputWidth"
  >
    <div class="flex space-x-4">
      <img class="h-15 w-15 rounded-md" :src="value" :alt="label" />
      <div class="space-y-2">
        <z-button button-type="secondary" size="small">{{ buttonLabel }}</z-button>
        <p class="text-xs text-vanilla-400">.JPG or .PNG, atleast 256px.</p>
      </div>
    </div>
  </input-wrapper>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import InputWrapper from './InputWrapper.vue'

@Component({
  components: {
    InputWrapper
  }
})
export default class ImageInput extends Vue {
  @Prop({ required: true })
  value: string

  @Prop({ required: true })
  label: string

  @Prop({ default: 'Upload' })
  buttonLabel: string

  @Prop({ default: 'small' })
  inputWidth: string
}
</script>
