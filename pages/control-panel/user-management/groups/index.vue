<template>
  <div>
    <div
      class="px-4 py-3.5 flex flex-col lg:items-center lg:flex-row gap-4 justify-between border-b border-slate-400"
    >
      <h1 class="text-lg font-medium leading-none">Groups</h1>
      <div class="flex items-center justify-end w-full max-w-lg gap-x-2">
        <z-input
          :value="q"
          placeholder="Search for a group..."
          size="small"
          :show-border="false"
          background-color="ink-300"
          class="w-full max-w-xs"
          @debounceInput="searchGroups"
        >
          <template slot="left"> <z-icon icon="search" size="small" class="ml-1.5" /> </template>
        </z-input>
        <create-group-modal @refetch="refetchData" />
      </div>
    </div>
    <div v-if="isScimEnabled" class="p-4 pb-0">
      <notice :enabled="isScimEnabled">
        <template #indicator>
          <div class="flex items-center justify-center flex-shrink-0 w-4 h-4">
            <span class="absolute flex-shrink-0 w-4 h-4 rounded-full bg-juniper opacity-40"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-juniper"></span>
          </div>
        </template>
        <span class="flex-grow px-1 py-2 leading-none">SCIM provisioning is enabled.</span>
        <z-button
          type="link"
          button-type="link"
          size="x-small"
          href="https://deepsource.io/docs/control-panel/scim-provisioning"
          target="_blank"
          rel="noopener noreferrer"
          class="items-center text-vanilla-400"
        >
          <span class="leading-none"> Learn more </span>
          <z-icon icon="arrow-up-right" size="x-small" color="vanilla-400" />
        </z-button>
      </notice>
    </div>
    <control-panel-cards-skeleton v-if="$fetchState.pending" :card-count="7" />
    <!-- HOTFIX: Nuxt SSR adds ghost a tags into dom during SSR -->
    <client-only v-else-if="groups.length">
      <div class="p-4 space-y-4">
        <nuxt-link
          v-for="group in groups"
          :key="group.id"
          :to="`/control-panel/user-management/groups/${group.id}`"
          class="grid items-center grid-cols-1 p-4 border rounded-md md:grid-cols-2 gap-x-6 lg:gap-x-10 gap-y-1 border-slate-400 hover:bg-ink-300"
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
            class="flex mt-1 ml-12 justify-self-start md:justify-self-end gap-x-2 md:ml-0 md:mt-0"
          >
            <delete-group-button
              v-if="!group.scimEnabled"
              :group="group"
              :emit-refetch="true"
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
import { ZInput, ZButton, ZIcon, ZAvatar, ZModal, ZPagination } from '@deepsource/zeal'

import ControlPanelBaseMixin from '~/mixins/control-panel/ControlPanelBaseMixin'
import { OrgGroupsActions, OrgGroupsGetters } from '~/store/control-panel/groups'
import { parseISODate, formatDate } from '~/utils/date'
import { EnterpriseGroup } from '~/types/types'
import PaginationMixin from '~/mixins/paginationMixin'

const groupManagementStore = namespace('control-panel/groups')

@Component({
  components: { ZInput, ZButton, ZIcon, ZAvatar, ZModal, ZPagination },
  methods: { parseISODate, formatDate },
  layout: 'control-panel'
})
export default class GroupsHome extends mixins(ControlPanelBaseMixin, PaginationMixin) {
  @groupManagementStore.Getter(OrgGroupsGetters.ORG_GROUPS_DATA)
  groups: EnterpriseGroup[]

  @groupManagementStore.Getter(OrgGroupsGetters.ENTERPRISE_SCIM_ENABLED)
  isScimEnabled: boolean

  @groupManagementStore.Action(OrgGroupsActions.FETCH_ORG_GROUPS_DATA)
  fetchOrgGroupsData: (args?: {
    q?: string
    first?: number
    offset?: number
    refetch?: boolean
  }) => Promise<number>

  perPageCount = 10
  q = ''
  refetch = true
  showCreateGroupModal = false
  creatingGroup = false
  newGroupName = ''

  async fetch() {
    if (this.refetch) {
      this.q = ''
      this.currentPage = 1
    }
    this.totalCount = await this.fetchOrgGroupsData({
      first: this.perPageCount,
      offset: this.queryOffset,
      q: this.q,
      refetch: this.refetch
    })
    this.refetch = false
  }

  searchGroups(q: string): void {
    this.currentPage = 1
    this.q = q
    this.$fetch()
  }

  refetchData(): void {
    this.refetch = true
    this.$fetch()
  }
}
</script>
