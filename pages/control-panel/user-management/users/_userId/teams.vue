<template>
  <div>
    <div class="p-4 border-b border-ink-200">
      <z-breadcrumb separator="/" class="text-sm text-vanilla-100">
        <z-breadcrumb-item class="cursor-pointer text-vanilla-400">
          <nuxt-link to="/control-panel/user-management">All users</nuxt-link>
        </z-breadcrumb-item>
        <z-breadcrumb-item> {{ orgUser.fullName || orgUser.email }} </z-breadcrumb-item>
      </z-breadcrumb>
    </div>
    <control-panel-user-header :org-user="orgUser" :loading="$fetchState.pending" />
    <div class="flex items-center justify-between px-4 border-b border-ink-200">
      <div class="flex gap-5 pt-3 overflow-auto flex-nowrap">
        <nuxt-link :to="`/control-panel/user-management/users/${$route.params.userId}`">
          <z-tab icon="building"> Groups </z-tab>
        </nuxt-link>
        <nuxt-link :to="`/control-panel/user-management/users/${$route.params.userId}/teams`">
          <z-tab icon="kayak" border-active-color="vanilla-100" is-active> Teams </z-tab>
        </nuxt-link>
      </div>
      <z-input
        placeholder="Search for a team..."
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
    <client-only v-else-if="userTeams.length">
      <div class="p-4 space-y-4">
        <div
          v-for="team in userTeams"
          :key="team.id"
          class="
            grid
            items-center
            grid-cols-1
            p-4
            border
            rounded-md
            md:grid-cols-2
            gap-x-10 gap-y-2
            border-ink-200
          "
        >
          <div class="flex items-center gap-x-3">
            <z-avatar
              :image="team.avatar"
              :user-name="team.name || team.login"
              class="flex-shrink-0"
            />
            <div>
              <p class="overflow-hidden text-sm w-44 overflow-ellipsis">
                {{ team.name || team.login }}
              </p>
              <div class="flex items-center gap-x-3">
                <div
                  v-if="team.members && team.members.totalCount"
                  class="flex items-center gap-x-1.5 text-vanilla-400"
                >
                  <z-icon icon="users" size="x-small" color="currentColor" class="flex-shrink-0" />
                  <span class="text-xs"
                    >{{ team.members.totalCount }} member<span v-if="team.members.totalCount > 1"
                      >s</span
                    ></span
                  >
                </div>
              </div>
            </div>
          </div>
          <div
            v-if="team.isDirectMember"
            class="
              flex flex-wrap
              justify-start
              gap-2
              mt-1
              ml-12
              md:flex-nowrap md:justify-self-end md:ml-0 md:mt-0
            "
          >
            <remove-user-from-team-button
              v-if="team.isDirectMember"
              :org-user="orgUser"
              :team="team"
              @refetch="refetchData"
            />
          </div>
        </div>
        <div class="flex justify-center mt-6 text-sm">
          <z-pagination
            v-if="totalPageCount > 1"
            :page="currentPage"
            :totalPages="totalPageCount"
            :totalVisible="perPageCount"
            @selected="updatePageNum"
          />
        </div>
      </div>
    </client-only>
    <lazy-empty-state
      v-else-if="q.length"
      :title="`No teams with name '${q}' found`"
      :webp-image-path="require('~/assets/images/ui-states/directory/empty-search.webp')"
      :png-image-path="require('~/assets/images/ui-states/directory/empty-search.png')"
    />
    <lazy-empty-state v-else title="No teams found" />
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
} from '@deepsourcelabs/zeal'

import { OrgUsersGetters, OrgUsersActions } from '~/store/control-panel/users'
import ControlPanelBaseMixin from '~/mixins/control-panel/ControlPanelBaseMixin'
import { EnterpriseUser, Team } from '~/types/types'
import { parseISODate, formatDate } from '~/utils/date'
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

  @userManagementStore.Action(OrgUsersActions.FETCH_ORG_USER_TEAM_DATA)
  fetchOrgUserTeamData: (args: {
    id: string
    q?: string
    first?: number
    offset?: number
    refetch?: boolean
  }) => Promise<void>

  @userManagementStore.Action(OrgUsersActions.DELETE_USER)
  deleteUserFromOrg: (args: { userId: string }) => Promise<boolean>

  parseISODate = parseISODate
  formatDate = formatDate
  q = ''
  perPageCount = 10
  refetch = true

  async fetch(): Promise<void> {
    const id = this.$route.params.userId
    await this.fetchOrgUserTeamData({
      id,
      q: this.q,
      first: this.perPageCount,
      offset: this.queryOffset,
      refetch: this.refetch
    })
    if (this.orgUser && Object.keys(this.orgUser).length < 1) {
      this.$nuxt.error({ statusCode: 404, message: `This page is not real` })
    }
    this.totalCount = this.orgUser.teams.totalCount || 0
    this.refetch = false
  }

  get userTeams(): Team[] {
    return resolveNodes(this.orgUser.teams) as Team[]
  }

  async deleteUser(userId: string) {
    const response = await this.deleteUserFromOrg({ userId })
    if (response) {
      this.$toast.success('User deleted succesfully.')
      this.$router.push('/control-panel/user-management')
    } else {
      this.$toast.danger('An error occured while deleting user, please try again.')
      this.refetch = true
      this.$fetch()
    }
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
