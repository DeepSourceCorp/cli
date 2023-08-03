<template>
  <empty-state
    use-v2
    show-border
    :webp-image-path="require('~/assets/images/ui-states/timeout/timeout-state-136px.webp')"
    :png-image-path="require('~/assets/images/ui-states/timeout/timeout-state-136px.gif')"
    title="Analysis timed out"
    subtitle="We had to cancel this analysis as it took too long to finish. Try making another commit on this branch to retry."
    width="w-26"
    content-width="max-w-sm"
  >
    <template #subtitle>
      <p class="max-w-xl">
        We were not able to finish the analysis in time. This can happen if there are too many files
        to analyze. Please give it another shot.
      </p>
    </template>

    <template #action>
      <z-button
        :is-loading="activateAnalysisLoading"
        :disabled="activateAnalysisLoading"
        icon="repeat"
        label="Re-run analysis"
        loading-label="Triggering Run"
        size="small"
        class="mt-4"
        @click="$emit('activate-analysis', { showSuccessToast: true })"
      />
    </template>
  </empty-state>
</template>
<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import { Repository } from '~/types/types'
import RepoDetailMixin from '~/mixins/repoDetailMixin'

@Component({
  name: 'RepoTimeout'
})
export default class RepoTimeout extends mixins(RepoDetailMixin) {
  @Prop()
  id: Repository['id']

  @Prop()
  name: Repository['name']

  @Prop({ default: false })
  activateAnalysisLoading: boolean
}
</script>
