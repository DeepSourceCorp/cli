<template>
  <div class="flex max-w-2xl flex-col gap-y-2 p-4">
    <!-- title -->
    <div class="mb-4 text-lg font-medium">Repository members</div>
    <div class="flex space-x-2">
      <z-input
        v-model="searchCandidate"
        icon="search"
        class="p-2"
        :show-border="false"
        size="small"
        background-color="ink-300"
        placeholder="Search for a name or email"
        @debounceInput="searchRepoMembers"
      >
        <template #left
          ><span class="px-1"><z-icon icon="search" size="small" /></span
        ></template>
      </z-input>
      <z-button
        size="small"
        button-type="primary"
        class="whitespace-nowrap"
        @click="showAddCollaboratorModal = true"
      >
        <div class="flex items-center space-x-2">
          <z-icon icon="user-plus" size="small" color="ink-400" />
          <span>Add collaborator</span>
        </div>
      </z-button>
    </div>
    <template v-if="repository.collaborators && repository.collaborators.edges">
      <!-- <transition-group class="duration-200 transform"> -->
      <transition-group
        v-if="repository.collaborators.edges.length"
        move-class="duration-200 transform"
        tag="ul"
      >
        <member-list-item
          v-for="(member, index) in repoMembers"
          :key="member.id"
          v-bind="member.user"
          :is-repo="true"
          :role="member.permission"
          :is-perm-from-vcs="member.isPermFromVcs"
          :team-avatar-url="activeDashboardContext.avatar_url"
          :login="activeDashboardContext.login"
          :account-type="activeDashboardContext.type"
          :vcs-provider="activeDashboardContext.vcs_provider"
          :hide-border="index === repoMembers.length - 1"
          @updateRole="({ role, newRole }) => triggerUpdateRole(member, role, newRole)"
          @removeMember="() => triggerRemoveMember(member)"
        />
      </transition-group>
      <lazy-empty-state
        v-else-if="searchCandidate"
        :title="`We couldn't find ${searchCandidate}.`"
        :show-border="true"
        :webp-image-path="require('~/assets/images/ui-states/directory/empty-search.webp')"
        :png-image-path="require('~/assets/images/ui-states/directory/empty-search.gif')"
        subtitle="If you are unable to find a collaborator, please add them to this repository first."
      />
      <lazy-empty-state
        v-else
        :webp-image-path="require('~/assets/images/ui-states/repo/no-collaborators-136px.webp')"
        :png-image-path="require('~/assets/images/ui-states/repo/no-collaborators-136px.png')"
        :show-border="true"
        title="You haven't yet added any collaborators."
        subtitle="Please add collaborators from your team, by clicking on the button 'Add collaborator'."
      />
      <z-pagination
        v-if="totalPages"
        v-model="currentPageNumber"
        class="flex justify-center"
        :total-pages="totalPages"
        :total-visible="5"
        :hide-for-single-page="true"
      />
    </template>
    <div v-else class="flex flex-col">
      <member-list-item-loading
        v-for="loader in LIMIT"
        :key="loader"
        :hide-border="loader === LIMIT"
        class="first:pt-0"
      />
    </div>
    <portal to="modal">
      <add-collaborator-modal
        v-if="showAddCollaboratorModal"
        @refetch="fetchRepoMembers"
        @close="showAddCollaboratorModal = false"
      />
      <z-confirm
        v-if="isUpdateModalOpen"
        title="Update collaborator's permissions"
        primary-action-label="Confirm and grant permissions"
        @onClose="isUpdateModalOpen = false"
        @primaryAction="updatePermission"
      >
        <div class="mb-2 flex items-center text-base leading-relaxed text-vanilla-100">
          <z-icon icon="alert-circle" size="small" class="mr-2" /> Update member role to
          {{ newMemberRoleLabel }}
        </div>
        <p class="text-sm leading-relaxed text-vanilla-400">
          <template v-if="newMemberRole === RepositoryPermissionChoices.Admin">
            Are you sure you want to make {{ member.user.fullName || member.user.email }}
            <b class="text-vanilla-100">{{ newMemberRoleLabel }}</b> of this repo?
          </template>
          <template v-else>
            Are you sure you want to give {{ member.user.fullName || member.user.email }},
            <b class="text-vanilla-100">{{ newMemberRoleLabel }}</b> access to this repo?
          </template>
        </p>
      </z-confirm>
      <z-confirm
        v-if="isRemoveModalOpen"
        title="Confirm remove collaborator from repository?"
        primary-action-label="Confirm and remove"
        primary-action-type="danger"
        primary-action-icon="x"
        subtitle="They will lose access to the repository immediately. You can add them again later."
        @onClose="isRemoveModalOpen = false"
        @primaryAction="removeMember"
      />
    </portal>
  </div>
</template>

