<template>
  <hero-card width="md" :showBackground="true" :showGlow="false" customClass="md:mb-24">
    <template v-if="dataState !== 'errored' && acceptInviteState !== 'errored'">
      <template v-if="details.joined">
        <h1 class="text-base font-bold leading-snug text-center text-vanilla-100">
          You're already a part of {{ details.teamName }}
        </h1>
        <p class="mt-4 text-sm text-center text-vanilla-400">Redirecting you to the home page</p>
      </template>
      <template v-else>
        <h1 class="text-base font-bold leading-snug text-center text-vanilla-100">
          Join {{ details.teamName }} on DeepSource
        </h1>
        <div
          class="flex items-center w-full p-2 mt-4 space-x-2 rounded-md bg-ink-100 bg-opacity-30"
        >
          <z-avatar :image="details.teamLogo" :userName="details.teamName"></z-avatar>
          <div>
            <h4 class="font-semibold text-vanilla-100">{{ details.teamName }}</h4>
            <p v-if="details.vcsProvider" class="text-xs text-vanilla-400">
              {{ $providerMetaMap[details.vcsProvider].text }} organization
            </p>
          </div>
        </div>
        <p class="mt-12 text-sm text-center text-vanilla-400">
          Connect with your team’s workspace.
        </p>
        <button
          @click="confirm"
          class="flex items-center w-full px-3 py-2 mt-2 space-x-2 rounded-md bg-ink-200 hover:bg-ink-300 text-vanilla-100 group"
        >
          <z-avatar
            v-if="viewer.avatar"
            :image="viewer.avatar"
            :fallback-image="context.emptyAvatarUrl"
            :userName="viewer.fullName || viewer.email"
            class="flex-shrink-0"
          ></z-avatar>
          <div class="flex-1 block overflow-hidden text-left overflow-ellipsis whitespace-nowrap">
            Continue as {{ viewer.firstName || viewer.email }}
          </div>
          <z-icon
            icon="chevron-right"
            size="medium"
            class="flex-shrink-0 duration-100 ease-linear transform group-hover:translate-x-1"
          ></z-icon>
        </button>
        <p class="mt-4 text-sm text-center text-vanilla-400">
          Need help? Write to us at
          <a
            :href="`mailto:${$config.supportEmail}`"
            class="cursor-pointer text-juniper hover:underline"
            >{{ $config.supportEmail }}</a
          >
        </p>
      </template>
    </template>
    <template v-else>
      <template v-if="acceptInviteState === 'errored'">
        <h1 class="text-lg font-bold leading-snug text-center text-vanilla-100">
          Couldn't join team
        </h1>
        <p class="mt-4 text-sm text-center text-vanilla-400">{{ error }}</p>
        <p class="mt-4 text-sm text-vanilla-400">
          Need help? Write to us at
          <a
            :href="`mailto:${$config.supportEmail}`"
            class="cursor-pointer text-juniper hover:underline"
            >{{ $config.supportEmail }}</a
          >
        </p>
      </template>
      <template v-else-if="dataState === 'errored'">
        <h1 class="text-lg font-bold leading-snug text-center text-vanilla-100">
          Invalid invite code
        </h1>
        <p class="mt-4 text-sm text-center text-vanilla-400">
          The invitation code is invalid, please contact the owner of the team for a new one.
        </p>
        <p class="mt-4 text-sm text-vanilla-400">
          Need help? Write to us at
          <a
            :href="`mailto:${$config.supportEmail}`"
            class="cursor-pointer text-juniper hover:underline"
            >{{ $config.supportEmail }}</a
          >
        </p>
      </template>
    </template>
  </hero-card>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZButton, ZAvatar, ZIcon } from '@deepsourcelabs/zeal'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import ContextMixin from '~/mixins/contextMixin'
import { AuthGetterTypes } from '~/store/account/auth'

import confirmInvitationMutation from '@/apollo/mutations/invitation/confirmInvitation.gql'
import getInvitationDetailsQuery from '@/apollo/queries/invitation/getTeamInviteInfo.gql'

import { ConfirmInvitationPayload, TeamInviteInfo } from '~/types/types'

export enum REQUEST_STATES {
  FETCHING = 'fetching',
  COMPLETED = 'completed',
  ERRORED = 'errored'
}

@Component({
  components: {
    ZButton,
    ZAvatar,
    ZIcon
  },
  middleware: [
    async function ({ store, route, redirect, error, $fetchGraphqlData }) {
      try {
        const res = await $fetchGraphqlData(getInvitationDetailsQuery, {
          invitationCode: route.params.code
        })
        const details = res.data.getTeamInviteInfo
        if (details.joined) {
          redirect(302, '/')
        }
      } catch (e) {
        error({ statusCode: 404, message: 'This page is not real' })
      }
      if (!store.getters[`account/auth/${AuthGetterTypes.GET_LOGGED_IN}`]) {
        redirect(302, `/signup/?next=${route.path}`)
      }
    }
  ]
})
export default class Invitation extends mixins(ContextMixin, ActiveUserMixin) {
  private details: ConfirmInvitationPayload | TeamInviteInfo = {}
  private dataState: REQUEST_STATES = REQUEST_STATES.COMPLETED
  private acceptInviteState: REQUEST_STATES = REQUEST_STATES.COMPLETED
  private error: string =
    'Something went wrong confirming the invitation, please the check the link provided to you.'

  async fetch(): Promise<void> {
    try {
      this.dataState = REQUEST_STATES.FETCHING
      await this.fetchActiveUserIfLoggedIn()
      const response = await this.$applyGraphqlMutation(getInvitationDetailsQuery, {
        invitationCode: this.$route.params.code
      })
      this.details = response.data.getTeamInviteInfo as TeamInviteInfo
      this.dataState = REQUEST_STATES.COMPLETED
    } catch (e) {
      this.dataState = REQUEST_STATES.ERRORED
      this.error = e as string
    }
  }

  async confirm(): Promise<void> {
    try {
      this.acceptInviteState = REQUEST_STATES.FETCHING

      const responsePayload = await this.$applyGraphqlMutation(confirmInvitationMutation, {
        invitationCode: this.$route.params.code
      })
      const response = responsePayload.data.confirmInvitation as ConfirmInvitationPayload

      if (response.ok) {
        this.acceptInviteState = REQUEST_STATES.COMPLETED
        if (this.details.vcsProvider && this.details.teamLogin) {
          await Promise.all([
            this.fetchActiveUser({ refetch: true }),
            this.fetchContext({ refetch: true })
          ])
          this.$router.push(
            `/${this.$providerMetaMap[this.details.vcsProvider].shortcode}/${
              this.details.teamLogin
            }`
          )
        } else {
          this.$router.push('/')
        }
      } else {
        this.acceptInviteState = REQUEST_STATES.ERRORED
        this.error =
          response.message || 'There was a problem while confirming your invite, please try again.'
      }
    } catch (e) {
      this.acceptInviteState = REQUEST_STATES.ERRORED
      this.error = e as string
    }
  }
}
</script>
