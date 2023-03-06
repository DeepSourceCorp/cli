<template>
  <div>
    <div class="px-4 py-4 border-b border-slate-400">
      <z-breadcrumb separator="/" class="text-sm text-vanilla-100">
        <z-breadcrumb-item class="cursor-pointer text-vanilla-400">
          <nuxt-link to="/control-panel/user-management/groups">Groups</nuxt-link>
        </z-breadcrumb-item>
        <z-breadcrumb-item> {{ group.name }} </z-breadcrumb-item>
      </z-breadcrumb>
    </div>
    <control-panel-group-header
      :group="group"
      :loading="$fetchState.pending"
      @refetch="refetchData"
    />
    <div class="flex items-center justify-between px-4 border-b border-slate-400">
      <div class="flex gap-5 pt-3 overflow-auto flex-nowrap">
        <nuxt-link :to="`/control-panel/user-management/groups/${$route.params.groupId}`">
          <z-tab icon="users" border-active-color="vanilla-100" is-active> Users </z-tab>
        </nuxt-link>
        <nuxt-link :to="`/control-panel/user-management/groups/${$route.params.groupId}/teams`">
          <z-tab icon="kayak"> Teams </z-tab>
        </nuxt-link>
      </div>
      <z-input
        placeholder="Search for a name or email..."
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
    <client-only v-else-if="groupUsers.length">
      <div class="p-4 space-y-4">
        <nuxt-link
          v-for="user in groupUsers"
          :key="user.id"
          :to="`/control-panel/user-management/users/${user.id}`"
          class="grid items-center grid-cols-1 p-4 border rounded-md md:grid-cols-3 gap-x-4 gap-y-2 border-slate-400 hover:bg-ink-300"
        >
          <control-panel-user-card-info
            :org-user="user"
            :loading="$fetchState.pending"
            class="md:col-span-2"
          />
          <div
            class="flex flex-wrap justify-start gap-2 mt-1 ml-12 md:flex-nowrap md:justify-self-end md:ml-0 md:mt-0"
          >
            <remove-user-from-group-button
              v-if="!group.scimEnabled"
              :org-user="user"
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
      :title="`No users with name or email '${q}' found`"
      :webp-image-path="require('~/assets/images/ui-states/directory/empty-search.webp')"
      :png-image-path="require('~/assets/images/ui-states/directory/empty-search.gif')"
    />
    <lazy-empty-state v-else title="No users found" />
  </div>
</template>

<script lang="ts">
import { Component, mixins, namespace } from 'nuxt-property-decorator'
import { ZInput, ZIcon, ZBreadcrumb, ZBreadcrumbItem, ZTab, ZPagination } from '@deepsource/zeal'

import { OrgGroupsActions, OrgGroupsGetters } from '~/store/control-panel/groups'
import ControlPanelBaseMixin from '~/mixins/control-panel/ControlPanelBaseMixin'
import { EnterpriseGroup, EnterpriseUser } from '~/types/types'
import { parseISODate, formatDate } from '~/utils/date'
import { resolveNodes } from '~/utils/array'
import PaginationMixin from '~/mixins/paginationMixin'

const groupManagementStore = namespace('control-panel/groups')

@Component({
  components: {
    ZInput,
    ZIcon,
    ZBreadcrumb,
    ZBreadcrumbItem,
    ZTab,
    ZPagination
  },
  methods: { parseISODate, formatDate },
  layout: 'control-panel'
})
export default class UserManagementUserDetails extends mixins(
  ControlPanelBaseMixin,
  PaginationMixin
) {
  @groupManagementStore.Getter(OrgGroupsGetters.ORG_GROUP_DATA)
  group: EnterpriseGroup

  @groupManagementStore.Action(OrgGroupsActions.FETCH_ORG_GROUP_USER_DATA)
  fetchOrgGroupUsersData: (args: {
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
    const id = this.$route.params.groupId
    await this.fetchOrgGroupUsersData({
      id,
      q: this.q,
      first: this.perPageCount,
      offset: this.queryOffset,
      refetch: this.refetch
    })
    if (this.group && Object.keys(this.group).length < 1) {
      this.$nuxt.error({ statusCode: 404, message: `This page is not real` })
    }
    this.totalCount = this.group.members?.totalCount || 0
    this.refetch = false
  }

  get groupUsers(): EnterpriseUser[] {
    return resolveNodes(this.group.members) as EnterpriseUser[]
  }

  refetchData(): void {
    this.refetch = true
    this.$fetch()
  }

  async search(q: string): Promise<void> {
    this.q = q
    this.currentPage = 1
    this.$fetch()
  }
}
</script>
