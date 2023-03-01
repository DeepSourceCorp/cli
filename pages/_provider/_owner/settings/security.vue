<template>
  <div class="p-4 pb-12 max-w-3xl space-y-5">
    <div class="space-y-0.5">
      <h1 class="font-medium text-vanilla-100">Security</h1>
      <p class="text-sm text-vanilla-400">
        Manage your workspace security and how members authenticate.
      </p>
    </div>
    <hr class="border-ink-200" />
    <!-- Skeleton loaders -->
    <div v-if="isLoading" class="space-y-5">
      <h2 class="text-sm text-vanilla-100 leading-5">SAML Single Sign-On</h2>
      <div class="h-domain-config-card bg-ink-300 animate-pulse rounded-md"></div>
      <div class="h-saml-config-card bg-ink-300 animate-pulse rounded-md"></div>
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
        <template #delete-idp>
          <delete-idp @confirm-idp-delete="isConfirmModalOpen = true" />
        </template>
      </sso-configuration>
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
    </portal>
  </div>
</template>

<script lang="ts">
import { Component, mixins, namespace } from 'nuxt-property-decorator'
import { ZAlert } from '@deepsource/zeal'

import ActiveUserMixin from '~/mixins/activeUserMixin'
import ConfigureSSO from '@/components/Settings/Security/ConfigureSSO.vue'
import ConfirmDeleteIdP from '@/components/Settings/Security/ConfirmDeleteIdP.vue'
import DeleteIdPMutation from '~/apollo/mutations/owner/settings/deleteIdentityProvider.gql'
import { TeamMutations } from '~/store/team/detail'
import TeamSecurityQuery from '~/apollo/queries/team/security.gql'
import AddIdentityProviderMutation from '~/apollo/mutations/owner/settings/addIdentityProvider.gql'
import SubmitSupportTicketMutation from '~/apollo/mutations/support/submitSupportTicket.gql'
import { AddIdentityProviderInput, SubmitSupportTicketInput, Team, User } from '~/types/types'
import { GraphqlMutationResponse, GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import { LocalStoreDomainVerification, SSO_SETUP_STATES } from '~/types/cloudSso'
import BillingBackend from '~/types/billingBackend'

const teamStore = namespace('team/detail')
const activeUserStore = namespace('user/active')

@Component({ layout: 'dashboard', components: { ZAlert, ConfigureSSO, ConfirmDeleteIdP } })
export default class OwnerSecurity extends mixins(ActiveUserMixin) {
  @teamStore.State
  team: Team

  @activeUserStore.State
  viewer: User

  @teamStore.Mutation(TeamMutations.SET_TEAM)
  setTeam: (team: Team) => void

  refetchQuery = false

  domainToVerify = ''
  verifyingDomain = false
  isInProgress: LocalStoreDomainVerification | null = null

  isLoading = false
  canSetupSSO = false
  showConfigureSSO = false
  savingSSOConfig = false

  isConfirmModalOpen = false
  isDeleting = false

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

      if (response.data.owner?.team) {
        this.setTeam(response.data.owner.team as Team)
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
