<template>
  <div class="inline-flex items-center gap-x-2">
    <!-- Loading state for integration logo -->
    <div
      v-if="pending"
      :class="[loadingStateDimensions, 'bg-opacity-50 rounded-md animate-pulse bg-ink-200']"
    ></div>
    <logo-container v-else :logo="logo" />

    <h2 class="text-base font-medium text-vanilla-100">{{ name }}</h2>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component({})

/**
 * Component that is responsible to render the integration logo and name on detailed view
 */
export default class IntegrationTitle extends Vue {
  @Prop({ default: false })
  pending: boolean

  @Prop({ default: 'w-6 h-6' })
  loadingStateDimensions: string

  @Prop({ required: true })
  logo: string

  @Prop({ required: true })
  name: string
}
</script>
