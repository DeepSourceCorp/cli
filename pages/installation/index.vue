<template>
  <div class="container mx-auto">
    <div
      class="text-vanilla-400 text-sm text-center flex flex-col justify-between min-h-screen pb-24 pt-32"
    >
      <div class="space-y-2">
        <video class="max-w-xl mx-auto" poster="/installation-loader.png" autoplay>
          <source src="/loading.mp4" type="video/mp4" />
        </video>
        <h1 class="text-2xl text-vanilla-100 font-semibold">
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
import GithubInstallationLandingInput from '../../apollo/mutations/installation/githubInstallationLandingInput.gql'
import BitbucketInstallationLandingInput from '../../apollo/mutations/installation/bitbucketInstallationLandingInput.gql'
import { GraphqlMutationResponse } from '~/types/apollo-graphql-types'
import {
  BitbucketInstallationLandingPayload,
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

@Component({ middleware: 'auth' })
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
  //  `/onboard/gitlab` = `gl`
  // Todo: Fix this by unifying the post installation flow.
  getProvider(params: any): string {
    const provider: string = params.provider as string
    switch (provider) {
      case 'bitbucket':
        return this.$providerMetaMap.bb.shortcode
      default:
        return this.$providerMetaMap.gh.shortcode
    }
  }

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
      case NextActionChoice.Onboard: {
        const providerKey = <string>this.vcsResponse?.vcsProvider
        const providerShortCode = this.$providerMetaMap[providerKey].shortcode
        nextUrl = `/onboard/${providerShortCode}/${this.vcsResponse.login}`
        this.$router.push(nextUrl)
        break
      }
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
    const queryParams = this.$route.query
    const provider = this.getProvider(queryParams)

    const payload = { input: { queryParams } }

    switch (provider) {
      case this.$providerMetaMap.gh.shortcode:
        this.vcsResponse = (await this.sendGithubInstallationMutation(payload)) as VCSResponse
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
