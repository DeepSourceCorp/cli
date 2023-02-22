<template>
  <div
    class="w-full inline-flex gap-x-1.5 sm:items-center bg-ink-300 p-3 text-sm text-vanilla-400 border-b border-ink-200"
  >
    <z-icon
      icon="artifact"
      size="x-small"
      class="flex-shrink-0 mt-1 sm:mt-0 inline-block sm:hidden"
    />
    <z-icon
      icon="artifact"
      size="small"
      class="flex-shrink-0 mt-1 sm:mt-0 hidden sm:inline-block"
    />
    <span>
      This check was inferred using the coverage report sent for
      <a
        :href="vcsUrl"
        target="_blank"
        rel="noreferrer noopener"
        class="inline-flex items-center text-vanilla-100 hover:underline hover:cursor-pointer"
      >
        PR #{{ number }}
        <z-icon
          icon="arrow-up-right"
          size="x-small"
          class="flex-shrink-0 mt-1 inline-block sm:hidden"
        />
        <z-icon
          icon="arrow-up-right"
          size="small"
          class="flex-shrink-0 mt-0.5 hidden sm:inline-block"
        />
      </a>
    </span>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsource/zeal'

@Component({ name: 'InferredArtifact', components: { ZIcon } })
export default class InferredArtifact extends Vue {
  @Prop({ required: true })
  vcsUrl: string

  @Prop({ required: true })
  number: string
}
</script>
