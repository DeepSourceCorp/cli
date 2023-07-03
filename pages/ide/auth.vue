<template>
  <hero-layout>
    <template #header>
      <div class="flex justify-between">
        <div class="flex flex-grow items-center justify-between gap-x-3 sm:flex-grow-0">
          <z-icon icon="logo" color="current" />
          <z-divider direction="vertical" margin="ml-3 mr-1.5" class="hidden sm:block" />
          <div
            v-if="$fetchState.pending"
            class="flex h-6 w-44 animate-pulse items-center gap-x-2 rounded-md bg-ink-200"
          ></div>
          <logout-menu
            v-else-if="viewer"
            v-bind="logoutMenuProps"
            :is-loading="$fetchState.pending"
            @sign-out="signOut"
          />
        </div>
        <a
          v-if="$config.supportEmail"
          :href="`mailto:${$config.supportEmail}`"
          class="hidden h-9 items-center gap-2 rounded-sm border border-slate-400 px-3 py-1 text-sm text-vanilla-400 hover:bg-ink-300 focus:bg-ink-300 sm:flex"
        >
          <z-icon icon="support" />
          <span>Get help</span>
        </a>
      </div>
    </template>

    <template #body>
      <div class="flex w-full flex-col items-center justify-center gap-y-8 sm:max-w-sm">
        <enterprise-installation-logo :installation-logo="require('~/assets/images/vscode.webp')" />

        <div class="w-full space-y-4 text-center">
          <h1 class="text-lg font-medium leading-6 text-vanilla-100">
            <span> Connecting to VS Code... </span>
          </h1>
        </div>

        <div class="space-y-4">
          <p
            v-if="status === ideAuthMap.FAILED"
            class="flex flex-row space-x-4 rounded-md border border-cherry-500 border-opacity-20 bg-cherry bg-opacity-10 px-4 py-2 font-normal text-cherry"
          >
            <z-icon icon="alert-circle" color="cherry" class="mt-1 flex-shrink-0 self-start" />
            <span>Something went wrong :/</span>
          </p>

          <div
            class="items-left flex flex-col space-y-4 rounded-md border border-slate-400 py-5 px-6 bg-ink-300 bg-opacity-60 text-vanilla-100"
          >
            <span class="text-xs font-medium uppercase text-slate-200 tracking-wide">
              The vs code extension would be able to:
            </span>
            <p class="flex items-center space-x-4">
              <z-icon icon="check" color="juniper" class="mt-1 flex-shrink-0 self-start" />
              <span class="text-sm">Scan your local code and raise new issues</span>
            </p>
            <p class="flex items-center space-x-4">
              <z-icon icon="check" color="juniper" class="mt-1 flex-shrink-0 self-start" />
              <span class="text-sm">Pull baseline issues from your DeepSource dashboard</span>
            </p>
            <p class="flex items-center space-x-4">
              <z-icon icon="check" color="juniper" class="mt-1 flex-shrink-0 self-start" />
              <span class="text-sm">Help fix issues before you push code upstream</span>
            </p>
          </div>

          <div
            v-if="status !== ideAuthMap.EMPTY"
            class="mt-3 flex flex-col text-sm font-semibold"
            :class="
              [ideAuthMap.DENIED, ideAuthMap.PASSED].includes(status) ? 'visible' : 'invisible'
            "
          >
            <p
              v-if="status === ideAuthMap.DENIED"
              class="flex flex-row space-x-4 rounded-md border border-honey-500 border-opacity-20 bg-honey bg-opacity-10 px-4 py-2 font-normal text-honey-500"
            >
              <z-icon icon="alert-circle" color="honey" class="mt-1 flex-shrink-0" />
              <span>The connection request was denied :/</span>
            </p>
            <p
              v-else-if="status === ideAuthMap.PASSED"
              class="flex flex-row space-x-4 rounded-md border border-juniper-500 border-opacity-20 bg-juniper bg-opacity-10 px-4 py-2 font-normal text-juniper-500"
            >
              <z-icon icon="check-circle" color="juniper" class="mt-1 flex-shrink-0 self-start" />
              <span>Connection request approved. You may now close the window...</span>
            </p>
          </div>

          <div
            v-if="![ideAuthMap.DENIED, ideAuthMap.PASSED].includes(status)"
            class="flex flex-row space-x-2"
          >
            <button
              class="flex flex-row items-center place-content-center space-x-1 auxillary-button bg-ink-200 hover:bg-ink-100 text-vanilla-400 hover:text-vanilla-100 w-1/2 h-12"
              @click="denyIDE"
            >
              <z-icon icon="x" class="close-icon" height="30" />
              <span>Deny</span>
            </button>
            <z-button class="h-12 w-1/2" icon="check" button-type="primary" @click="acceptIDE"
              >Approve</z-button
            >
          </div>
        </div>
      </div>
    </template>
  </hero-layout>
</template>

<script lang="ts">
import { ZButton, ZCard, ZDivider, ZIcon } from '@deepsource/zeal'
import { Component, mixins } from 'nuxt-property-decorator'

import VerifyDeviceMutation from '~/apollo/mutations/cli/verifyDevice.gql'
import ActiveUserMixin from '~/mixins/activeUserMixin'

import AuthMixin from '~/mixins/authMixin'
import ContextMixin from '~/mixins/contextMixin'

import { IDEAuthActionTypes } from '~/store/account/ide'
import { getDefaultAvatar } from '~/utils/ui'

@Component({
  components: {
    ZButton,
    ZCard,
    ZIcon,
    ZDivider
  },
  data() {
    return {
      ideAuthMap: IDEAuthActionTypes
    }
  },
  methods: { getDefaultAvatar },
  meta: {
    auth: {
      strict: true,
      redirectToLogin: true
    }
  },
  middleware: ['betaOnly']
})
export default class IDEAuth extends mixins(ContextMixin, ActiveUserMixin, AuthMixin) {
  status = IDEAuthActionTypes.EMPTY
  user_code = ''

  async fetch(): Promise<void> {
    await Promise.all([this.fetchAuthUrls(), this.fetchActiveUser()])
  }

  mounted() {
    const { user_code } = this.$route.query
    if (user_code) {
      this.user_code = user_code as string
    }
  }

  async acceptIDE() {
    this.status = IDEAuthActionTypes.LOADING
    const input = { userCode: this.user_code, accepted: true }
    try {
      await this.$applyGraphqlMutation(VerifyDeviceMutation, { input })
      this.status = IDEAuthActionTypes.PASSED
    } catch (err) {
      const error = err as Error
      const errorMessage = 'There was an error while authenticating.' as `${string}.`
      this.$logErrorAndToast(error, errorMessage)
      this.status = IDEAuthActionTypes.FAILED
    }
  }

  async denyIDE() {
    this.status = IDEAuthActionTypes.LOADING
    const input = { userCode: this.user_code, accepted: false }
    try {
      await this.$applyGraphqlMutation(VerifyDeviceMutation, { input })
    } catch (err) {
      const error = err as Error
      if (error.message !== "The 'user_code' has expired") {
        const errorMessage = 'There was an error while authenticating.' as `${string}.`
        this.$logErrorAndToast(error, errorMessage)
        this.status = IDEAuthActionTypes.FAILED
      } else {
        this.status = IDEAuthActionTypes.DENIED
      }
    }
  }

  get logoutMenuProps() {
    const { avatar, email, fullName } = this.viewer
    return {
      avatar,
      email,
      fullName
    }
  }
}
</script>

<style scoped lang="postcss">
.auxillary-button:hover .close-icon {
  @apply text-vanilla-100;
}
</style>
