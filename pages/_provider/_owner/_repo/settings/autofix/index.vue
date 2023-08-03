<template>
  <div class="flex max-w-2xl flex-col gap-y-2 p-4">
    <!-- title -->
    <page-title
      class="max-w-2xl"
      title="Autofix settings"
      description-width-class="max-w-2xl"
      description="To use Autofix on this repository, DeepSource needs the necessary permissions to automatically
      create pull-requests."
    />
    <!-- Notice -->
    <notice v-if="repository.isAutofixEnabled" class="items-baseline">
      <p class="relative top-px">
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
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import { AppFeatures, RepoPerms } from '~/types/permTypes'

@Component({
  components: {
    Notice
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
    await this.fetchRepoDetails(this.baseRouteParams)
  }
}
</script>
