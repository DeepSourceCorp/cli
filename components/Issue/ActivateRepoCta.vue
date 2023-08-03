<template>
  <div class="rounded-md p-px bg-gradient-dawn">
    <div class="rounded-md bg-ink-300 from-ink-200 via-ink-300 to-ink-400 p-3">
      <h4 class="font-medium leading-tight">Activate continuous analysis</h4>
      <p class="mt-2 text-xs font-medium leading-snug">
        <span
          class="bg-gradient-to-br from-ink-200 via-ink-300 to-ink-400 bg-clip-text text-vanilla-100 text-opacity-60"
        >
          To run analysis on every commit automatically, commit the configuration to your
          repository.
        </span>
      </p>
      <z-button
        v-if="repository.isCommitPossible || repository.isAutofixEnabled"
        size="small"
        icon="play-circle"
        class="mt-4 w-full bg-robin hover:bg-robin-600"
        color="vanilla-200"
        label="Activate analysis"
        @click="isActivationModalOpen = true"
      />
      <nuxt-link v-else :to="$generateRoute(['generate-config'])">
        <z-button
          size="small"
          icon="play-circle"
          class="mt-4 w-full bg-robin hover:bg-robin-600"
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
import { Repository } from '~/types/types'

/**
 * Component to add CTA to activate repository with pending .toml commit (adhoc run)
 */
@Component({ name: 'ActivateRepoCta' })
export default class ActivateRepoCta extends Vue {
  @Prop({ required: true })
  repository: Repository

  isActivationModalOpen = false
}
</script>
