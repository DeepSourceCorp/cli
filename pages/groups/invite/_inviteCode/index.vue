<template>
  <hero-card width="md" :showBackground="true" :showGlow="false" customClass="md:mb-24">
    <template v-if="dataState !== 'errored' && acceptInviteState !== 'errored'">
      <h1 class="text-base font-bold leading-snug text-center text-vanilla-100">
        Join {{ details.name }} on DeepSource
      </h1>
      <div class="flex items-center w-full p-2 mt-4 space-x-2 rounded-md bg-ink-100 bg-opacity-30">
        <z-avatar :user-name="details.name" :loading="dataState === 'fetching'" />
        <div>
          <h4 class="font-semibold text-vanilla-100">{{ details.name }}</h4>
        </div>
      </div>
      <p class="mt-12 text-sm text-center text-vanilla-400">
        Connect with your organization's group.
      </p>
      <button
        @click="confirm"
        class="flex items-center w-full px-3 py-2 mt-2 space-x-2 rounded-md bg-ink-200 hover:bg-ink-300 text-vanilla-100 group"
      >
        <z-avatar
          v-if="viewer.avatar"
          :image="viewer.avatar"
          :fallback-image="context.emptyAvatarUrl"
          :user-name="viewer.fullName || viewer.email"
          :loading="dataState === 'fetching'"
          class="flex-shrink-0"
        />
        <div class="flex-1 block overflow-hidden text-left overflow-ellipsis whitespace-nowrap">
          Continue as {{ viewer.firstName || viewer.email }}
        </div>
        <z-icon
          icon="chevron-right"
          size="medium"
          class="flex-shrink-0 duration-100 ease-linear transform group-hover:translate-x-1"
        />
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
    <template v-else>
      <template v-if="acceptInviteState === 'errored'">
        <h1 class="text-lg font-bold leading-snug text-center text-vanilla-100">
          Couldn't join group
        </h1>
        <p class="mt-4 text-sm text-center text-vanilla-400">{{ error }}</p>
        <p class="mt-8 text-sm text-center">
          <nuxt-link to="/me" class="text-sm text-juniper hover:underline">
            <z-button label="Dashboard ->" size="small" @click="$router.push('/me')"
          /></nuxt-link>
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
      <template v-else-if="dataState === 'errored'">
        <h1 class="text-lg font-bold leading-snug text-center text-vanilla-100">
          Invalid invite code
        </h1>
        <p class="mt-4 text-sm text-center text-vanilla-400">
          The invitation code is invalid, please contact an admin of the organization for a new one.
        </p>
        <p class="mt-4 text-sm text-vanilla-400">
          Need help? Write to us at
          <a
            :href="`mailto:${$config.supportEmail}`"
            class="cursor-pointer text-juniper hover:underline"
            >{{ $config.supportEmail }}</a
          >.
        </p>
      </template>
    </template>
  </hero-card>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZButton, ZAvatar, ZIcon } from '@deepsourcelabs/zeal'
import ActiveUserMixin from '~/mixins/activeUserMixin'

import GetGroupInviteInfoQuery from '@/apollo/queries/control-panel/user-management/getGroupInviteInfo.gql'
import AcceptInviteMutation from '@/apollo/mutations/control-panel/user-management/acceptGroupInvite.gql'
import { GraphqlQueryResponse } from '~/types/apolloTypes'
import { GraphqlMutationResponse } from '~/types/apollo-graphql-types'
import ContextMixin from '~/mixins/contextMixin'

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
  meta: {
    auth: { strict: true, redirectToLogin: true }
  }
})
export default class Invitation extends mixins(ActiveUserMixin, ContextMixin) {
  private details: { name?: string } = {}
  private dataState: REQUEST_STATES = REQUEST_STATES.FETCHING
  private acceptInviteState: REQUEST_STATES = REQUEST_STATES.FETCHING
  private error: string =
    'Something went wrong confirming the invitation, please the check the link provided to you.'
  inviteCode = ''

  async fetch(): Promise<void> {
    try {
      this.inviteCode = this.$route.params.inviteCode
      this.dataState = REQUEST_STATES.FETCHING
      await this.fetchActiveUserIfLoggedIn()
      const response = (await this.$fetchGraphqlData(GetGroupInviteInfoQuery, {
        invitationCode: this.inviteCode
      })) as GraphqlQueryResponse
      if (response.data.getGroupInviteInfo?.name) {
        this.details.name = response.data.getGroupInviteInfo.name
        this.dataState = REQUEST_STATES.COMPLETED
      } else {
        this.dataState = REQUEST_STATES.ERRORED
      }
    } catch (e) {
      this.dataState = REQUEST_STATES.ERRORED
    }
  }

  async confirm(): Promise<void> {
    try {
      this.acceptInviteState = REQUEST_STATES.FETCHING

      const responsePayload = (await this.$applyGraphqlMutation(AcceptInviteMutation, {
        invitationCode: this.inviteCode
      })) as GraphqlMutationResponse

      if (responsePayload.data.acceptGroupInvite?.ok) {
        this.acceptInviteState = REQUEST_STATES.COMPLETED
        this.fetchContext()
        this.$router.push('/me')
      } else {
        this.acceptInviteState = REQUEST_STATES.ERRORED
      }
    } catch (e) {
      const gqlError = e as Error
      if (
        gqlError.message &&
        gqlError.message.split(':')?.[1].trim() === 'User is already a part of this group'
      ) {
        this.error = this.details.name
          ? `You are already a member of the group "${this.details.name}".`
          : 'You are already a member of the group.'
      }
      this.acceptInviteState = REQUEST_STATES.ERRORED
    }
  }
}
</script>
