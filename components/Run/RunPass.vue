<template>
  <base-state title="No issues found in this check">
    <template slot="hero">
      <div class="mb-4 text-3xl text-center">🎉</div>
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
