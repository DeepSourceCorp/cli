<template>
  <div>
    <div class="p-4 border-b border-slate-400">
      <z-breadcrumb separator="/" class="text-sm text-vanilla-100">
        <z-breadcrumb-item class="cursor-pointer text-vanilla-400">
          <nuxt-link to="/control-panel/user-management">All users</nuxt-link>
        </z-breadcrumb-item>
        <z-breadcrumb-item> {{ orgUser.fullName || orgUser.email }} </z-breadcrumb-item>
      </z-breadcrumb>
    </div>
    <control-panel-user-header
      :org-user="orgUser"
      :loading="$fetchState.pending"
      @refetch="refetchData"
    />
    <div class="flex items-center justify-between px-4 border-b border-slate-400">
      <div class="flex gap-5 pt-3 overflow-auto flex-nowrap">
        <nuxt-link :to="`/control-panel/user-management/users/${$route.params.userId}`">
          <z-tab icon="building" border-active-color="vanilla-100" is-active> Groups </z-tab>
        </nuxt-link>
        <nuxt-link :to="`/control-panel/user-management/users/${$route.params.userId}/teams`">
          <z-tab icon="kayak"> Teams </z-tab>
        </nuxt-link>
      </div>
      <z-input
        placeholder="Search for a group..."
        size="small"
        :value="q"
        :show-border="false"
        background-color="ink-300"
        class="hidden w-full max-w-xs md:flex"
        @debounceInput="search"
      >
        <template slot="left">
          <z-icon icon="search" size="small" class="ml-1.5 flex-shrink-0" />
        </template>
      </z-input>
    </div>
    <control-panel-cards-skeleton v-if="$fetchState.pending" />
    <!-- HOTFIX: Nuxt SSR adds ghost a tags into dom during SSR -->
    <client-only v-else-if="userGroups.length">
      <div class="p-4 space-y-4">
        <nuxt-link
          v-for="group in userGroups"
          :key="group.id"
          :to="`/control-panel/user-management/groups/${group.id}`"
          class="grid items-center grid-cols-1 p-4 border rounded-md md:grid-cols-2 gap-x-10 gap-y-2 border-slate-400 hover:bg-ink-300"
        >
          <div class="flex items-center gap-x-3">
            <okta-icon-wrapper :is-okta="group.scimEnabled" class="flex-shrink-0">
              <z-avatar :user-name="group.name" class="flex-shrink-0" />
            </okta-icon-wrapper>
            <div>
              <p class="overflow-hidden text-sm w-44 overflow-ellipsis">
                {{ group.name }}
              </p>
              <div class="flex items-center gap-x-3">
                <div
                  v-if="group.members && group.members.totalCount"
                  class="flex items-center gap-x-1.5 text-vanilla-400"
                >
                  <z-icon icon="users" size="x-small" color="current" class="flex-shrink-0" />
                  <span class="text-xs"
                    >{{ group.members.totalCount }} member<span v-if="group.members.totalCount > 1"
                      >s</span
                    ></span
                  >
                </div>
                <div
                  v-if="group.teams && group.teams.totalCount"
                  class="flex items-center gap-x-1.5 text-vanilla-400"
                >
                  <z-icon icon="globe" size="x-small" color="current" class="flex-shrink-0" />
                  <span class="text-xs"
                    >{{ group.teams.totalCount }} team<span v-if="group.teams.totalCount > 1"
                      >s</span
                    ></span
                  >
                </div>
              </div>
            </div>
          </div>
          <div
            class="flex flex-wrap justify-start gap-2 mt-1 ml-12 md:flex-nowrap md:justify-self-end md:ml-0 md:mt-0"
          >
            <remove-user-from-group-button
              v-if="!group.scimEnabled"
              :org-user="orgUser"
              :group="group"
              @refetch="refetchData"
            />
          </div>
        </nuxt-link>
        <div class="flex justify-center mt-6 text-sm">
          <z-pagination
            v-if="totalPageCount > 1"
            :page="currentPage"
            :total-pages="totalPageCount"
            :total-visible="perPageCount"
            @selected="updatePageNum"
          />
        </div>
      </div>
    </client-only>
    <lazy-empty-state
      v-else-if="q.length"
      :title="`No groups with name '${q}' found`"
      :webp-image-path="require('~/assets/images/ui-states/directory/empty-search.webp')"
      :png-image-path="require('~/assets/images/ui-states/directory/empty-search.gif')"
    />
    <lazy-empty-state v-else title="No groups found" />
  </div>
</template>

<script lang="ts">
import { Component, mixins, namespace } from 'nuxt-property-decorator'
import {
  ZInput,
  ZButton,
  ZIcon,
  ZAvatar,
  ZBreadcrumb,
  ZBreadcrumbItem,
  ZTab,
  ZPagination
} from '@deepsource/zeal'

import { OrgUsersGetters, OrgUsersActions } from '~/store/control-panel/users'
import ControlPanelBaseMixin from '~/mixins/control-panel/ControlPanelBaseMixin'
import { EnterpriseGroup, EnterpriseUser } from '~/types/types'
import { resolveNodes } from '~/utils/array'
import PaginationMixin from '~/mixins/paginationMixin'

const userManagementStore = namespace('control-panel/users')

@Component({
  components: { ZInput, ZButton, ZIcon, ZAvatar, ZBreadcrumb, ZBreadcrumbItem, ZTab, ZPagination },
  layout: 'control-panel'
})
export default class UserManagementUserDetails extends mixins(
  ControlPanelBaseMixin,
  PaginationMixin
) {
  @userManagementStore.Getter(OrgUsersGetters.ORG_USER_DATA)
  orgUser: EnterpriseUser

  @userManagementStore.Action(OrgUsersActions.FETCH_ORG_USER_GROUP_DATA)
  fetchOrgUserGroupData: (args: {
    id: string
    q?: string
    first?: number
    offset?: number
    refetch?: boolean
  }) => Promise<void>

  q = ''
  perPageCount = 10
  refetch = true

  async fetch(): Promise<void> {
    const id = this.$route.params.userId
    await this.fetchOrgUserGroupData({
      id,
      q: this.q,
      first: this.perPageCount,
      offset: this.queryOffset,
      refetch: this.refetch
    })
    if (this.orgUser && Object.keys(this.orgUser).length < 1) {
      this.$nuxt.error({ statusCode: 404, message: `This page is not real` })
    }
    this.totalCount = this.orgUser.scimGroups.totalCount || 0
    this.refetch = false
  }

  get userGroups(): EnterpriseGroup[] {
    return resolveNodes(this.orgUser.scimGroups) as EnterpriseGroup[]
  }

  async search(q: string): Promise<void> {
    this.q = q
    this.currentPage = 1
    this.$fetch()
  }

  refetchData(): void {
    this.refetch = true
    this.$fetch()
  }
}
</script>
