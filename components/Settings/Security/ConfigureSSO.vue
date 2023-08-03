<template>
  <z-modal title="Configure SSO Identity Provider" @onClose="$emit('close')">
    <div class="space-y-5 px-4 py-3">
      <label class="block space-y-2">
        <div class="text-xs leading-5">Domain name</div>
        <z-input
          :read-only="true"
          :value="verifiableDomain ? verifiableDomain.domainName : ''"
          placeholder=""
          size="small"
        >
          <template #right>
            <div>
              <z-icon icon="link-2" color="juniper" size="small" class="mr-2" />
            </div>
          </template>
        </z-input>
      </label>
      <div class="space-y-2">
        <label class="space-y-2">
          <div class="text-xs leading-5">XML Metadata URL</div>
          <z-input v-model="xmlMetadataUrl" v-focus size="small" placeholder="" />
        </label>
        <a
          v-if="CONFIGURE_DOCS_LINK"
          :href="CONFIGURE_DOCS_LINK"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-x-0.5 text-xs leading-5 text-vanilla-400 hover:underline"
          >Where to find the XML Metadata URL?<z-icon
            icon="arrow-up-right"
            color="current"
            size="x-small"
        /></a>
      </div>
    </div>
    <template #footer="{ close }">
      <hr class="border-ink-200" />
      <div
        class="flex items-center justify-end space-x-1.5 px-4 py-3.5 text-right text-vanilla-100"
      >
        <div class="group bg-ink-200">
          <z-button
            :is-loading="savingChanges"
            button-type="ghost"
            color="vanilla-100"
            size="small"
            label="Cancel"
            class="group-hover:bg-ink-50"
            @click="closeModal(close)"
          />
        </div>
        <z-button
          :disabled="savingChanges || !xmlMetadataUrl"
          :is-loading="savingChanges"
          icon="check"
          button-type="primary"
          size="small"
          label="Save changes"
          loading-label="Saving changes"
          class="modal-primary-action"
          @click="$emit('save-sso-config', { close, xmlMetadataUrl })"
        />
      </div>
    </template>
  </z-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { Maybe, VerifiableDomain } from '~/types/types'

@Component({})
export default class ConfigureSSO extends Vue {
  @Prop({ required: true })
  verifiableDomain: Maybe<VerifiableDomain>

  @Prop({ default: false, type: Boolean })
  savingChanges: boolean

  // TODO: Add the link once docs are in place
  readonly CONFIGURE_DOCS_LINK = ''
  xmlMetadataUrl = ''

  closeModal(close?: () => void) {
    this.xmlMetadataUrl = ''
    close?.()
  }
}
</script>
