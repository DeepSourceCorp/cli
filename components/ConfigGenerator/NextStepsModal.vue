<template>
  <ZModal
    v-if="showModal"
    title="Follow these steps to start the analysis"
    @onClose="$emit('close')"
  >
    <div class="text-sm font-normal space-y-4">
      <div class="flex space-x-2 items-start p-4">
        <div class="flex-grow text-vanilla-400">
          <p>
            The default branch on this repository has branch protection enabled, so we're not able
            to automatically add the configuration file. Please follow these steps to configure the
            analysis manually.
          </p>
        </div>
      </div>
      <z-stepper align="vertical" :showNumbers="true" class="w-full px-4">
        <z-step v-for="step in steps" :key="step.title" class="w-full">
          <template slot="title">
            <h3 class="text-vanilla-100 font-base uppercase tracking-wide text-xs font-semibold">
              {{ step.title }}
            </h3>
          </template>
          <template slot="description">
            <p class="text-sm font-normal text-vanilla-400" v-html="step.description"></p>
          </template>
        </z-step>
      </z-stepper>
    </div>
    <template slot="footer">
      <div class="p-4 space-x-4 text-right text-vanilla-100 border-ink-200">
        <z-button
          class="modal-primary-action"
          size="small"
          buttonType="primary"
          :actionDisabled="actionDisabled"
          @click="triggerAction"
          >I’ve added .deepsource.toml to my repository</z-button
        >
      </div>
    </template>
  </ZModal>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon, ZModal, ZButton, ZStep, ZStepper, ZDivider } from '@deepsourcelabs/zeal'

@Component({
  components: {
    ZIcon,
    ZModal,
    ZButton,
    ZStep,
    ZStepper,
    ZDivider
  },
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
