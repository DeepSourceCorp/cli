<template>
  <portal to="modal">
    <z-modal
      class="shadow-double-dark"
      title="Install Autofix app"
      primary-action-label="Install Autofix app"
      primary-action-icon="autofix"
      :close-after-primary-action="false"
      @primaryAction="openAutofixInstallationUrl"
      @onClose="$emit('close')"
    >
      <div class="min-h-20 p-4 text-sm text-vanilla-400">
        <p>
          To create commits and pull-requests automatically, we need the Autofix app installed on
          the account with access to this repository.
        </p>
      </div>
      <template #footer="{ close }">
        <div class="space-x-4 border-slate-400 p-4 text-right text-vanilla-100">
          <z-button
            v-if="installing"
            class="flex w-48 items-center"
            button-type="primary"
            size="small"
            :disabled="true"
          >
            <z-icon icon="spin-loader" color="ink" class="mr-2 animate-spin" />
            Verifying installation
          </z-button>
          <z-button
            v-else
            icon="autofix"
            class="modal-primary-action w-48"
            button-type="primary"
            size="small"
            @click="openAutofixInstallationUrl(close)"
            >Install Autofix app</z-button
          >
        </div>
      </template>
    </z-modal>
  </portal>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import InstallAutofixMixin from '~/mixins/installAutofixMixin'

@Component({
  name: 'InstallAutofixModal'
})
export default class InstallAutofixModal extends mixins(InstallAutofixMixin) {}
</script>
