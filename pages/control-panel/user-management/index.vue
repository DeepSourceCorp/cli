<template>
  <div>
    <div
      class="px-4 py-3.5 flex flex-col lg:items-center lg:flex-row gap-4 justify-between border-b border-slate-400"
    >
      <h1 class="text-lg font-medium leading-none">All users</h1>
      <div class="flex items-center justify-end w-full max-w-lg gap-x-2">
        <z-input
          placeholder="Search for a name or email..."
          size="small"
          :value="q"
          :show-border="false"
          background-color="ink-300"
          class="w-full max-w-xs"
          @debounceInput="searchUsers"
        >
          <template slot="left"> <z-icon icon="search" size="small" class="ml-1.5" /> </template>
        </z-input>
        <nuxt-link to="/control-panel/user-management/invites">
          <z-button
            icon="user-plus"
            label="Invite new member"
            size="small"
            class="hidden md:inline-flex"
            @click="$router.push('/control-panel/user-management/invites')"
          />
          <z-button
            icon="user-plus"
            size="small"
            class="inline-flex md:hidden"
            @click="$router.push('/control-panel/user-management/invites')"
          />
        </nuxt-link>
      </div>
    </div>
    <control-panel-cards-skeleton v-if="$fetchState.pending" :card-count="7" />
    <!-- HOTFIX: Nuxt SSR adds ghost a tags into dom during SSR -->
    <client-only v-else-if="orgUsers.length">
      <div class="p-4 space-y-4">
        <nuxt-link
          v-for="orgUser in orgUsers"
          :key="orgUser.id"
          :to="`/control-panel/user-management/users/${orgUser.id}`"
          class="grid items-center grid-cols-1 p-4 border rounded-md md:grid-cols-3 gap-x-4 gap-y-1 border-slate-400 hover:bg-ink-300"
        >
          <control-panel-user-card-info
            :org-user="orgUser"
            :loading="$fetchState.pending"
            class="md:col-span-2"
          />
          <div class="ml-12 md:ml-0 md:justify-self-end">
            <span
              v-if="resolveNodes(orgUser.teams).length"
              class="flex items-center text-sm text-vanilla-400 gap-x-2"
            >
              <z-icon icon="building" size="x-small" class="flex-shrink-0" />
              <p>
                {{ resolveNodes(orgUser.teams)[0].name }}
                <span v-if="resolveNodes(orgUser.teams).length === 2">
                  and {{ resolveNodes(orgUser.teams)[1].name }}
                </span>
                <span v-else-if="resolveNodes(orgUser.teams).length > 2"
                  >+ {{ resolveNodes(orgUser.teams).length - 1 }} more</span
                >
              </p>
            </span>
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
import { ZInput, ZButton, ZIcon, ZPagination } from '@deepsource/zeal'

import { OrgUsersGetters, OrgUsersActions } from '~/store/control-panel/users'
import ControlPanelBaseMixin from '~/mixins/control-panel/ControlPanelBaseMixin'
import PaginationMixin from '~/mixins/paginationMixin'
import { EnterpriseUser } from '~/types/types'
import { resolveNodes } from '~/utils/array'

const userManagementStore = namespace('control-panel/users')

@Component({
  components: { ZInput, ZButton, ZIcon, ZPagination },
  layout: 'control-panel',
  methods: {
    resolveNodes
  }
})
export default class UserManagementHome extends mixins(ControlPanelBaseMixin, PaginationMixin) {
  @userManagementStore.Getter(OrgUsersGetters.ORG_USERS_DATA)
  orgUsers: EnterpriseUser[]

  @userManagementStore.Action(OrgUsersActions.FETCH_ORG_USERS_DATA)
  fetchOrgUsersData: (args?: { q?: string; first?: number; offset?: number }) => Promise<number>

  perPageCount = 10
  q = ''

  async fetch() {
    this.totalCount = await this.fetchOrgUsersData({
      first: this.perPageCount,
      offset: this.queryOffset,
      q: this.q
    })
  }

  searchUsers(q: string): void {
    this.currentPage = 1
    this.q = q
    this.$fetch()
  }
}
</script>
