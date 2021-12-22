<template>
  <div class="p-4 border-b border-ink-200" :class="{ 'lg:pb-7': !orgUser.scimEnabled }">
    <div class="flex flex-col md:flex-row gap-y-0.5">
      <div class="flex items-center gap-x-4">
        <okta-icon-wrapper
          dimensions="w-5 h-5"
          :is-okta="orgUser.scimEnabled"
          class="flex-shrink-0"
        >
          <z-avatar
            :image="orgUser.avatar"
            :user-name="orgUser.fullName || orgUser.email"
            :loading="loading"
            size="lg"
            class="flex-shrink-0"
          />
        </okta-icon-wrapper>
        <div v-if="loading" class="w-56 h-10 py-px bg-ink-300 animate-pulse"></div>
        <div v-else>
          <p class="font-medium">
            {{ orgUser.fullName || orgUser.email }}
          </p>
          <div class="flex flex-wrap items-center md:flex-nowrap gap-x-3 gap-y-1 text-vanilla-400">
            <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
              <z-tag
                icon-left="solid-circle"
                bg-color="ink-300"
                text-size="xxs"
                size="x-small"
                spacing="px-1.5 py-1"
                :icon-color="orgUser.isActive ? 'juniper' : 'honey'"
                class="font-semibold leading-none tracking-wide uppercase text-vanilla-400 gap-x-1"
              >
                {{ orgUser.isActive ? 'Active' : 'Inactive' }}
              </z-tag>
              <z-tag
                v-if="orgUser.isSuperuser"
                icon-left="solid-circle"
                bg-color="ink-300"
                text-size="xxs"
                size="x-small"
                spacing="px-1.5 py-1"
                icon-color="robin"
                class="font-semibold leading-none tracking-wide uppercase text-vanilla-400 gap-x-1"
              >
                Superuser
              </z-tag>
            </div>
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
    <div v-if="!orgUser.scimEnabled" class="flex flex-wrap items-center gap-3 mt-4">
      <nuxt-link-button to="/control-panel/user-management/invites">
        <z-icon icon="plus" color="current" size="small" class="mr-0.5" />
        <span>Add to group</span>
      </nuxt-link-button>
      <toggle-user-active-button :org-user="orgUser" @refetch="$emit('refetch')" />
      <delete-user-button :org-user="orgUser" @refetch="$emit('refetch')" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'
import { ZButton, ZAvatar, ZIcon, ZTag } from '@deepsourcelabs/zeal'

import { EnterpriseUser } from '~/types/types'
import { formatDate, parseISODate } from '~/utils/date'

@Component({
  components: { ZButton, ZAvatar, ZIcon, ZTag },
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
