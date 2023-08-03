<template>
  <div
    class="inline-flex w-full gap-x-1.5 border-b border-ink-200 bg-ink-300 p-3 text-sm text-vanilla-400 sm:items-center"
  >
    <z-icon
      icon="artifact"
      size="x-small"
      class="mt-1 inline-block flex-shrink-0 sm:mt-0 sm:hidden"
    />
    <z-icon
      icon="artifact"
      size="small"
      class="mt-1 hidden flex-shrink-0 sm:mt-0 sm:inline-block"
    />
    <span>
      This check was inferred using the coverage report sent for
      <a
        :href="vcsUrl"
        target="_blank"
        rel="noreferrer noopener"
        class="inline-flex items-center text-vanilla-100 hover:cursor-pointer hover:underline"
      >
        PR #{{ number }}
        <z-icon
          icon="arrow-up-right"
          size="x-small"
          class="mt-1 inline-block flex-shrink-0 sm:hidden"
        />
        <z-icon
          icon="arrow-up-right"
          size="small"
          class="mt-0.5 hidden flex-shrink-0 sm:inline-block"
        />
      </a>
    </span>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component({ name: 'InferredArtifact' })
export default class InferredArtifact extends Vue {
  @Prop({ required: true })
  vcsUrl: string

  @Prop({ required: true })
  number: string
}
</script>
