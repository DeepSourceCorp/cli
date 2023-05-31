<template>
  <div :class="{ 'cursor-not-allowed': isSSONotConfigurable }">
    <div :class="{ 'pointer-events-none opacity-60': isSSONotConfigurable }" class="space-y-5">
      <h2 class="text-sm leading-5 text-vanilla-100">SAML Single Sign-On</h2>
      <div class="rounded-md border border-ink-200 bg-ink-300 p-4">
        <p class="text-sm leading-4 tracking-wide text-vanilla-300">Domain name</p>
        <p class="mt-1.5 text-xs leading-5 text-vanilla-400">
          When configured, users whose email address ends in the specified domain would be allowed
          to sign in using your SSO provider.
          <a
            :href="SSO_DOCS_LINK"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-x-0.5 text-vanilla-100"
            ><span>Learn more</span><z-icon icon="arrow-right" color="current" size="x-small"
          /></a>
        </p>
        <div v-if="isSAMLConfigurable" class="juniper-highlight-card mt-3">
          <div class="flex items-center gap-x-2">
            <div class="h-1.5 w-1.5 rounded-full bg-juniper-500"></div>
            <span class="text-sm leading-4 text-juniper-300"
              >{{ verifiableDomain.domainName }} is verified.</span
            >
          </div>
        </div>
        <div
          v-else-if="isSSOVerificationPending"
          class="mt-3 flex justify-between gap-x-16 rounded-md bg-honey-500 bg-opacity-10 p-4"
        >
          <div class="flex items-center gap-x-2">
            <div class="h-1.5 w-1.5 rounded-full bg-honey-500"></div>
            <span class="text-sm leading-4 text-honey-400"
              >{{ domainInVerification }} is pending verification. It can take up to 1-2 business
              days to verify.</span
            >
          </div>
        </div>
        <div
          v-else
          class="mt-3 flex w-full items-stretch divide-x divide-ink-200 rounded-sm border border-ink-200 bg-ink-400"
        >
          <z-input
            v-model="domainInput"
            :show-border="false"
            padding="p-0 px-3"
            placeholder="yourdomain.com"
            class="flex-grow text-xs leading-5"
          />
          <button
            :disabled="verifyingDomain"
            :class="verifyingDomain ? 'cursor-not-allowed' : 'hover:bg-ink-200'"
            class="flex flex-shrink-0 items-center gap-x-1 bg-ink-300 p-3 text-xs leading-3 text-vanilla-100"
            @click="verifyDomain"
          >
            <z-icon
              :icon="verifyingDomain ? 'spin-loader' : 'link-2'"
              color="vanilla-100"
              size="x-small"
              :class="{ 'animate-spin': verifyingDomain }"
            />
            <span>{{ verifyingDomain ? 'Requesting verification' : 'Request verification' }}</span>
          </button>
        </div>
        <template v-if="isSAMLConfigurable">
          <hr class="-mx-4 mt-4 mb-3 border-ink-200" />
          <div class="-mb-1 flex flex-wrap items-center justify-between">
            <p class="text-xs leading-4 text-vanilla-400">
              Please contact us to update your team's domain.
            </p>
            <nuxt-link
              to="/support"
              class="flex items-center gap-x-1 rounded-sm border border-ink-50 bg-ink-200 px-2.5 py-1.5 text-xs leading-none"
            >
              <z-icon icon="mail" size="x-small" />
              <span>Contact support</span>
            </nuxt-link>
          </div>
        </template>
      </div>
      <div class="rounded-md border border-ink-200 bg-ink-300 p-4">
        <div
          :class="{ 'opacity-60': !isSAMLConfigurable }"
          class="float-right rounded-sm border border-ink-50 bg-ink-200"
        >
          <z-button
            v-if="!isSAMLConfigured"
            :disabled="!isSAMLConfigurable"
            button-type="ghost"
            color="vanilla-100"
            icon="sliders"
            icon-size="x-small"
            label="Configure"
            size="small"
            @click="$emit('open-configure-sso')"
          />
        </div>
        <p class="text-sm leading-4 tracking-wide text-vanilla-300">Identity provider</p>
        <p class="mt-1.5 text-xs leading-5 text-vanilla-400">
          {{
            isSAMLConfigured
              ? 'Single Sign-on is enabled for your team.'
              : 'Allow team members to login using an Identity Provider.'
          }}
        </p>
        <z-alert v-if="!isSAMLConfigurable" type="info" class="mt-3">
          <div class="flex items-center gap-x-2">
            <z-icon icon="solid-alert-circle" color="robin-400" />
            <span>You need to first verify your domain to configure SAML Single Sign-On.</span>
          </div>
        </z-alert>
        <template v-if="isSAMLConfigured">
          <div class="mt-2 rounded-md border border-slate-400">
            <div class="grid grid-cols-2 content-between px-4 pt-2 pb-3 lg:grid-cols-4">
              <div>
                <p class="text-xxs uppercase leading-7 tracking-wider text-vanilla-400">
                  Domain name
                </p>
                <p class="mt-2 truncate text-xs font-medium leading-3 text-vanilla-100">
                  {{ identityProvider.domain.domainName || verifiableDomain.domainName }}
                </p>
              </div>
              <div>
                <p class="text-xxs uppercase leading-7 tracking-wider text-vanilla-400">Provider</p>
                <p class="mt-2 truncate text-xs font-medium leading-3 text-vanilla-100">
                  {{ identityProvider.provider }}
                </p>
              </div>
              <div class="col-span-2">
                <p class="text-xxs uppercase leading-7 tracking-wider text-vanilla-400">
                  Metadata url
                </p>
                <p class="mt-2 truncate text-xs font-medium leading-3 text-vanilla-100">
                  {{ identityProvider.xmlMetadataUrl }}
                </p>
              </div>
            </div>
          </div>
          <hr class="my-4.5 border-slate-400" />
          <slot name="scim-toggle"></slot>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, ModelSync, Prop, Vue } from 'nuxt-property-decorator'
