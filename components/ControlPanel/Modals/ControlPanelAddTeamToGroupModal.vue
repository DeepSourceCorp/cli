<template>
  <div>
    <slot name="activator" :showModal="showModal">
      <z-button icon="plus" label="Add a team" size="small" @click="showModal" />
    </slot>
    <portal to="modal">
      <z-modal
        v-if="showAddTeamModal"
        title="Add a team"
        class="shadow-double-dark"
        @onClose="showAddTeamModal = false"
      >
        <div class="p-4 space-y-4 overflow-y-auto text-sm text-vanilla-400 min-h-20 max-h-98">
          <div>
            <z-input
              :value="addTeamSearchCandidate"
              placeholder="Search teams..."
              icon="search"
              :showBorder="false"
              backgroundColor="ink-400"
              @debounceInput="searchTeams"
            />
          </div>
          <div
            v-for="team in teamsToAdd"
            :key="team.id"
            class="grid items-center grid-cols-2 p-4 border rounded-md border-ink-200 bg-ink-300"
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
                    v-if="team.teamMembers && team.teamMembers.totalCount"
                    class="flex items-center gap-x-1.5 text-vanilla-400"
                  >
                    <z-icon icon="users" size="x-small" class="flex-shrink-0" />
                    <span class="text-xxs"
                      >{{ team.teamMembers.totalCount }} member<span
                        v-if="team.teamMembers.totalCount > 1"
                        >s</span
                      ></span
                    >
                  </div>
                </div>
              </div>
            </div>
            <div class="justify-self-end">
              <div v-if="team.roleInGroup" class="flex items-center gap-x-1.5 leading-none">
                <div class="text-sm text-vanilla-400">Role:</div>
                <z-menu width="large" direction="left">
                  <template v-slot:trigger="{ toggle }">
                    <button
                      type="button"
                      class="flex items-center space-x-1 text-sm outline-none focus:outline-none"
                      @click="toggle"
                    >
                      <span>{{ TEAM_PERMS[team.roleInGroup].title }}</span>
                      <z-icon size="small" icon="chevron-down" />
                    </button>
                  </template>
                  <template slot="body">
                    <z-menu-section :divider="false" class="text-left">
                      <z-menu-item v-for="(opt, key) in TEAM_PERMS" :key="key" class="text-sm">
                        <div
                          role="button"
                          @click="updateTeamRole(groupId, team.id, key)"
                          class="w-full"
                        >
                          <div class="flex items-center space-x-2">
                            <span :class="key === team.roleInGroup ? 'font-semibold' : ''">{{
                              opt.title
                            }}</span>
                            <z-icon
                              v-if="key === team.roleInGroup"
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
              <z-button
                v-else
                label="Add to group"
                icon="plus"
                button-type="secondary"
                size="small"
                @click="addTeamToOrgGroup(groupTeamsToAdd.id, team.id, 'CONTRIBUTOR')"
              />
            </div>
          </div>
        </div>
      </z-modal>
    </portal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, mixins } from 'nuxt-property-decorator'
import {
  ZAvatar,
  ZButton,
  ZModal,
  ZIcon,
  ZInput,
  ZMenu,
  ZMenuSection,
  ZMenuItem
} from '@deepsourcelabs/zeal'
import AddTeamToGroupMixin from '~/mixins/addTeamToGroupMixin'
import { formatDate, parseISODate } from '~/utils/date'
import { resolveNodes } from '~/utils/array'

@Component({
  components: { ZAvatar, ZButton, ZModal, ZIcon, ZInput, ZMenu, ZMenuSection, ZMenuItem },
  name: 'ControlPanelAddTeamToGroupModal',
  methods: {
    parseISODate,
    formatDate
  }
})
export default class ControlPanelAddTeamToGroupModal extends mixins(AddTeamToGroupMixin) {
  @Prop({ required: true })
  groupId: string

  showAddTeamModal = false
  addTeamSearchCandidate = ''
  refetch = false

  async fetch(): Promise<void> {
    await this.fetchTeamsToAdd({
      groupId: this.groupId,
      q: this.addTeamSearchCandidate,
      refetch: this.refetch
    })
  }

  get teamsToAdd() {
    return resolveNodes(this.groupTeamsToAdd.allTeams)
  }

  showModal(): void {
    this.showAddTeamModal = true
  }

  async searchTeams(teamName: string): Promise<void> {
    this.addTeamSearchCandidate = teamName
    this.$fetch()
  }

  @Watch('groupId', { immediate: true })
  refetchTeams(): void {
    if (process.client) {
      this.addTeamSearchCandidate = ''
      this.refetch = true
      this.$fetch()
    }
  }
}
</script>
