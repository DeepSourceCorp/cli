<template>
  <div class="max-w-3xl space-y-5 p-4 pb-12">
    <div class="space-y-0.5">
      <h1 class="font-medium text-vanilla-100">Security</h1>
      <p class="text-sm text-vanilla-400">
        Manage your workspace security and how members authenticate.
      </p>
    </div>
    <hr class="border-ink-200" />
    <!-- Skeleton loaders -->
    <div v-if="isLoading" class="space-y-5">
      <h2 class="text-sm leading-5 text-vanilla-100">SAML Single Sign-On</h2>
      <div class="h-domain-config-card animate-pulse rounded-md bg-ink-300"></div>
      <div class="h-saml-config-card animate-pulse rounded-md bg-ink-300"></div>
    </div>
    <!-- Configuration cards -->
    <template v-else>
      <upgrade-to-enterprise v-if="!canSetupSSO" />
      <sso-configuration
        v-model="domainToVerify"
        :can-setup-sso="canSetupSSO"
        :identity-provider="team.identityProvider"
        :is-in-progress="isInProgress"
        :verifiable-domain="team.verifiableDomain"
        :verifying-domain="verifyingDomain"
        @open-configure-sso="showConfigureSSO = true"
        @verify-domain="createDomainVerificationRequest"
      >
        <template #scim-toggle>
          <toggle-input
            :value="isScimEnabled"
            :remove-y-padding="true"
            :disabled="isEnablingSCIM"
            input-id="toggle-scim"
            label="SCIM provisioning"
            @input="toggleSCIM"
          >
            <template #description>
              Control who has access to your DeepSource workspace from your identity provider.
              <a
                :href="SCIM_DOCS_LINK"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-x-0.5 text-vanilla-100"
                ><span>Learn more</span><z-icon icon="arrow-right" color="current" size="x-small"
              /></a>
            </template>
          </toggle-input>
          <template v-if="isScimEnabled">
            <div
              v-if="isEnablingSCIM"
              class="mt-3 flex items-center justify-between gap-x-2 rounded-md bg-ink-200 bg-opacity-60 px-4 py-3.5"
            >
              <div class="flex items-center gap-x-2 text-sm leading-6">
                <div class="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-200"></div>
                <div class="h-5 w-32 animate-pulse bg-ink-200"></div>
              </div>
              <div class="h-5 w-24 animate-pulse bg-ink-200"></div>
            </div>
            <div
              v-else
              class="mt-3 flex items-center justify-between gap-x-2 rounded-md bg-ink-200 bg-opacity-60 px-4 py-3.5"
            >
              <div class="flex items-center gap-x-2 text-sm leading-6">
                <div class="h-1.5 w-1.5 rounded-full bg-juniper"></div>
                <span>SCIM is enabled.</span>
              </div>
              <button
                class="-my-1.5 -mr-1 space-x-1.5 rounded-sm bg-opacity-60 p-1 text-sm leading-none text-vanilla-400 transition-colors duration-200 ease-out hover:text-vanilla-100 focus:text-vanilla-100"
                @click="showConfirmDialog = true"
              >
                <z-icon icon="repeat" color="current" class="inline" />
                <span>Regenerate</span>
              </button>
            </div>
          </template>
        </template>
      </sso-configuration>
      <delete-idp
        v-if="isSAMLConfigured"
        class="mt-3"
        @confirm-idp-delete="isConfirmModalOpen = true"
      />
    </template>
    <portal to="modal">
      <!-- Camel case since auto import fails due to multiple letters being uppercase -->
      <ConfigureSSO
        v-if="showConfigureSSO"
        :verifiable-domain="team.verifiableDomain"
        :saving-changes="savingSSOConfig"
        @save-sso-config="saveSSOConfig"
        @close="showConfigureSSO = false"
      />
      <ConfirmDeleteIdP
        v-if="isConfirmModalOpen"
        :viewer="viewer"
        :is-deleting="isDeleting"
        @delete-idp="deleteIdP"
        @close="isConfirmModalOpen = false"
      />
      <show-scim-token
        v-if="showScimToken"
        :team-name="team.name"
        :token="scimToken"
        @close="closeAndEraseToken"
      />
      <z-confirm
        v-if="showConfirmDialog"
        :subtitle="`Regenerating your token will break your existing SCIM integration. You will have to update the new token on ${team.identityProvider.provider}.`"
        primary-action-type="primary"
        title="Regenerate your SCIM token?"
        @onClose="showConfirmDialog = false"
      >
        <template #footer="{ close }">
          <div class="mt-6 flex items-center justify-end space-x-4 text-right text-vanilla-100">
            <z-button button-type="ghost" class="text-vanilla-100" size="small" @click="close">
              Cancel
            </z-button>
            <z-button
              :disabled="isEnablingSCIM"
              :is-loading="isEnablingSCIM"
              icon="check-circle"
              button-type="primary"
              size="small"
              label="Regenerate token"
              loading-label="Regenerating token"
              class="modal-primary-action"
              @click="toggleSCIM(true, { regenerated: true, close })"
            />
          </div>
        </template>
      </z-confirm>
    </portal>
  </div>
