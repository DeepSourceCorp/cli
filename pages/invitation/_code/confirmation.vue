<template>
  <hero-card width="md" :showBackground="true" :showGlow="false" customClass="md:mb-24">
    <template v-if="dataState !== 'errored' && acceptInviteState !== 'errored'">
      <template v-if="details.joined">
        <h1 class="text-vanilla-100 font-bold text-base text-center leading-snug">
          You're already a part of {{ details.teamName }}
        </h1>
        <p class="text-vanilla-400 text-sm text-center mt-4">Redirecting you to the home page</p>
      </template>
      <template v-else>
        <h1 class="text-vanilla-100 font-bold text-base text-center leading-snug">
          Join {{ details.teamName }} on DeepSource
        </h1>
        <div
          class="bg-ink-100 bg-opacity-30 rounded-md p-2 w-full mt-4 flex items-center space-x-2"
        >
          <z-avatar :image="details.teamLogo" :userName="details.teamName"></z-avatar>
          <div>
            <h4 class="text-vanilla-100 font-semibold">{{ details.teamName }}</h4>
            <p v-if="details.vcsProvider" class="text-xs text-vanilla-400">
              {{ $providerMetaMap[details.vcsProvider].text }} organization
            </p>
          </div>
        </div>
        <p class="text-vanilla-400 text-sm text-center mt-12">
          Connect with your team’s workspace.
        </p>
        <button
          @click="confirm"
          class="
            bg-ink-200
            hover:bg-ink-300
            rounded-md
            w-full
            text-vanilla-100
            px-3
            py-2
            flex
            items-center
            space-x-2
            group
            mt-2
          "
        >
          <z-avatar
            v-if="viewer.avatar"
            :image="viewer.avatar"
            :userName="viewer.fullName || viewer.email"
            class="flex-shrink-0"
          ></z-avatar>
          <div class="flex-1 text-left overflow-hidden overflow-ellipsis whitespace-nowrap block">
            Continue as {{ viewer.firstName || viewer.email }}
          </div>
          <z-icon
            icon="chevron-right"
            size="medium"
            class="transform duration-100 ease-linear group-hover:translate-x-1 flex-shrink-0"
          ></z-icon>
        </button>
        <p class="text-vanilla-400 mt-4 text-sm text-center">
          Need help? Write to us at
          <a
            :href="`mailto:${$config.supportEmail}`"
            class="text-juniper hover:underline cursor-pointer"
            >{{ $config.supportEmail }}</a
          >
        </p>
      </template>
    </template>
    <template v-else>
      <template v-if="acceptInviteState === 'errored'">
        <h1 class="text-vanilla-100 font-bold text-lg text-center leading-snug">
          Couldn't join team
        </h1>
        <p class="text-vanilla-400 text-sm text-center mt-4">{{ error }}</p>
        <p class="text-vanilla-400 mt-4 text-sm">
          Need help? Write to us at
          <a
            :href="`mailto:${$config.supportEmail}`"
            class="text-juniper hover:underline cursor-pointer"
            >{{ $config.supportEmail }}</a
          >
        </p>
      </template>
      <template v-else-if="dataState === 'errored'">
        <h1 class="text-vanilla-100 font-bold text-lg text-center leading-snug">
          Invalid invite code
        </h1>
        <p class="text-vanilla-400 text-sm text-center mt-4">
          The invitation code is invalid, please contact the owner of the team for a new one.
        </p>
        <p class="text-vanilla-400 mt-4 text-sm">
          Need help? Write to us at
          <a
            :href="`mailto:${$config.supportEmail}`"
            class="text-juniper hover:underline cursor-pointer"
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
import getInvitationDetailsMutation from '@/apollo/mutations/invitation/getInvitationDetails.gql'
import { ConfirmInvitationPayload } from '~/types/types'

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
    async function ({ store, route, redirect, error, $applyGraphqlMutation }) {
      try {
        const res = await $applyGraphqlMutation(getInvitationDetailsMutation, {
          invitationCode: route.params.code
        })
        const details = res.data.confirmInvitation
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
  private details: ConfirmInvitationPayload = {}
  private dataState: REQUEST_STATES = REQUEST_STATES.COMPLETED
  private acceptInviteState: REQUEST_STATES = REQUEST_STATES.COMPLETED
  private error: string =
    'Something went wrong confirming the invitation, please the check the link provided to you.'

  async fetch(): Promise<void> {
    try {
      this.dataState = REQUEST_STATES.FETCHING
      await this.fetchActiveUserIfLoggedIn()
      const response = await this.$applyGraphqlMutation(getInvitationDetailsMutation, {
        invitationCode: this.$route.params.code
      })
      this.details = response.data.confirmInvitation
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
      const response = responsePayload.data.confirmInvitation

      if (response.ok) {
        this.acceptInviteState = REQUEST_STATES.COMPLETED
        this.$router.push('/')
      } else {
        this.acceptInviteState = REQUEST_STATES.ERRORED
        this.error = response.message
      }
    } catch (e) {
      this.acceptInviteState = REQUEST_STATES.ERRORED
      this.error = e as string
    }
  }
}
</script>
