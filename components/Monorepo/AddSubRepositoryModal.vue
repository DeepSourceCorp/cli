<template>
  <z-modal title="New sub-repository" width="narrow" @onClose="$emit('close')">
    <div class="space-y-4 p-4">
      <div class="space-y-2">
        <label for="git-branch" class="text-xs font-normal text-vanilla-400"
          >Enter your branch</label
        >
        <z-input
          v-model="branch"
          v-focus
          :show-border="false"
          icon="z-git-branch"
          name="git-branch"
          placeholder="main"
          size="small"
          class="border border-ink-50 focus-within:border-vanilla-400"
        >
          <template #left>
            <z-icon icon="z-git-branch" class="ml-1.5" />
          </template>
        </z-input>
      </div>

      <div class="space-y-2">
        <label for="sub-repository-path" class="text-xs font-normal text-vanilla-400"
          >Enter sub-repository path</label
        >
        <z-input-group
          v-model="subRepositoryPath"
          icon="z-git-branch"
          name="sub-repository-path"
          placeholder="Enter relative path"
          size="small"
        >
          <template #addon>
            <div class="inline-flex items-center gap-x-1">
              <z-icon icon="folder-open" class="mx-1 stroke-2" />

              <span>{{ monorepoName }} /</span>
            </div>
          </template>
        </z-input-group>
      </div>

      <z-alert v-if="showError" type="danger">{{ errorMsg }}</z-alert>

      <div class="w-full gap-x-1 text-right">
        <z-button :disabled="primaryActionLoading" size="small" @click="primaryActionHandler">
          <div class="inline-flex items-center gap-x-1">
            <span>Next</span>
            <z-icon
              :icon="primaryActionLoading ? 'spin-loader' : 'arrow-right'"
              color="current"
              :class="{ 'animate-spin': primaryActionLoading }"
            />
          </div>
        </z-button>
      </div>
    </div>
  </z-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { ZAlert, ZButton, ZIcon, ZInput, ZInputGroup, ZModal } from '@deepsource/zeal'

@Component({
  name: 'AddSubRepositoryModal',
  components: {
    ZAlert,
    ZButton,
    ZIcon,
    ZInput,
    ZInputGroup,
    ZModal
  }
})
export default class AddSubRepositoryModal extends Vue {
  @Prop({ default: false })
  primaryActionLoading: boolean

  @Prop({ default: false })
  showError: boolean

  @Prop({ default: 'Something went wrong while creating the sub-repository.' })
  errorMsg: string

  @Prop({ required: true })
  monorepoName: string

  @Prop({ required: true })
  monorepoDefaultBranch: string

  branch = ''
  subRepositoryPath = ''

  created() {
    // Populate branch field with the default branch name
    this.branch = this.monorepoDefaultBranch
  }

  primaryActionHandler() {
    this.$emit('primary', {
      branch: this.branch,
      subRepositoryPath: this.subRepositoryPath
    })
  }
}
</script>
