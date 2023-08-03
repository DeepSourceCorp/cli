<template>
  <div class="mx-auto max-w-4xl space-y-6">
    <div class="space-y-8 rounded-md bg-vanilla-100 p-12 text-ink-400">
      <div class="space-y-8 text-center text-lg font-bold">
        <h1>DEEPSOURCE</h1>
        <h2>PILOT EVALUATION AGREEMENT</h2>
      </div>

      <nuxt-content :document="content" />
    </div>

    <slot name="action"></slot>
  </div>
</template>

<script lang="ts">
import { FetchReturn } from '@nuxt/content/types/query-builder'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component({ name: 'PilotEvaluationAgreement' })
export default class PilotEvaluationAgreement extends Vue {
  @Prop({ required: true })
  content: FetchReturn | Array<FetchReturn>
}
</script>

<style lang="postcss">
.nuxt-content {
  @apply space-y-4 text-justify font-medium;

  h3 {
    font-size: 1.125rem;
  }

  p {
    @apply text-sm md:text-base;
  }

  span {
    @apply text-sm md:text-base;
  }

  a {
    @apply text-robin-500;
  }
}

@media screen and (max-width: 768px) {
  .nuxt-content h3 {
    @apply text-base;
  }
}
</style>
