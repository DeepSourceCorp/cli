<template>
  <div class="grid place-content-center h-full">
    <div class="text-center">
      <h4 class="text-vanilla-400 text-base mb-5 px-12">
        To use auto-onboard you will have to install the Autofix app for your organization with
        permissions to all the repositories you wish to run DeepSource analysis on.
      </h4>
      <z-button
        v-if="installing"
        class="flex items-center w-48"
        buttonType="primary"
        size="small"
        :disabled="true"
      >
        <z-icon icon="spin-loader" color="ink" class="mr-2 animate-spin"></z-icon>
        Verifying installation
      </z-button>
      <z-button
        v-else
        icon="autofix"
        class="w-48 modal-primary-action"
        buttonType="primary"
        size="small"
        @click="openAutofixInstallationUrl"
        >Install Autofix app</z-button
      >
    </div>
  </div>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZButton } from '@deepsourcelabs/zeal'
import InstallAutofixMixin from '~/mixins/installAutofixMixin'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'

@Component({
  name: 'InstallAutofixModal',
  components: {
    ZIcon,
    ZButton
  }
})
export default class InstallAutofixForAutoOnboard extends mixins(
  InstallAutofixMixin,
  OwnerDetailMixin,
  ActiveUserMixin
) {
  async openAutofixInstallationUrl(): Promise<void> {
    // Assign the close recieved from the modal
    this.installing = true

    // fetch installation url from repository
    let installationUrl = this.owner?.autofixInstallationUrl
    if (!installationUrl) {
      await this.fetchOwnerDetails({
        login: this.activeOwner,
        provider: this.activeProvider,
        refetch: true
      })

      installationUrl = this.owner?.autofixInstallationUrl
    }

    if (installationUrl) {
      // open the window
      this.installWindow = window.open(installationUrl, '', 'resizable=no,width=1000,height=600')

      this.popUpTimer = setInterval(() => {
        if (this.installWindow?.closed) {
          this.failTimeout = setTimeout(this.fail, 5000)
          clearInterval(this.popUpTimer)
        }
      }, 1000)

      this.pollTimer = setInterval(async () => {
        await this.refetchRepo()
        if (this.repository.isAutofixEnabled) {
          clearInterval(this.pollTimer)
          await this.success()
        }
      }, 1200)

      this.$socket.$on('autofix-installation-complete', async () => {
        await this.success()
      })
    }
  }

  //? Intentional async since overriding a method
  //skipcq JS-0376
  async finish(): Promise<void> {
    clearTimeout(this.failTimeout)
    clearInterval(this.popUpTimer)
    clearInterval(this.pollTimer)
    this.$socket.$off('autofix-installation-complete')
    this.$emit('refetch')

    this.installing = false
  }
}
</script>
