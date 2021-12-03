<template>
  <div class="flex flex-col max-w-2xl p-4 space-y-6">
    <!-- title -->
    <div class="text-lg font-medium text-vanilla-100">Autofix settings</div>
    <!-- Description -->
    <div class="text-sm text-vanilla-400">
      To use Autofix on this repository, DeepSource needs the necessary permissions to automatically
      create pull-requests.
    </div>
    <!-- Notice -->
    <notice v-if="repository.isAutofixEnabled">
      <p>
        The Autofix app has been installed and has all the necessary permissions on this repository.
      </p>
    </notice>
    <notice v-else :enabled="false">
      <span class="flex-grow">The Autofix app is not installed yet.</span>
      <z-button class="activate" icon="autofix" size="small" @click="showInstallAutofixModal = true"
        >Install Autofix</z-button
      >
    </notice>
    <install-autofix-modal v-if="showInstallAutofixModal" @close="close" />
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { Notice } from '@/components/Settings/index'
import { ZButton } from '@deepsourcelabs/zeal'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import { AppFeatures, RepoPerms } from '~/types/permTypes'

@Component({
  components: {
    Notice,
    ZButton
  },
  layout: 'repository',
  middleware: ['perm', 'validateProvider', 'featureGate'],
  meta: {
    auth: {
      strict: true,
      repoPerms: [RepoPerms.INSTALL_AUTOFIX_APP, RepoPerms.CREATE_AUTOFIXES]
    },
    gateFeature: AppFeatures.AUTOFIX
  }
})
export default class SettingsAutofix extends mixins(RepoDetailMixin) {
  showInstallAutofixModal = false

  close() {
    this.showInstallAutofixModal = false
    this.fetchBasicRepoDetails({
      ...this.baseRouteParams,
      refetch: true
    })
  }

  async fetch(): Promise<void> {
    this.fetchRepoDetails(this.baseRouteParams)
  }
}
</script>
