<template>
  <div class="container mx-auto">
    <div
      class="flex flex-col justify-between min-h-screen pt-32 pb-24 text-sm text-center text-vanilla-400"
    >
      <div class="space-y-2">
        <video
          autoplay
          loop
          muted
          playsinline
          class="mx-auto max-h-84"
          :poster="require('~/assets/loader/installation-loader.png')"
        >
          <source src="~/assets/loader/loader.webm" type="video/webm" />
        </video>
        <h1 class="text-2xl font-semibold text-vanilla-100">
          Waiting for installation to complete
        </h1>
        <p>Please give us a moment while we wait to hear back from your VCS provider.</p>
      </div>
      <div class="space-y-2">
        <p>This page will refresh automatically.</p>
        <p class="font-semibold">Please do not close this window.</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import GithubInstallationLandingInput from '~/apollo/mutations/installation/githubInstallationLandingInput.gql'
import GithubEnterpriseInstallationLandingInput from '~/apollo/mutations/installation/githubEnterpriseInstallation.gql'
import BitbucketInstallationLandingInput from '~/apollo/mutations/installation/bitbucketInstallationLandingInput.gql'
import { GraphqlMutationResponse } from '~/types/apollo-graphql-types'
import {
  BitbucketInstallationLandingPayload,
  GithubEnterpriseInstallationLandingPayload,
  GithubInstallationLandingPayload,
  Maybe,
  NextActionChoice,
  Scalars,
  VcsProviderChoices
} from '~/types/types'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import AuthMixin from '~/mixins/authMixin'

const POLLING_INTERVAL = 5000

interface VCSResponse {
  message?: Maybe<Scalars['String']>
  nextAction?: Maybe<NextActionChoice>
  vcsProvider?: Maybe<VcsProviderChoices>
  login?: Maybe<Scalars['String']>
}

@Component({
  middleware: 'auth',
  meta: {
    auth: {
      strict: true,
      redirectToLogin: true
    }
  }
})
export default class Installation extends mixins(ActiveUserMixin, AuthMixin) {
  private pollingInterval: ReturnType<typeof setInterval>

  created(): void {
    this.pollingInterval = setInterval(this.pollInstallationStatus, POLLING_INTERVAL)
  }
  mounted(): void {
    this.$socket.$on('vcs-installation-complete', (data: Record<string, string>) => {
      // TODO: fix/refactor this to work with asgard
    })
  }

  // Desperate times require desperate measures.  We determine the provider by the route.
  //  `/onboard/bitbucket` = `bb``
  //  `/installation` = `gh`
  //  `/installation/ghe` = `ghe`
  //  `/onboard/gitlab` = `gl`
  // Todo: Fix this by unifying the post installation flow.

  async sendGithubInstallationMutation(
    payload: any
  ): Promise<GithubInstallationLandingPayload | null> {
    const response: GraphqlMutationResponse = await this.$applyGraphqlMutation(
      GithubInstallationLandingInput,
      payload
    )
    if (!response.data || !response.data.installation) {
      return null
    }
    return response.data.installation
  }

  async sendGithubEnterpriseInstallationMutation(
    payload: any
  ): Promise<GithubEnterpriseInstallationLandingPayload | null> {
    const response: GraphqlMutationResponse = await this.$applyGraphqlMutation(
      GithubEnterpriseInstallationLandingInput,
      payload
    )
    if (!response.data || !response.data.gheInstallationLanding) {
      return null
    }
    return response.data.gheInstallationLanding
  }

  async sendBitbucketInstallationMutation(
    payload: any
  ): Promise<BitbucketInstallationLandingPayload | null> {
    const response: GraphqlMutationResponse = await this.$applyGraphqlMutation(
      BitbucketInstallationLandingInput,
      payload
    )
    if (!response.data || !response.data.bitbucketInstallationLanding) {
      return null
    }
    return response.data.bitbucketInstallationLanding
  }

  async handleNextAction() {
    let nextUrl = '/login'
    switch (this.vcsResponse?.nextAction) {
      case NextActionChoice.Login:
        this.$router.push('/login')
        break
      case NextActionChoice.Dashboard:
        await this.refetchUser()
        nextUrl = this.homeUrl
        this.$router.push(nextUrl)
        break
      case NextActionChoice.Onboard:
        const providerKey = this.vcsResponse?.vcsProvider as string
        const providerShortCode = this.$providerMetaMap[providerKey].shortcode
        nextUrl = `/onboard/${providerShortCode}/${this.vcsResponse.login}`
        this.$router.push(nextUrl)
        break
      case NextActionChoice.GithubLogin:
        await this.fetchAuthUrls()
        nextUrl = this.authUrls['github']
        window.open(nextUrl)
        break
      default:
        throw new Error(`Something went wrong while setting up your account.`)
    }
  }

  private vcsResponse: VCSResponse | null

  async pollInstallationStatus(): Promise<void> {
    const provider = this.$route.params.provider

    const payload = { input: { queryParams: this.$route.query } }

    switch (provider) {
      case this.$providerMetaMap.gh.shortcode:
        this.vcsResponse = (await this.sendGithubInstallationMutation(payload)) as VCSResponse
        break
      case this.$providerMetaMap.ghe.shortcode:
        this.vcsResponse = (await this.sendGithubEnterpriseInstallationMutation(
          payload
        )) as VCSResponse
        break
      case this.$providerMetaMap.bb.shortcode:
        this.vcsResponse = (await this.sendBitbucketInstallationMutation(payload)) as VCSResponse
        break
      default:
        throw new Error(`Something went wrong while setting up your account.`)
    }

    if (!this.vcsResponse?.nextAction) {
      return
    }

    clearInterval(this.pollingInterval)

    this.handleNextAction()
  }
}
</script>
