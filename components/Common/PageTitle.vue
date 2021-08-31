<template>
  <div class="flex justify-between items-start mb-6">
    <div class="space-y-2">
      <div class="flex items-center space-x-2">
        <h2 class="text-lg font-medium">
          <slot name="title">{{ title }}</slot>
        </h2>
        <slot name="title-info"></slot>
      </div>
      <p class="max-w-md text-xs text-vanilla-400">
        <slot name="description">{{ description }} </slot>
      </p>
    </div>
    <div class="flex items-center space-x-3">
      <slot name="actions"></slot>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'

@Component
export default class PageTitle extends Vue {
  @Prop()
  title!: string

  @Prop()
  description!: string
}
</script>
