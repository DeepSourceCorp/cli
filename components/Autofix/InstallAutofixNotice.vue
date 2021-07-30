<template>
  <div class="border-2 border-ink-200 border-dashed rounded-md p-4 md:p-12 text-center">
    <h2 class="font-semibold text-2xl">Autofix app is not installed</h2>
    <p class="max-w-xl mx-auto text-vanilla-400 text-sm mt-4">
      To create commits and pull-requests automatically, we need the Autofix app installed on the
      account with access to this repository.
    </p>
    <z-button
      v-if="installing"
      class="w-56 flex items-center mt-5"
      buttonType="primary"
      :disabled="true"
    >
      <z-icon icon="spin-loader" color="ink" class="animate-spin mr-2"></z-icon>
      Verifying installation
    </z-button>
    <z-button v-else class="mt-5" icon="autofix" @click="openAutofixInstallationUrl"
      >Install Autofix app</z-button
    >
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZButton } from '@deepsourcelabs/zeal'
import InstallAutofixMixin from '~/mixins/installAutofixMixin'

@Component({
  name: 'AutofixFileChooser',
  components: {
    ZIcon,
    ZButton
  }
})
export default class InstallAutofixNotice extends mixins(InstallAutofixMixin) {}
</script>
