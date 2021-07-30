<template>
  <ZModal v-if="showModal" title="Follow these steps to start analysis" @onClose="$emit('close')">
    <div class="text-sm font-normal space-y-4">
      <div class="flex space-x-2 items-start p-4">
        <div class="flex-grow text-vanilla-400">
          <p>
            Complete these steps manually to start analysis, since automatically comitting to the
            master branch on this repository is not possible due to branch protection rules.
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
          >I’ve added deepsource.toml, move on to analysis</z-button
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
      title: 'Create Config TOML',
      description:
        'Create a new file called <span class="font-mono text-vanilla-300">.deepsource.toml</span> in the root folder of the repository. Make sure you’re on the master branch.'
    },
    {
      title: 'Commit to VCS',
      description:
        'Paste the generated configuration in this file. Create a new commit and push to remote.'
    },
    {
      title: 'Activate Analysis',
      description: 'Click on the “Activate analysis” button to start analyzing code.'
    }
  ]
}
</script>
