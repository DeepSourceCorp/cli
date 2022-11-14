<template>
  <empty-state
    :webp-image-path="require('~/assets/images/ui-states/timeout/timeout-state-136px.webp')"
    :png-image-path="require('~/assets/images/ui-states/timeout/timeout-state-136px.gif')"
    title="Artifacts not received in time"
    subtitle="We had to cancel this analysis as we didn't receive additional artifacts or reports required by the Analyzer in time. Try making another commit on this branch to retry."
  />
</template>
<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { BaseState } from '@/components/RepoStates'

/**
 * ? Nuked empty state for Analyzer runs.
 * ? Indicates that run was awaiting artifacts which were never received and was forcefully timed out.
 */
@Component({ components: { BaseState } })
export default class RunNuked extends Vue {}
</script>
