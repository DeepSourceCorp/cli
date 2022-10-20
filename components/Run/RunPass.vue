<template>
  <base-state title="No issues found in this check">
    <template slot="hero">
      <empty-state-picture
        :webp-image-path="
          require('~/assets/images/ui-states/issues/no-issues-found-static-140px.webp')
        "
        :png-image-path="
          require('~/assets/images/ui-states/issues/no-issues-found-static-140px.png')
        "
        width="w-26"
        alt-text="No issues found"
        class="mx-auto mb-6"
      />
    </template>
    <p>Give yourself a cookie.</p>
  </base-state>
</template>
<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { BaseState } from '@/components/RepoStates'

/**
 * ? Passed empty state for Analyzer runs. Indicates that there are no issues in the run.
 */
@Component({ components: { BaseState } })
export default class RunPass extends Vue {}
</script>