import { ZAlert, ZButton, ZIcon, ZInput } from '@deepsource/zeal'

import { LocalStoreDomainVerification, SSO_SETUP_STATES } from '~/types/cloudSso'
import { IdentityProvider, Maybe, VerifiableDomain } from '~/types/types'

@Component({ components: { ZAlert, ZButton, ZIcon, ZInput } })
export default class SsoConfiguration extends Vue {
  @Prop({ required: true })
  verifiableDomain: Maybe<VerifiableDomain>

  @Prop({ required: true })
  identityProvider: Maybe<IdentityProvider>

  @ModelSync('domainName', 'input', { required: true, type: String })
  readonly domainInput: string

  @Prop({ default: false })
  verifyingDomain: boolean

  @Prop({ required: true })
  isInProgress: LocalStoreDomainVerification | null

  @Prop({ required: true })
  canSetupSso: boolean

  readonly SSO_DOCS_LINK = 'https://docs.deepsource.com/docs/sso'

  SSO_SETUP_STATES = SSO_SETUP_STATES

  get ssoStatus(): SSO_SETUP_STATES | '' {
    if (this.isInProgress?.state === SSO_SETUP_STATES.VERIFICATION_IN_PROGRESS) {
      return SSO_SETUP_STATES.VERIFICATION_IN_PROGRESS
    }

    if (!this.canSetupSso) {
      return SSO_SETUP_STATES.NEED_TO_UPGRADE
    }

    if (this.verifiableDomain === null) {
      return SSO_SETUP_STATES.NEEDS_INFORMATION
    }

    if (this.verifiableDomain?.verified) {
      return SSO_SETUP_STATES.VERIFICATION_COMPLETE
    }

    return ''
  }

  get isSSONotConfigurable(): boolean {
    return this.ssoStatus === SSO_SETUP_STATES.NEED_TO_UPGRADE
  }

  get isSSOVerificationPending(): boolean {
    return this.ssoStatus === SSO_SETUP_STATES.VERIFICATION_IN_PROGRESS
  }

  get isSAMLConfigurable(): boolean {
    return this.ssoStatus === SSO_SETUP_STATES.VERIFICATION_COMPLETE
  }

  get isSAMLConfigured(): boolean {
    return this.isSAMLConfigurable && this.identityProvider !== null
  }

  get domainInVerification() {
    return this.isSSOVerificationPending && this.isInProgress?.domainName
      ? this.isInProgress.domainName
      : 'Domain'
  }

  verifyDomain() {
    this.domainInput
      ? this.$emit('verify-domain')
      : this.$toast.danger('Please enter a valid domain')
  }
}
</script>

<style scoped lang="postcss">
.juniper-highlight-card {
  @apply flex justify-between gap-x-16 rounded-md p-4;
  background-color: rgba(51, 203, 154, 0.06);
}
</style>
