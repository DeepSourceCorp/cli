<template>
  <empty-state
    :webp-image-path="require('~/assets/images/ui-states/issues/no-issues-found-static-140px.webp')"
    :png-image-path="require('~/assets/images/ui-states/issues/no-issues-found-static-140px.png')"
    :show-border="false"
    title="No issues found in this check"
    subtitle="Give yourself a cookie."
  />
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
