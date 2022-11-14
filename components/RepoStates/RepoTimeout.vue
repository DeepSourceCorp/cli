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
        v-if="!activateLoading"
        icon="repeat"
        size="small"
        class="mt-4"
        data-testid="activate-analysis"
        @click="activateAnalysis"
      >
        Re-run analysis
      </z-button>
      <z-button v-else size="small" class="mt-4">
        <z-icon class="animate-spin" icon="spin-loader" color="ink"></z-icon>
        <span>Triggering Run</span>
      </z-button>
    </template>
  </empty-state>
</template>
<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import { ZButton, ZIcon } from '@deepsourcelabs/zeal'
import { BaseState } from '.'
import { Repository } from '~/types/types'
import RepoDetailMixin from '~/mixins/repoDetailMixin'

@Component({
  components: {
    BaseState,
    ZButton,
    ZIcon
  }
})
export default class RepoInactive extends mixins(RepoDetailMixin) {
  @Prop()
  id: Repository['id']

  @Prop()
  name: Repository['name']

  activateLoading = false

  async activateAnalysis(): Promise<void> {
    this.activateLoading = true
    await this.toggleRepoActivation({
      isActivated: true,
      id: this.id
    })
    this.activateLoading = false
    this.$toast.success(`Triggered run for ${this.name}, this might take a while`)
    this.$emit('refetch')
  }
}
</script>
