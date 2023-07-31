<template>
  <z-modal :title="computedBindings.title" @onClose="$emit('close')">
    <div class="space-y-5 p-4 text-xs text-vanilla-100">
      <p>
        Converting <span class="highlight-name">{{ repoName }}</span> to a monorepo on
        {{ teamName }}
        would :
      </p>

      <div
        v-for="warning in computedBindings.warnings"
        :key="warning"
        class="flex w-full items-start gap-2"
      >
        <z-icon
          :color="computedBindings.iconColor"
          icon="alert-circle"
          size="x-small"
          class="mt-1 flex-shrink-0"
        />

        <span>
          {{ warning }}
        </span>
      </div>

      <div class="space-y-2">
        <label for="monorepo-validation-text" class="text-vanilla-400">
          Please type
          <span class="highlight-name">{{ validationText }}</span>
          to confirm this action
        </label>
        <z-input
          id="monorepo-validation-text"
          v-model="enteredName"
          :placeholder="validationText"
          :is-invalid="enteredName.length > 0 && enteredName.trim() !== validationText"
          :show-border="false"
          :class="{
            'border border-ink-200': !enteredName.length || enteredName === validationText
          }"
        />
      </div>
    </div>
    <template #footer="{ close }">
      <div class="p-4 pt-0 text-right">
        <z-button
          v-bind="computedBindings.confirmButtonBindings"
          :is-loading="togglingMonorepoMode"
          :disabled="enteredName.trim() !== validationText || togglingMonorepoMode"
          icon="check"
          size="small"
          @click="$emit('toggle-monorepo', close)"
        />
      </div>
    </template>
  </z-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { ZIcon, ZButton, ZModal, ZInput } from '@deepsource/zeal'

@Component({
  components: {
    ZButton,
    ZIcon,
    ZInput,
    ZModal
  }
})
export default class ToggleMonorepoConfirm extends Vue {
  @Prop({ required: true })
  isMonorepo: boolean

  @Prop({ required: true })
  teamName: string

  @Prop({ required: true })
  repoName: string

  @Prop({ default: false })
  togglingMonorepoMode: boolean

  enteredName = ''

  get computedBindings() {
    if (this.isMonorepo) {
      return {
        title: 'Disable monorepo mode',
        warnings: [
          'Switch your monorepo to a normal repository and all the data related to your projects would be deleted.',
          'A new analysis run will be triggered for the repository.'
        ],
        iconColor: 'cherry-500',
        confirmButtonBindings: {
          'button-type': 'danger',
          label: 'Disable monorepo mode',
          'loading-label': 'Disabling monorepo mode'
        }
      }
    }

    return {
      title: 'Convert to monorepo',
      warnings: [
        'Erase all data related to this repository. Fresh analysis would be triggered for projects inside the monorepo.',
        'The repository will be marked as a monorepo and you would be able to mark folders inside the repository as Projects.'
      ],
      iconColor: 'juniper-500',
      confirmButtonBindings: {
        'button-type': 'primary',
        label: 'Convert to monorepo',
        'loading-label': 'Converting to monorepo'
      }
    }
  }

  get validationText(): string {
    return `${this.teamName}/${this.repoName}`
  }
}
</script>

<style scoped lang="postcss">
.highlight-name {
  @apply rounded-sm bg-vanilla-100 bg-opacity-10 px-1 py-0.5 text-xs text-vanilla-100;
}
</style>
