<template>
  <div class="rounded-md border-2 border-dashed border-slate-400 p-4 text-center md:p-12">
    <h2 class="text-2xl font-semibold">Autofix app is not installed</h2>
    <p class="mx-auto mt-4 max-w-xl text-sm text-vanilla-400">
      To create commits and pull-requests automatically, we need the Autofix app installed on the
      account with access to this repository.
    </p>
    <z-button
      v-if="installing"
      class="mt-5 flex w-56 items-center"
      button-type="primary"
      :disabled="true"
    >
      <z-icon icon="spin-loader" color="ink" class="mr-2 animate-spin" />
      Verifying installation
    </z-button>
    <z-button v-else class="mt-5" icon="autofix" @click="openAutofixInstallationUrl"
      >Install Autofix app</z-button
    >
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import InstallAutofixMixin from '~/mixins/installAutofixMixin'

@Component({
  name: 'AutofixFileChooser'
})
export default class InstallAutofixNotice extends mixins(InstallAutofixMixin) {}
</script>