</template>

<script lang="ts">
import { Component, mixins, namespace } from 'nuxt-property-decorator'
import { ZAlert, ZButton, ZConfirm, ZIcon } from '@deepsource/zeal'
import Shifty from '@deepsource/shifty'

import ActiveUserMixin from '~/mixins/activeUserMixin'
import ConfigureSSO from '@/components/Settings/Security/ConfigureSSO.vue'
import ConfirmDeleteIdP from '@/components/Settings/Security/ConfirmDeleteIdP.vue'
import DeleteIdPMutation from '~/apollo/mutations/owner/settings/deleteIdentityProvider.gql'
import { TeamMutations } from '~/store/team/detail'
import TeamSecurityQuery from '~/apollo/queries/team/security.gql'
import AddIdentityProviderMutation from '~/apollo/mutations/owner/settings/addIdentityProvider.gql'
import SubmitSupportTicketMutation from '~/apollo/mutations/support/submitSupportTicket.gql'
import UpdateIdentityProviderMutation from '~/apollo/mutations/owner/settings/updateIdentityProvider.gql'
import {
  AddIdentityProviderInput,
  Maybe,
  SubmitSupportTicketInput,
  Team,
  UpdateIdentityProviderInput,
  User
} from '~/types/types'
import { GraphqlMutationResponse, GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import { LocalStoreDomainVerification, SSO_SETUP_STATES } from '~/types/cloudSso'
import BillingBackend from '~/types/billingBackend'

const teamStore = namespace('team/detail')
const activeUserStore = namespace('user/active')

@Component({
  layout: 'dashboard',
  components: { ZAlert, ZButton, ZConfirm, ZIcon, ConfigureSSO, ConfirmDeleteIdP }
})
export default class OwnerSecurity extends mixins(ActiveUserMixin) {
  @teamStore.State
  team: Team

  @activeUserStore.State
  viewer: User

  @teamStore.Mutation(TeamMutations.SET_TEAM)
  setTeam: (team: Team) => void

  refetchQuery = false
  engine: Shifty

  domainToVerify = ''
  verifyingDomain = false
  isInProgress: LocalStoreDomainVerification | null = null

  isLoading = false
  canSetupSSO = false
  showConfigureSSO = false
  savingSSOConfig = false

  isConfirmModalOpen = false
  isDeleting = false

  readonly SCIM_DOCS_LINK =
    'https://docs.deepsource.com/docs/integrations-sso#setup-scim-provisioning'
  isScimEnabled = false
  showScimToken = false
  isEnablingSCIM = false
  showConfirmDialog = false
  scimToken = ''

  async fetch() {
    this.isLoading = true
    const { owner: login, provider } = this.$route.params
    try {
      const response: GraphqlQueryResponse = await this.$fetchGraphqlData(
        TeamSecurityQuery,
        {
          login,
          provider: this.$providerMetaMap[provider].value
        },
        this.refetchQuery
      )

      const team = response.data.owner?.team

      if (team) {
        this.setTeam(team as Team)
        this.isScimEnabled = Boolean(
          team.identityProvider?.isScimEnabled && team.identityProvider.isScimAuthTokenSet
        )
      }
      /**
       * Cloud SSO is only available on Enterprise cloud plan which is denoted by "Manual" billing backend.
       * @see{@link BillingBackend}
       */
      if (response.data.owner?.billingInfo) {
        this.canSetupSSO = response.data.owner.billingInfo.billingBackend === BillingBackend.mb
      }
    } catch (e) {
      const error = e as Error
      this.$logErrorAndToast(
        error,
        error.message
          ? (error.message.replace('GraphQL error: ', '') as `{string}.`)
          : 'An error occurred while trying to fetch SSO configuration.'
      )
    } finally {
      this.isLoading = false
      this.refetchQuery = false
    }
  }

  mounted(): void {
    const { owner, provider } = this.$route.params

    let localVerificationState = this.$localStore.get(
      `security-${owner}-${provider}`,
      'sso-verification'
    ) as LocalStoreDomainVerification | undefined

    if (localVerificationState && this.team.verifiableDomain?.verified) {
      this.$localStore.reset(`security-${owner}-${provider}`)
      localVerificationState = undefined
    }

    this.isInProgress = localVerificationState ?? null
  }

  get isSAMLConfigured(): boolean {
    return Boolean(this.team.verifiableDomain?.verified && this.team.identityProvider !== null)
  }

  async createDomainVerificationRequest() {
    this.verifyingDomain = true
    const supportTicketInput: SubmitSupportTicketInput = {
      fromEmail: this.viewer.email,
      subject: 'Domain verification Request',
      body: `Team: ${this.team.name}<br/>
      Provider: ${this.$providerMetaMap[this.team.vcsProvider]?.text ?? this.team.vcsProvider}<br/>
      Request type: Domain verification for Single Sign-on<br/>
      Domain: ${this.domainToVerify}`
    }
    try {
      const response: GraphqlMutationResponse = await this.$applyGraphqlMutation(
        SubmitSupportTicketMutation,
        { input: supportTicketInput }
      )
      if (response.data.submitSupportTicket?.ok) {
        this.$toast.success('Verification request created successfully.')
        const { owner, provider } = this.$route.params
        this.$localStore.set(`security-${owner}-${provider}`, 'sso-verification', {
          state: SSO_SETUP_STATES.VERIFICATION_IN_PROGRESS,
          domainName: this.domainToVerify
        })
        this.isInProgress = {
          state: SSO_SETUP_STATES.VERIFICATION_IN_PROGRESS,
          domainName: this.domainToVerify
        }
      }
    } catch (e) {
      const error = e as Error
      this.$logErrorAndToast(
        error,
        error.message
          ? (error.message.replace('GraphQL error: ', '') as `{string}.`)
          : 'An error occurred while trying to submit domain for verification.'
      )
    } finally {
      this.verifyingDomain = false
    }
  }

  async saveSSOConfig({ close, xmlMetadataUrl }: { close?: () => void; xmlMetadataUrl: string }) {
    this.savingSSOConfig = true
    try {
      const mutationInput: AddIdentityProviderInput = {
        teamId: this.team.id,
        xmlMetadataUrl
      }
      const response: GraphqlMutationResponse = await this.$applyGraphqlMutation(
        AddIdentityProviderMutation,
        {
          input: mutationInput
        }
      )

      if (response.data.addIdentityProvider?.ok) {
        this.$toast.success('Successfully updated SSO configuration.')
        this.refetchQuery = true
        this.$fetch()
        close?.()
      }
    } catch (e) {
      const error = e as Error
      this.$logErrorAndToast(
        error,
        error.message
          ? (error.message.replace('GraphQL error: ', '') as `{string}.`)
          : 'An error occurred while trying to save SSO configuration.'
      )
    } finally {
      this.savingSSOConfig = false
    }
  }

  async deleteIdP({ close }: { close?: () => void }) {
    this.isDeleting = true
    try {
      const response: GraphqlMutationResponse = await this.$applyGraphqlMutation(
        DeleteIdPMutation,
        {
          input: { teamId: this.team.id }
        }
      )

      if (response.data.deleteIdentityProvider?.ok) {
        this.$toast.success('Identity provider deleted successfully.')
        this.refetchQuery = true
        this.$fetch()
        close?.()
      }
    } catch (e) {
      const error = e as Error
      this.$logErrorAndToast(
        error,
        error.message
          ? (error.message.replace('GraphQL error: ', '') as `{string}.`)
          : 'An error occurered while deleting your identity provider. Please contact support.'
      )
    } finally {
      this.isDeleting = false
    }
  }

  closeAndEraseToken() {
    this.scimToken = ''
    this.showScimToken = false
  }

  generateSCIMToken() {
    if (!this.engine) this.engine = new Shifty(true, 32)
    return this.engine.generate()
  }

  async toggleSCIM(
    isScimEnabled: boolean,
    options?: {
      regenerated: boolean
      close: Maybe<() => void>
    }
  ) {
    const { regenerated, close } = options ?? { regenerated: false, close: null }
    this.isEnablingSCIM = true
    this.isScimEnabled = isScimEnabled
    try {
      const mutationInput: UpdateIdentityProviderInput = { teamId: this.team.id, isScimEnabled }
      mutationInput.scimAuthToken = isScimEnabled ? this.generateSCIMToken() : null

      const response: GraphqlMutationResponse = await this.$applyGraphqlMutation(
        UpdateIdentityProviderMutation,
        { input: mutationInput }
      )

      if (response.data.updateIdentityProvider?.ok) {
        this.$toast.success(
          `SCIM ${
            isScimEnabled ? (regenerated ? 'regenerated' : 'enabled') : 'disabled'
          } successfully.`
        )
        if (isScimEnabled) {
          this.scimToken = mutationInput.scimAuthToken as string
          this.showScimToken = true
        }
      }
    } catch (e) {
      const error = e as Error
      this.$logErrorAndToast(
        error,
        error.message
          ? (error.message.replace('GraphQL error: ', '') as `{string}.`)
          : 'An error occurered while toggling SCIM. Please contact support.'
      )
      if (!regenerated) {
        this.isScimEnabled = !isScimEnabled
      }
    } finally {
      this.isEnablingSCIM = false
      if (regenerated && close) {
        close?.()
      }
    }
  }
}
</script>
<style scoped>
.h-domain-config-card {
  height: 146px;
}

.h-saml-config-card {
  height: 134px;
}
</style>
