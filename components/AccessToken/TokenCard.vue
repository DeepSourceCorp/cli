<template>
  <base-card :remove-default-style="true">
    <template #title>
      <span class="text-base font-medium">{{ description }}</span>
    </template>
    <template #description>
      <p class="flex items-center space-x-4 text-sm">
        <span
          v-tooltip="{ content: 'Token expiry status', delay: { show: 300, hide: 100 } }"
          class="flex items-center space-x-1.5"
        >
          <template v-if="expirationStatus === 'EXPIRED'">
            <z-icon icon="alert-circle" size="x-small" color="cherry" />
            <span class="text-cherry">Token expired on {{ expiry }}</span>
          </template>
          <template v-else-if="expiryDiff <= 5">
            <z-icon icon="alert-triangle" size="x-small" color="honey" />
            <span class="text-honey">
              <template v-if="expiryDiff === 0"> Token expires today </template>
              <template v-else>
                Token expires in {{ expiryDiff }} {{ expiryDiff === 1 ? 'day' : 'days' }}
              </template>
            </span>
          </template>
          <template v-else>
            <z-icon icon="clock" size="x-small" color="vanilla-400" />
            <span v-if="expiresAt && expirationStatus === 'ACTIVE'"> Expires on {{ expiry }}</span>
            <span v-else-if="expirationStatus === 'DOES_NOT_EXPIRE'"> Token does not expire </span>
          </template>
        </span>
        <span
          v-if="lastUsedAt"
          v-tooltip="{ content: 'Token last used', delay: { show: 300, hide: 100 } }"
          class="flex items-center space-x-2"
        >
          <z-icon icon="trending-up" size="x-small" color="vanilla-400" />
          <span>Last used on {{ parsedlastUsedAt }}</span>
        </span>
        <span
          v-else
          v-tooltip="{ content: 'Token last used', delay: { show: 300, hide: 100 } }"
          class="flex items-center space-x-2"
        >
          <z-icon icon="frown" size="x-small" color="vanilla-400" />
          <span>Never used</span>
        </span>
      </p>
    </template>
    <template #info>
      <div class="flex h-full items-center justify-end pr-3.5">
        <z-button v-tooltip="'Delete token'" button-type="ghost" @click="$emit('delete', id)">
          <z-icon icon="trash-2" color="cherry opacity-75" />
        </z-button>
      </div>
    </template>
  </base-card>
</template>

<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import ActiveUserMixin from '@/mixins/activeUserMixin'

import { parseISODate, formatDate, getDateDiffInDays } from '~/utils/date'
import { AccessTokenExpirationStatus } from '~/types/types'

@Component({
  meta: {
    auth: {
      strict: true,
      redirectToLogin: true
    }
  },
  layout: 'user'
})
export default class PersonalAccessTokenCard extends mixins(ActiveUserMixin) {
  @Prop()
  id: string

  @Prop()
  description: string

  @Prop()
  expiresAt: string

  @Prop()
  expirationStatus:
    | AccessTokenExpirationStatus.Active
    | AccessTokenExpirationStatus.Expired
    | AccessTokenExpirationStatus.DoesNotExpire

  @Prop()
  lastUsedAt: string

  get expiry(): string {
    return formatDate(parseISODate(this.expiresAt), 'll')
  }

  get expiryDiff(): number {
    // this ensures
    return getDateDiffInDays(this.expiresAt, String(new Date(Date.now())), true)
  }

  get parsedlastUsedAt(): string {
    return formatDate(parseISODate(this.lastUsedAt), 'll')
  }
}
</script>
