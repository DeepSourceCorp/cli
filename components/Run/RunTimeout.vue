<template>
  <empty-state
    :webp-image-path="require('~/assets/images/ui-states/timeout/timeout-state-136px.webp')"
    :png-image-path="require('~/assets/images/ui-states/timeout/timeout-state-136px.gif')"
    :show-border="false"
    title="Analysis timed out"
    subtitle="We had to cancel this analysis as it took too long to finish. Try making another commit on this branch to retry."
  />
</template>
<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

/**
 * ? Timeout empty state for Analyzer runs.
 */
@Component({})
export default class RunTimeout extends Vue {}
</script>
