<template>
  <div>
    <div class="border-b border-slate-400 p-4">
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
    <div class="flex items-center justify-between border-b border-slate-400 px-4">
      <div class="flex flex-nowrap gap-5 overflow-auto pt-3">
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
        <template #left>
          <z-icon icon="search" size="small" class="ml-1.5 flex-shrink-0" />
        </template>
      </z-input>
    </div>
    <control-panel-cards-skeleton v-if="$fetchState.pending" />
    <!-- HOTFIX: Nuxt SSR adds ghost a tags into dom during SSR -->
    <client-only v-else-if="userTeams.length">
      <div class="space-y-4 p-4">
        <div
          v-for="team in userTeams"
          :key="team.id"
          class="grid grid-cols-1 items-center gap-x-10 gap-y-2 rounded-md border border-slate-400 p-4 md:grid-cols-2"
        >
          <div class="flex items-center gap-x-3">
            <z-avatar
              :image="team.avatar"
              :user-name="team.name || team.login"
              :fallback-image="getDefaultAvatar(team.login, false)"
              class="flex-shrink-0"
            />
            <div>
              <p class="w-44 overflow-hidden overflow-ellipsis text-sm">
                {{ team.name || team.login }}
              </p>
              <div class="flex items-center gap-x-3">
                <div
                  v-if="team.members && team.members.totalCount"
                  class="flex items-center gap-x-1.5 text-vanilla-400"
                >
                  <z-icon icon="users" size="x-small" color="current" class="flex-shrink-0" />
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
            class="ml-12 mt-1 flex flex-wrap justify-start gap-2 md:ml-0 md:mt-0 md:flex-nowrap md:justify-self-end"
          >
            <remove-user-from-team-button
              v-if="team.isDirectMember"
              :org-user="orgUser"
              :team="team"
              @refetch="refetchData"
            />
          </div>
        </div>
        <div class="mt-6 flex justify-center text-sm">
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
      :title="`No teams with name '${q}' found`"
      :webp-image-path="require('~/assets/images/ui-states/directory/empty-search.webp')"
      :png-image-path="require('~/assets/images/ui-states/directory/empty-search.gif')"
    />
    <lazy-empty-state v-else title="No teams found" />
  </div>
</template>

<script lang="ts">
import { Component, mixins, namespace } from 'nuxt-property-decorator'

import { OrgUsersGetters, OrgUsersActions } from '~/store/control-panel/users'
import ControlPanelBaseMixin from '~/mixins/control-panel/ControlPanelBaseMixin'
import { EnterpriseTeam, EnterpriseUser } from '~/types/types'
import { parseISODate, formatDate } from '~/utils/date'
import { resolveNodes } from '~/utils/array'
import PaginationMixin from '~/mixins/paginationMixin'
import { getDefaultAvatar } from '~/utils/ui'

const userManagementStore = namespace('control-panel/users')

@Component({
  methods: { parseISODate, formatDate, getDefaultAvatar },
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

  get userTeams(): EnterpriseTeam[] {
    return resolveNodes(this.orgUser.teams)
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
