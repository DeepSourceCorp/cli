<template>
  <base-state title="Analysis cancelled">
    <template slot="hero">
      <empty-state-picture
        :webp-image-path="require('~/assets/images/ui-states/repo/run-cancelled.webp')"
        :png-image-path="require('~/assets/images/ui-states/repo/run-cancelled.png')"
        width="w-26"
        class="mx-auto mb-4"
        alt-text="Analysis cancelled"
      />
    </template>
    <span class="text-vanilla-400"
      >This analysis run did not complete and was cancelled due to an error.</span
    >
  </base-state>
</template>
<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { BaseState } from '@/components/RepoStates'

/**
 * ? Cancelled empty state for Analyzer runs.
 */
@Component({ components: { BaseState } })
export default class RunCancelled extends Vue {}
</script>
