<template>
  <hero-card :show-border="false" width="4xl">
    <h1 class="text-center text-lg font-medium leading-snug text-vanilla-100">
      Awaiting third-party application access...
    </h1>

    <div
      class="mt-8 flex min-h-92 flex-col rounded-md border border-slate-400 bg-transparent md:flex-row"
    >
      <div class="border border-r border-slate-400 lg:w-98">
        <!-- Larger screens -->
        <video autoplay muted loop disablepictureinpicture class="hidden max-h-102 md:block">
          <source src="~/assets/videos/ads-animation-desktop.webm" type="video/webm" />

          <source src="~/assets/videos/ads-animation-desktop.mp4" type="video/mp4" />
        </video>

        <!-- Mobile resolutions -->
        <video autoplay muted loop disablepictureinpicture class="max-h-102 md:hidden">
          <source src="~/assets/videos/ads-animation-mobile.webm" type="video/webm" />

          <source src="~/assets/videos/ads-animation-mobile.mp4" type="video/mp4" />
        </video>
      </div>

      <div class="grid p-8 backdrop-blur-3xl lg:w-98">
        <z-stepper :show-numbers="true" align="vertical">
          <z-step>
            <template #title>
              <h3 class="text-sm text-vanilla-400">
                Open your
                <a
                  :href="orgSettingsUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="font-medium text-juniper hover:underline"
                >
                  Azure Devops Dashboard
                </a>
                <z-icon icon="arrow-up-right" color="juniper-400" class="inline" />
              </h3>
            </template>
          </z-step>

          <z-step>
            <template #title>
              <h3 class="text-sm text-vanilla-400">
                Navigate to
                <span class="font-medium text-vanilla-100">Organization settings -> Policies</span>
              </h3>
            </template>
          </z-step>

          <z-step>
            <template #title>
              <h3 class="text-sm text-vanilla-400">
                Set Third-party application access via OAuth to
                <span class="font-medium text-vanilla-100">On</span>
              </h3>
            </template>

            <template #description>
              <z-button
                :to="documentationUrl"
                button-type="secondary"
                color="vanilla-400"
                size="small"
                target="_blank"
                rel="noopener noreferrer"
                class="gap-x-1"
              >
                Read full documentation <z-icon icon="arrow-up-right" color="vanilla-400" />
              </z-button>
            </template>
          </z-step>

          <z-step>
            <template #title>
              <h3 class="text-sm text-vanilla-400">
                Come back to this page and click
                <code class="bifrost-inline-code font-medium text-vanilla-100">Continue</code>
              </h3>
            </template>
          </z-step>
        </z-stepper>

        <z-button
          label="Continue"
          size="small"
          class="mt-4 w-full gap-x-1 place-self-end md:mt-0 md:w-32"
          @click="validateAction"
        >
          <span>Continue</span>
          <z-icon
            :icon="validateLoading ? 'spin-loader' : 'arrow-right'"
            color="current"
            :class="{ 'animate-spin': validateLoading }"
          />
        </z-button>
      </div>
    </div>
  </hero-card>
</template>

<script lang="ts">
import { Context } from '@nuxt/types/app'
import { Component, Vue } from 'nuxt-property-decorator'

import ActiveUserADSOrganizationInfo from '~/apollo/queries/user/active/userADSOrganizationInfo.gql'
import ActiveUserADSOrgSettingsURL from '~/apollo/queries/user/active/userADSOrgSettingsUrl.gql'

import ADSInstallationLandingGQLMutation from '@/apollo/mutations/installation/adsInstallationLanding.gql'

import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'

@Component({
  meta: {
    auth: {
      strict: true,
      redirectToLogin: true
    }
  },
  middleware: [
    async function ({
      error,
      redirect,
      route,
      $fetchGraphqlData,
      $logErrorAndToast
    }: Context): Promise<void> {
      try {
        const { login } = route.params

        const response: GraphqlQueryResponse = await $fetchGraphqlData(
          ActiveUserADSOrganizationInfo,
          { login }
        )

        if (!response.data.viewer) {
          error({ statusCode: 500 })
          return
        }

        const { adsOrganization } = response.data.viewer

        // Show the `404` page if the query yields `null`
        // There isn't an organization corresponding to the given `login`
        if (!adsOrganization) {
          error({ statusCode: 404 })
          return
        }

        const { hasInstalled, hasEnabledThirdPartyAccess } = adsOrganization

        // Redirect to the dashboard if the installation is already done
        if (hasInstalled) {
          return redirect(302, ['', 'ads', login].join('/'))
        }

        // Redirect to the account picker page if third party app access is enabled already
        if (hasEnabledThirdPartyAccess) {
          return redirect(302, ['', 'accounts', 'ads', 'login'].join('/'))
        }
      } catch (err) {
        $logErrorAndToast(err as Error)
        error({ statusCode: 500 })
      }
    }
  ]
})
export default class ADSIntermediaryPage extends Vue {
  validateLoading = false

  readonly documentationUrl =
    'https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/change-application-access-policies?view=azure-devops#manage-a-policy'
  orgSettingsUrl = ''

  timerId: ReturnType<typeof setTimeout>

  async fetch(): Promise<void> {
    try {
      const { login } = this.$route.params

      const response: GraphqlQueryResponse = await this.$fetchGraphqlData(
        ActiveUserADSOrgSettingsURL,
        { login }
      )

      if (!response.data.viewer) {
        throw new Error('Viewer information is missing from the query response')
      }

      const { viewer } = response.data

      this.orgSettingsUrl = viewer.adsOrganization?.orgSettingsUrl as string
    } catch (err) {
      this.$logErrorAndToast(err as Error)
    }
  }

  beforeDestroy() {
    clearTimeout(this.timerId)
  }

  async validateAction(): Promise<void> {
    try {
      this.validateLoading = true
      const { login } = this.$route.params

      const response: GraphqlQueryResponse = await this.$fetchGraphqlData(
        ActiveUserADSOrganizationInfo,
        { login },
        true
      )

      if (!response.data.viewer) {
        throw new Error('Viewer information is missing from the query response')
      }

      const { adsOrganization } = response.data.viewer

      if (!adsOrganization) {
        throw new Error('ADS organization information is missing from the query response')
      }

      const { hasInstalled, hasEnabledThirdPartyAccess } = adsOrganization

      if (hasInstalled) {
        this.$router.push(['', 'ads', login].join('/'))
        return
      }

      // Proceed with the onboarding steps
      if (hasEnabledThirdPartyAccess) {
        await this.$applyGraphqlMutation(ADSInstallationLandingGQLMutation, { input: { login } })
        this.$toast.success(`Successfully connected ${login} with DeepSource.`)

        this.timerId = setTimeout(() => {
          this.$router.push(['', 'onboard', 'ads', login, 'repositories'].join('/'))
        }, 300)

        return
      }

      // Show a danger toast if the third-party access is still disabled
      this.$toast.danger(
        'Third-party application access denied. Please toggle it on and try again.'
      )
    } catch (err) {
      const errMessage =
        (err as Error).message.replace('GraphQL error: ', '') ||
        'Something went wrong. Please try again.'

      this.$toast.danger(errMessage)
    } finally {
      this.validateLoading = false
    }
  }
}
</script>
