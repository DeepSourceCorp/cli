<template>
  <hero-card>
    <h1 class="text-center text-2xl font-bold leading-snug text-vanilla-100">
      Select an Azure Devops Services organization
    </h1>

    <p class="mt-4 text-center text-base text-vanilla-400">
      You would be able to use DeepSource on all repositories that you have access to.
    </p>

    <div class="hide-scroll mt-10 flex max-h-80 flex-col items-center space-y-4 overflow-auto">
      <template v-if="$fetchState.pending">
        <div v-for="ii in 4" :key="ii" class="h-14 w-full animate-pulse bg-ink-300"></div>
      </template>

      <template v-else-if="viewer && viewer.adsOrganizations">
        <button
          v-for="organization in viewer.adsOrganizations"
          :key="organization.login"
          :disabled="loading"
          :class="organization.hasInstalled ? 'cursor bg-ink-200' : 'bg-ink-200 hover:bg-ink-300'"
          class="group mt-2 flex w-full items-center space-x-2 rounded-md px-3 py-2 text-vanilla-100"
          @click="selectOrganization(organization)"
        >
          <z-avatar
            :image="getDefaultAvatar(organization.login, false)"
            :user-name="organization.login"
            class="flex-shrink-0"
          />
          <div class="flex-grow overflow-hidden overflow-ellipsis text-left">
            <div>{{ organization.login }}</div>
            <p class="text-xs text-vanilla-400">ADS organization</p>
          </div>
          <z-icon
            v-if="organization.hasInstalled"
            icon="check-circle"
            size="medium"
            color="juniper"
          />
          <z-icon
            v-else-if="!organization.hasEnabledThirdPartyAccess"
            icon="alert-circle"
            size="medium"
            color="cherry"
          />

          <z-icon
            v-if="loadingOrganization === organization.login"
            icon="spin-loader"
            size="medium"
            color="juniper"
            class="animate-spin"
          />
          <z-icon
            v-else
            icon="chevron-right"
            size="medium"
            class="flex-shrink-0 transform duration-100 ease-linear group-hover:translate-x-1"
          />
        </button>
      </template>
    </div>

    <p class="mt-4 text-sm text-vanilla-400">
      Need help? Write to us at
      <a
        :href="`mailto:${$config.supportEmail}`"
        class="cursor-pointer text-juniper hover:underline"
        >{{ $config.supportEmail }}</a
      >
    </p>
  </hero-card>
</template>

<script lang="ts">
import { ZAlert, ZAvatar, ZButton, ZIcon } from '@deepsource/zeal'
import { Component, mixins } from 'nuxt-property-decorator'

import ADSInstallationLandingGQLMutation from '@/apollo/mutations/installation/adsInstallationLanding.gql'

import ActiveUserMixin from '~/mixins/activeUserMixin'
import { AdsOrganization } from '~/types/types'
import { getDefaultAvatar } from '~/utils/ui'

@Component({
  components: {
    ZAlert,
    ZAvatar,
    ZButton,
    ZIcon
  },
  meta: {
    auth: {
      strict: true,
      redirectToLogin: true
    }
  },
  methods: { getDefaultAvatar }
})
export default class ADSAccountPickerPage extends mixins(ActiveUserMixin) {
  loading = false
  loadingOrganization = ''

  timerId: ReturnType<typeof setTimeout>

  async fetch(): Promise<void> {
    try {
      await this.fetchActiveUserADSOrganizations()
    } catch (e) {
      this.$logErrorAndToast(e as Error, `${(e as Error).message}.` as `${string}.`, this.viewer)
    }
  }

  beforeDestroy() {
    clearTimeout(this.timerId)
  }

  async selectOrganization({
    login,
    hasInstalled,
    hasEnabledThirdPartyAccess
  }: AdsOrganization): Promise<void> {
    if (!login) {
      return
    }

    if (hasInstalled) {
      this.$router.push(['', 'ads', login].join('/'))
      return
    }

    // Redirect to the `accounts/ads/login/<login>` route that asks to enable third party OAuth app access
    if (!hasEnabledThirdPartyAccess) {
      this.$router.push(['', 'accounts', 'ads', 'login', login].join('/'))
      return
    }

    this.loading = true
    this.loadingOrganization = login
    try {
      await this.$applyGraphqlMutation(ADSInstallationLandingGQLMutation, { input: { login } })
      this.$toast.success(`Successfully connected ${login} with DeepSource.`)

      this.timerId = setTimeout(() => {
        this.$router.push(['', 'onboard', 'ads', login, 'repositories'].join('/'))
      }, 300)
    } catch (e) {
      this.$toast.danger('Something went wrong while connecting your organization')
    } finally {
      this.loading = false
      this.loadingOrganization = ''
    }
  }
}
</script>
