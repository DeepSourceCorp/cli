<template>
  <div class="grid gap-4" :class="[gridClass, removeYPadding ? '' : 'py-4']">
    <div :class="{ 'col-span-full md:col-auto': cascadeInput }">
      <label
        :for="inputId"
        class="text-sm text-vanilla-100"
        :class="{
          'mb-1 block': description || $slots.description
        }"
      >
        <slot name="label"> {{ label }} </slot>
      </label>
      <div class="text-xs text-vanilla-400 leading-5">
        <slot name="description">
          <p v-html="description"></p>
        </slot>
      </div>
    </div>
    <slot></slot>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component({})
export default class InputWrapper extends Vue {
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

  //TODO: Phase out prop with responsive behavior for all inputs
  @Prop({ default: false })
  cascadeInput: boolean

  get gridClass(): string {
    if (this.inputWidth === 'xx-small') return 'grid-cols-fr-8'
    if (this.inputWidth === 'x-small') return 'grid-cols-fr-12'
    if (this.inputWidth === 'small') return 'grid-cols-fr-16'
    if (this.inputWidth === 'base') return 'grid-cols-fr-20'
    if (this.inputWidth === 'wide') return 'grid-cols-fr-24'

    return 'grid-cols-fr-16'
  }
}
</script>