<script lang="ts">
import { Component, mixins, Watch } from 'nuxt-property-decorator'
import { MemberListItem } from '@/components/Members'
import {
  Maybe,
  RepositoryCollaborator,
  RepositoryPermissionChoices,
  TeamMember
} from '~/types/types'
import { RepoPerms } from '~/types/permTypes'
import RepoDetailMixin, { REPO_PERMS } from '~/mixins/repoDetailMixin'
import AddCollaboratorModal from '~/components/Settings/Modals/AddCollaboratorModal.vue'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import { resolveNodes } from '~/utils/array'

const LIMIT = 15

@Component({
  components: {
    MemberListItem,
    AddCollaboratorModal
  },
  layout: 'repository',
  middleware: ['perm', 'teamOnly'],
  meta: {
    auth: {
      strict: true,
      repoPerms: [RepoPerms.ADD_REMOVE_MEMBERS, RepoPerms.UPDATE_ROLE_OF_EXISTING_MEMBERS]
    }
  }
})
export default class RepositoryMembers extends mixins(ActiveUserMixin, RepoDetailMixin) {
  public showAddCollaboratorModal = false
  public searchRule = ''
  public searchCandidate = ''
  public currentPageNumber = 1
  public isUpdateModalOpen = false
  public member: Maybe<TeamMember> = null
  public newMemberRole: Maybe<RepositoryPermissionChoices> = null
  public isRemoveModalOpen = false

  readonly repoPerms = REPO_PERMS
  readonly RepositoryPermissionChoices = RepositoryPermissionChoices
  readonly LIMIT = LIMIT

  async fetch(): Promise<void> {
    await this.fetchRepoMembers(false)

    if (!this.viewer) {
      await this.fetchActiveUser()
    }
  }

  @Watch('currentPageNumber')
  public refetchOnPageUpdate(): void {
    this.fetchRepoMembers(false)
  }

  public fetchRepoMembers(refetch = true): void {
    this.fetchRepoCollaborators({
      ...this.baseRouteParams,
      q: this.searchCandidate,
      limit: LIMIT,
      currentPageNumber: this.currentPageNumber || 1,
      refetch
    })
  }

  get totalPages(): number {
    let pages = 0
    if (this.repository?.collaborators?.totalCount) {
      pages = Math.ceil(this.repository?.collaborators?.totalCount / LIMIT)
    }
    return pages > 1 ? pages : 0
  }

  get repoMembers() {
    return resolveNodes(this.repository.collaborators) ?? []
  }

  get newMemberRoleLabel(): string {
    if (!this.newMemberRole) {
      return ''
    }
    return this.repoPerms[this.newMemberRole].label
  }

  async searchRepoMembers(): Promise<void> {
    await this.fetchRepoMembers(false)
  }

  public triggerUpdateRole(
    member: TeamMember,
    role: RepositoryPermissionChoices,
    newRole: RepositoryPermissionChoices
  ): void {
    if (role !== newRole) {
      this.isUpdateModalOpen = true
      this.newMemberRole = newRole
      this.member = member
    }
  }

  public async updatePermission(): Promise<void> {
    try {
      if (this.member && this.newMemberRole) {
        const response = await this.updateMemberPermission({
          input: {
            repositoryId: this.repository.id,
            userId: this.member.user.id,
            permission: this.newMemberRole
          }
        })
        if (!response?.ok) {
          throw new Error()
        }
        this.fetchRepoMembers(true)
        this.$toast.success(
          `${
            this.member.user.fullName ?? this.member.user.email
          }'s permission successfully updated to ${this.repoPerms[this.newMemberRole].label}.`
        )
      }
    } catch (e) {
      if (this.member?.user?.fullName) {
        this.$toast.danger(`Failed to update permission for ${this.member.user.fullName}.`)
      } else if (this.member?.user?.email) {
        this.$toast.danger(`Failed to update permission for ${this.member.user.email}.`)
      } else {
        this.$toast.danger(`Failed to update permission`)
      }
    } finally {
      this.isUpdateModalOpen = false
    }
  }

  public triggerRemoveMember(user: TeamMember): void {
    this.member = user
    this.isRemoveModalOpen = true
  }

  public async removeMember(): Promise<void> {
    try {
      if (this.member) {
        await this.removeMemberAPI({
          input: {
            repositoryCollaboratorId: this.member.id
          }
        })
        this.fetchRepoMembers(true)
        this.$toast.success(
          `${
            this.member.user.fullName ?? this.member.user.email
          } successfully removed from this repository.`
        )
      }
    } catch (e) {
      if (this.member) {
        this.$toast.danger(
          `Failed to remove ${
            this.member.user.fullName ?? this.member.user.email
          } from this repository.`
        )
      } else {
        this.$toast.danger(`Failed to remove member from this repository.`)
      }
    } finally {
      this.isRemoveModalOpen = false
    }
  }
}
</script>
