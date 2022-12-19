<template>
  <base-card>
    <template slot="title">
      <span class="text-base">{{ description }}</span>
    </template>
    <template slot="description">
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
          <z-icon icon="trending-up" size="x-small" color="vanilla-400"></z-icon>
          <span>Last used on {{ parsedlastUsedAt }}</span>
        </span>
        <span
          v-else
          v-tooltip="{ content: 'Token last used', delay: { show: 300, hide: 100 } }"
          class="flex items-center space-x-2"
        >
          <z-icon icon="frown" size="x-small" color="vanilla-400"></z-icon>
          <span>Never used</span>
        </span>
      </p>
    </template>
    <template slot="info">
      <div class="flex items-center justify-around h-full">
        <z-button
          v-tooltip="'Delete token'"
          icon="trash-2"
          button-type="ghost"
          icon-color="cherry opacity-75"
          @click="$emit('delete', id)"
        />
      </div>
    </template>
  </base-card>
</template>

<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import ActiveUserMixin from '@/mixins/activeUserMixin'
import { ZButton, ZIcon } from '@deepsource/zeal'
import { parseISODate, formatDate, getDateDiffInDays } from '~/utils/date'
import { AccessTokenExpirationStatus } from '~/types/types'

@Component({
  components: {
    ZButton,
    ZIcon
  },
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
