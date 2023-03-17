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
      <div class="p-4 text-sm text-vanilla-400 min-h-20">
        <p>
          To create commits and pull-requests automatically, we need the Autofix app installed on
          the account with access to this repository.
        </p>
      </div>
      <template #footer="{ close }">
        <div class="p-4 space-x-4 text-right text-vanilla-100 border-slate-400">
          <z-button
            v-if="installing"
            class="w-48 flex items-center"
            button-type="primary"
            size="small"
            :disabled="true"
          >
            <z-icon icon="spin-loader" color="ink" class="animate-spin mr-2" />
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
import { ZIcon, ZModal, ZButton } from '@deepsource/zeal'
import InstallAutofixMixin from '~/mixins/installAutofixMixin'

@Component({
  name: 'InstallAutofixModal',
  components: {
    ZIcon,
    ZModal,
    ZButton
  }
})
export default class InstallAutofixModal extends mixins(InstallAutofixMixin) {}
</script>
