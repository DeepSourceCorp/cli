<template>
  <div class="p-px rounded-md bg-gradient-dawn">
    <div class="p-3 rounded-md bg-ink-300 from-ink-200 to-ink-400 via-ink-300">
      <h4 class="font-medium leading-tight">Activate continuous analysis</h4>
      <p class="mt-2 text-xs font-medium leading-snug">
        <span
          class="text-opacity-60 bg-clip-text text-vanilla-100 bg-gradient-to-br from-ink-200 to-ink-400 via-ink-300"
        >
          To run analysis on every commit automatically, commit the configuration to your
          repository.
        </span>
      </p>
      <z-button
        v-if="repository.isCommitPossible || repository.isAutofixEnabled"
        @click="isActivationModalOpen = true"
        size="small"
        icon="play-circle"
        class="w-full mt-4 bg-robin hover:bg-robin-600"
        color="vanilla-200"
        label="Activate analysis"
      />
      <nuxt-link v-else :to="$generateRoute(['generate-config'])">
        <z-button
          size="small"
          icon="play-circle"
          class="w-full mt-4 bg-robin hover:bg-robin-600"
          color="vanilla-200"
          label="Activate analysis"
        />
      </nuxt-link>
    </div>
    <activate-analysis-modal v-if="isActivationModalOpen" @close="isActivationModalOpen = false" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'
import { ZButton } from '@deepsourcelabs/zeal'
import { Repository } from '~/types/types'

/**
 * Component to add CTA to activate repository with pending .toml commit (adhoc run)
 */
@Component({ components: { ZButton }, name: 'ActivateRepoCta' })
export default class ActivateRepoCta extends Vue {
  @Prop({ required: true })
  repository: Repository

  isActivationModalOpen = false
}
</script>
