<template>
  <div>
    <div class="px-4 py-4 border-b border-ink-200">
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
    <div class="flex items-center justify-between px-4 border-b border-ink-200">
      <div class="flex gap-5 pt-3 overflow-auto flex-nowrap">
        <nuxt-link :to="`/control-panel/user-management/groups/${$route.params.groupId}`">
          <z-tab icon="users"> Users </z-tab>
        </nuxt-link>
        <nuxt-link :to="`/control-panel/user-management/groups/${$route.params.groupId}/teams`">
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
    <client-only v-else-if="groupTeams.length">
      <div class="p-4 space-y-4">
        <div
          v-for="team in groupTeams"
          :key="team.id"
          class="grid items-center grid-cols-1 p-4 border rounded-md md:grid-cols-2 gap-x-10 gap-y-2 border-ink-200"
        >
          <div class="flex items-center gap-x-3">
            <z-avatar
              :image="team.team.avatar"
              :user-name="team.team.name || team.team.login"
              :fallback-image="getDefaultAvatar(team.team.login, false)"
              class="flex-shrink-0"
            />
            <div>
              <p class="overflow-hidden text-sm w-44 overflow-ellipsis">
                {{ team.team.name || team.team.login }}
              </p>
              <div class="flex items-center gap-x-3">
                <div
                  v-if="team.team.members && team.team.members.totalCount"
                  class="flex items-center gap-x-1.5 text-vanilla-400"
                >
                  <z-icon icon="users" size="x-small" color="current" class="flex-shrink-0" />
                  <span class="text-xs"
                    >{{ team.team.members.totalCount }} member<span
                      v-if="team.team.members.totalCount > 1"
                      >s</span
                    ></span
                  >
                </div>
              </div>
            </div>
          </div>
          <div
            class="flex items-center justify-between mt-1 md:justify-end md:justify-self-end md:mt-0 gap-x-8"
          >
            <div class="flex items-center gap-x-1.5 leading-none">
              <div class="text-sm text-vanilla-400">Role:</div>
              <z-menu width="large" direction="left">
                <template v-slot:trigger="{ toggle }">
                  <button
                    type="button"
                    class="flex items-center space-x-1 text-sm outline-none focus:outline-none w-28"
                    @click="toggle"
                  >
                    <span>{{ TEAM_PERMS[team.role].title }}</span>
                    <z-icon size="small" icon="chevron-down" />
                  </button>
                </template>
                <template slot="body">
                  <z-menu-section :divider="false" class="text-left">
                    <z-menu-item v-for="(opt, key) in TEAM_PERMS" :key="key" class="text-sm">
                      <div
                        role="button"
                        @click="updateTeamRole(group.id, team.team.id, key)"
                        class="w-full"
                      >
                        <div class="flex items-center space-x-2">
                          <span :class="key === team.role ? 'font-semibold' : ''">{{
                            opt.title
                          }}</span>
                          <z-icon
                            v-if="key === team.role"
                            size="small"
                            icon="check"
                            color="vanilla-100"
                            class="flex-shrink-0"
                          />
                        </div>
                        <p class="mt-1 text-xs leading-snug text-vanilla-400">
                          {{ opt.description }}
                        </p>
                      </div>
                    </z-menu-item>
                  </z-menu-section>
                </template>
              </z-menu>
            </div>
            <remove-team-from-group-button :group="group" :team="team.team" @refetch="refetchData">
              <template v-slot:activator="{ showConfirm }">
                <z-button
                  icon="x-circle"
                  size="small"
                  button-type="secondary"
                  icon-color="cherry"
                  @click="showConfirm"
                />
              </template>
            </remove-team-from-group-button>
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
      :png-image-path="require('~/assets/images/ui-states/directory/empty-search.gif')"
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
  ZMenu,
  ZMenuSection,
  ZMenuItem,
  ZPagination
} from '@deepsource/zeal'

import { OrgGroupsActions, OrgGroupsGetters } from '~/store/control-panel/groups'
import ControlPanelBaseMixin from '~/mixins/control-panel/ControlPanelBaseMixin'
import PaginationMixin from '~/mixins/paginationMixin'
import { EnterpriseGroup, GroupTeamMembership } from '~/types/types'
import { parseISODate, formatDate } from '~/utils/date'
import { resolveNodes } from '~/utils/array'
import AddTeamToGroupMixin from '~/mixins/addTeamToGroupMixin'
import { getDefaultAvatar } from '~/utils/ui'

const groupManagementStore = namespace('control-panel/groups')

@Component({
  components: {
    ZInput,
    ZButton,
    ZIcon,
    ZAvatar,
    ZBreadcrumb,
    ZBreadcrumbItem,
    ZTab,
    ZMenu,
    ZMenuSection,
    ZMenuItem,
    ZPagination
  },
  methods: { parseISODate, formatDate, getDefaultAvatar },
  layout: 'control-panel'
})
export default class UserManagementUserDetails extends mixins(
  ControlPanelBaseMixin,
  PaginationMixin,
  AddTeamToGroupMixin
) {
  @groupManagementStore.Getter(OrgGroupsGetters.ORG_GROUP_DATA)
  group: EnterpriseGroup

  @groupManagementStore.Action(OrgGroupsActions.FETCH_ORG_GROUP_TEAM_DATA)
  fetchOrgGroupTeamData: (args: {
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
    await this.fetchOrgGroupTeamData({
      id,
      q: this.q,
      first: this.perPageCount,
      offset: this.queryOffset,
      refetch: this.refetch
    })
    if (this.group && Object.keys(this.group).length < 1) {
      this.$nuxt.error({ statusCode: 404, message: `This page is not real` })
    }
    this.totalCount = this.group.groupTeams?.totalCount || 0
    this.refetch = false
  }

  get groupTeams(): GroupTeamMembership[] {
    return resolveNodes(this.group.groupTeams) as GroupTeamMembership[]
  }

  async search(q: string): Promise<void> {
    this.q = q
    this.currentPage = 1
    this.$fetch()
  }

  async refetchData(refetchParams?: { refetchAddTeams?: boolean }): Promise<void> {
    this.refetch = true
    this.$fetch()
    if (refetchParams?.refetchAddTeams) {
      const id = this.$route.params.groupId
      await this.fetchTeamsToAdd({
        groupId: id,
        refetch: this.refetch
      })
    }
  }
}
</script>
