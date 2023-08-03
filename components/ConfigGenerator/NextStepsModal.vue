<template>
  <ZModal
    v-if="showModal"
    title="Follow these steps to start the analysis"
    @onClose="$emit('close')"
  >
    <div class="space-y-4 text-sm font-normal">
      <div class="flex items-start space-x-2 p-4">
        <div class="flex-grow text-vanilla-400">
          <p>
            The default branch on this repository has branch protection enabled, so we're not able
            to automatically add the configuration file. Please follow these steps to configure the
            analysis manually.
          </p>
        </div>
      </div>
      <z-stepper align="vertical" :show-numbers="true" class="w-full px-4">
        <z-step v-for="step in steps" :key="step.title" class="w-full">
          <template #title>
            <h3 class="font-base text-xs font-semibold uppercase tracking-wide text-vanilla-100">
              {{ step.title }}
            </h3>
          </template>
          <template #description>
            <p class="text-sm font-normal text-vanilla-400" v-html="step.description"></p>
          </template>
        </z-step>
      </z-stepper>
    </div>
    <template #footer>
      <div class="space-x-4 border-slate-400 p-4 text-right text-vanilla-100">
        <z-button
          class="modal-primary-action"
          size="small"
          button-type="primary"
          :action-disabled="actionDisabled"
          @click="triggerAction"
          >I’ve added .deepsource.toml to my repository</z-button
        >
      </div>
    </template>
  </ZModal>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component({
  layout: 'dashboard'
})
export default class NextStepsModal extends Vue {
  @Prop({ default: false })
  showModal: boolean

  @Prop({ default: false })
  actionDisabled: boolean

  close(): void {
    this.$emit('close')
  }

  triggerAction(): void {
    this.$emit('activate')
  }

  private steps = [
    {
      title: 'Create the configuration file',
      description:
        'Create a new file called <span class="font-mono text-vanilla-300">.deepsource.toml</span> in the root folder of the repository. Make sure you’re on the default branch.'
    },
    {
      title: 'Commit to the default branch',
      description:
        'Paste the generated configuration in this file and commit it to the default branch.'
    },
    {
      title: 'Wait for the results',
      description:
        "The analysis should start automatically after the commit. Once the analysis is complete, you’ll be able to view all the issues we've found in the repository."
    }
  ]
}
</script>
