<template>
  <div class="p-4 border-b border-ink-200 lg:pb-7">
    <div class="flex flex-col md:flex-row gap-y-0.5">
      <div class="flex items-center gap-x-4">
        <!-- <okta-icon-wrapper dimensions="w-5 h-5" :is-okta="false" class="flex-shrink-0"> -->
        <z-avatar
          :image="orgUser.avatar"
          :user-name="orgUser.fullName || orgUser.email"
          :loading="loading"
          size="lg"
          class="flex-shrink-0"
        />
        <!-- </okta-icon-wrapper> -->
        <div v-if="loading" class="h-10 w-56 py-px bg-ink-300 animate-pulse"></div>
        <div v-else>
          <p class="font-medium">
            {{ orgUser.fullName || orgUser.email }}
          </p>
          <div class="flex flex-wrap md:flex-nowrap items-center gap-x-3 text-vanilla-400">
            <div class="flex items-center gap-x-1.5">
              <z-icon icon="mail" size="x-small" class="flex-shrink-0" />
              <span class="text-xs">{{ orgUser.email }}</span>
            </div>
            <div
              v-if="orgUser.groupsCount && orgUser.groupsCount.totalCount"
              class="flex items-center gap-x-1.5"
            >
              <z-icon icon="globe" size="x-small" class="flex-shrink-0" />
              <span class="text-xs"
                >{{ orgUser.groupsCount.totalCount }} group<span
                  v-if="orgUser.groupsCount.totalCount > 1"
                  >s</span
                ></span
              >
            </div>
            <div class="flex items-center gap-x-1.5">
              <z-icon icon="clock" size="x-small" class="flex-shrink-0" />
              <span class="text-xs"
                >Created {{ formatDate(parseISODate(orgUser.dateJoined)) }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex items-center mt-4 gap-x-3">
      <nuxt-link to="/control-panel/user-management/invites"
        ><z-button
          icon="plus"
          label="Add to group"
          size="small"
          @click="$router.push('/control-panel/user-management/invites')"
      /></nuxt-link>
      <delete-user-button :org-user="orgUser" @refetch="$emit('refetch')" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'
import { ZButton, ZAvatar, ZIcon } from '@deepsourcelabs/zeal'

import { EnterpriseUser } from '~/types/types'
import { formatDate, parseISODate } from '~/utils/date'

@Component({
  components: { ZButton, ZAvatar, ZIcon },
  name: 'ControlPanelUserHeader'
})
export default class ControlPanelUserHeader extends Vue {
  @Prop({ required: true })
  orgUser: EnterpriseUser

  @Prop({ default: false })
  loading: boolean

  parseISODate = parseISODate
  formatDate = formatDate
}
</script>
