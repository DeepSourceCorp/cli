<template>
  <base-state title="Analysis timed out">
    <template slot="hero">
      <div class="text-4xl text-center mb-4">😴</div>
    </template>
    <div class="max-w-xl">
      <p>
        We were not able to finish the analysis in time. This can happen if there are too many files
        to analyze. Please give it another shot.
      </p>
      <z-button
        v-if="!activateLoading"
        @click="activateAnalysis"
        icon="repeat"
        size="small"
        class="mt-4"
      >
        Re-run analysis
      </z-button>
      <z-button v-else size="small" class="mt-4">
        <z-icon class="animate-spin" icon="spin-loader" color="ink"></z-icon>
        <span>Triggering Run</span>
      </z-button>
    </div>
  </base-state>
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
