<template>
  <label class="space-y-2">
    <div class="text-xs leading-8">
      <slot name="displayName">{{ displayName }}</slot>
    </div>
    <slot></slot>
    <div v-if="helperText || $slots.helperText" class="text-xs leading-6 text-vanilla-400">
      <slot name="helperText">{{ helperText }}</slot>
    </div>
  </label>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Maybe } from '~/types/types'

@Component({ name: 'SupportFormLabel' })
export default class SupportFormLabel extends Vue {
  @Prop({ type: String, default: '' })
  displayName: string

  @Prop({ type: String, default: null })
  helperText: Maybe<string>
}
</script>
