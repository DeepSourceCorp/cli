<template>
  <div class="container mx-auto">
    <!-- Activity name for this tag: Deepsource__ThankYouPage_Pixel_PostConversionPixel_PageView -->
    <client-only>
      <img
        v-if="!$config.onPrem"
        :src="`https://pubads.g.doubleclick.net/activity;xsp=4892488;ord=${String(
          Math.floor(Math.random() * 10000000000000000)
        )}?`"
        class="border-none h-px w-px"
      />
    </client-only>
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

/**
 * This page triggers the installation mutation
 */
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
  private pollingInterval: ReturnType<typeof setTimeout>
  private vcsResponse: VCSResponse | null

  /**
   * Mount the websocket listener
   *
   * @returns {void}
   */
  mounted(): void {
    this.pollInstallationStatus()
    this.$socket.$on('vcs-installation-complete', (data: Record<string, string>) => {
      // TODO: fix/refactor this to work with asgard
    })
  }

  /**
   * BeforeDestroy hook for the page, clears timeout safely.
   *
   * @returns {void}
   */
  beforeDestroy(): void {
    clearTimeout(this.pollingInterval)
  }

  // Desperate times require desperate measures.  We determine the provider by the route.
  //  `/onboard/bitbucket` = `bb``
  //  `/installation` = `gh`
  //  `/installation/ghe` = `ghe`
  //  `/onboard/gitlab` = `gl`
  // Todo: Fix this by unifying the post installation flow.

  /**
   * Trigger github installation mutation
   *
   * @param {any} payload
   * @returns {Promise<GithubInstallationLandingPayload | null>}
   */
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

  /**
   * Trigger github enterprise installation mutation
   *
   * @param {any} payload
   * @returns {Promise<GithubEnterpriseInstallationLandingPayload | null>}
   */
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

  /**
   * Trigger bitbucket installation mutation
   *
   * @param {any} payload
   * @returns {Promise<BitbucketInstallationLandingPayload | null>}
   */
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

  /**
   * handle the next action after the installation is triggered
   *
   * @returns {Promise<any>}
   */
  async handleNextAction(): Promise<any> {
    let nextUrl = '/login'
    switch (this.vcsResponse?.nextAction) {
      case NextActionChoice.Login:
        this.$router.push('/login')
        break
      case NextActionChoice.Dashboard:
        nextUrl = this.homeUrl
        this.$router.push(nextUrl)
        break
      case NextActionChoice.Onboard:
        const providerKey = this.vcsResponse?.vcsProvider as string
        const providerShortCode = this.$providerMetaMap[providerKey].shortcode
        nextUrl = `/onboard/${providerShortCode}/${this.vcsResponse.login}/repositories`
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

  /**
   * Triggers the installation mutation and then triggers the next action
   *
   * @returns {Promise<void>}
   */
  async pollInstallationStatus(): Promise<void> {
    /**
     * Polling function for checking next step in setup.
     *
     * @returns {Promise<void>}
     */
    const pollingFunction = async (): Promise<void> => {
      const { provider } = this.$route.params

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
        await new Promise(
          (resolve) => (this.pollingInterval = setTimeout(resolve, POLLING_INTERVAL))
        )
        await pollingFunction()
        return
      }

      return
    }

    await pollingFunction()

    // Refetch active user post installation.
    await this.refetchUser()

    clearTimeout(this.pollingInterval)

    this.handleNextAction()
  }
}
</script>
