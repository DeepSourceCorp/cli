<template>
  <base-state title="Run failed because of a failing metric">
    <template #hero>
      <empty-state-picture
        :webp-image-path="require('~/assets/images/ui-states/repo/run-failed.webp')"
        :png-image-path="require('~/assets/images/ui-states/repo/run-failed.png')"
        width="w-26"
        alt-text="Run failed"
        class="mx-auto mb-4"
      />
    </template>
    <slot></slot>
  </base-state>
</template>
<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { BaseState } from '@/components/RepoStates'

/**
 * Run Failed empty state for Analyzer runs.
 */
@Component({ components: { BaseState } })
export default class RunNuked extends Vue {}
</script>
