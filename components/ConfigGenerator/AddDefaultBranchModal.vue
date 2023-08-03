<template>
  <z-modal @onClose="$emit('onClose')">
    <template #title>
      <span class="text-base text-vanilla-100"> Activate analysis </span>
    </template>
    <div class="flex flex-col space-y-3 p-4">
      <label class="space-y-2 text-sm">
        <span>Enter default branch name</span>
        <z-input v-model="gsrDefaultBranch" placeholder="main" />
      </label>
      <p class="text-sm text-vanilla-400">
        To activate analysis on
        <span class="text-vanilla-100">
          {{ login }}/<b>{{ repoName }}</b>
        </span>
        you must provide the default branch name. DeepSource will run analysis against this branch
        for every new commit pushed.
      </p>
    </div>
    <template #footer="{ close }">
      <div class="space-x-4 border-slate-400 p-4 text-right text-vanilla-100">
        <z-button
          icon="zap"
          class="w-48"
          button-type="primary"
          size="small"
          loading-label="Activating repository"
          label="Activate repository"
          :disabled="gsrDefaultBranch === ''"
          :loading="commitLoading"
          @click="activateGSRRepo(close)"
        />
      </div>
    </template>
  </z-modal>
</template>

<script lang="ts">
import { Component, mixins, Prop } from 'nuxt-property-decorator'

import RepoDetailMixin from '~/mixins/repoDetailMixin'

@Component({
  meta: {
    auth: {
      strict: true
    }
  }
})
export default class AddDefaultBranchModal extends mixins(RepoDetailMixin) {
  @Prop({ required: true })
  login: string

  @Prop({ required: true })
  repoName: string

  @Prop({ required: true })
  repoId: string

  @Prop({ required: true })
  toml: string

  public gsrDefaultBranch = ''
  public commitLoading = false

  async activateGSRRepo(): Promise<void> {
    this.commitLoading = true

    const { provider } = this.$route.params

    await this.triggerGSRActivation({
      config: this.toml,
      defaultBranchName: this.gsrDefaultBranch,
      repositoryId: this.repoId as string
    })

    await this.fetchBasicRepoDetails({
      provider,
      owner: this.login,
      name: this.repoName,
      refetch: true
    })

    setTimeout(() => {
      this.$router.push({
        path: `/${provider}/${this.login}/${this.repoName}`
      })
    }, 500)

    this.$emit('onActivate')

    this.commitLoading = false
  }
}
</script>
