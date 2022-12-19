<template>
  <div class="flex flex-col max-w-2xl p-4 gap-y-2">
    <!-- title -->
    <div class="mb-4 text-lg font-medium">Repository members</div>
    <div class="flex space-x-2">
      <z-input
        v-model="searchCandidate"
        icon="search"
        class="p-2"
        :showBorder="false"
        size="small"
        backgroundColor="ink-300"
        @debounceInput="searchRepoMembers"
        placeholder="Search for a name or email"
      >
        <template slot="left"
          ><span class="px-1"><z-icon icon="search" size="small"></z-icon></span
        ></template>
      </z-input>
      <z-button
        size="small"
        buttonType="primary"
        class="whitespace-nowrap"
        @click="showAddCollaboratorModal = true"
      >
        <div class="flex items-center space-x-2">
          <z-icon icon="user-plus" size="small" color="ink-400"></z-icon>
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
        class="divide-y divide-ink-300"
      >
        <member-list-item
          v-for="member in repository.collaborators.edges"
          :key="member.node.id"
          :isRepo="true"
          :role="member.node.permission"
          v-bind="member.node.user"
          @updateRole="({ role, newRole }) => triggerUpdateRole(member.node, role, newRole)"
          @removeMember="() => triggerRemoveMember(member.node)"
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
        class="flex justify-center"
        :totalPages="totalPages"
        :totalVisible="5"
        :hideForSinglePage="true"
        v-model="currentPageNumber"
      ></z-pagination>
    </template>
    <div v-else class="flex flex-col space-y-2">
      <div v-for="i in 10" :key="i" class="flex w-full space-x-2 animate-pulse">
        <div class="w-8 h-8 rounded-md bg-ink-300"></div>
        <div class="w-2/3 h-8 rounded-md bg-ink-300"></div>
        <div class="flex-grow h-8 rounded-md bg-ink-300"></div>
      </div>
    </div>
    <portal to="modal">
      <add-collaborator-modal
        v-if="showAddCollaboratorModal"
        @refetch="fetchRepoMembers"
        @close="showAddCollaboratorModal = false"
      />
      <z-confirm
        v-if="isUpdateModalOpen"
        @onClose="isUpdateModalOpen = false"
        title="Update collaborator's permissions"
        primaryActionLabel="Confirm and grant permissions"
        @primaryAction="updatePermission"
      >
        <div class="flex items-center mb-2 text-base leading-relaxed text-vanilla-100">
          <z-icon icon="alert-circle" size="small" class="mr-2"></z-icon> Update member role to
          {{ repoPerms[newMemberRole].label }}
        </div>
        <p
          class="text-sm leading-relaxed text-vanilla-400"
          v-html="getRoleMessage(newMemberRole, member.user.fullName || member.user.email)"
        ></p>
      </z-confirm>
      <z-confirm
        v-if="isRemoveModalOpen"
        @onClose="isRemoveModalOpen = false"
        title="Confirm remove collaborator from repository?"
        primaryActionLabel="Confirm and remove"
        primaryActionType="danger"
        primaryActionIcon="x"
        subtitle="They will lose access to the repository immediately. You can add them again later."
        @primaryAction="removeMember"
      >
      </z-confirm>
    </portal>
  </div>
</template>

<script lang="ts">
import { Component, mixins, Watch } from 'nuxt-property-decorator'
import { ZInput, ZIcon, ZPagination, ZConfirm, ZModal, ZButton } from '@deepsource/zeal'
import { MemberListItem } from '@/components/Members'
import { Maybe, RepositoryPermissionChoices, TeamMember } from '~/types/types'
import { RepoPerms } from '~/types/permTypes'
import RepoDetailMixin, { REPO_PERMS } from '~/mixins/repoDetailMixin'
import AddCollaboratorModal from '~/components/Settings/Modals/AddCollaboratorModal.vue'

const LIMIT = 15

@Component({
  components: {
    ZInput,
    ZConfirm,
    ZModal,
    ZIcon,
    ZPagination,
    ZButton,
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
export default class RepositoryMembers extends mixins(RepoDetailMixin) {
  public showAddCollaboratorModal = false
  public searchRule = ''
  public searchCandidate = ''
  public currentPageNumber = 1
  public isUpdateModalOpen = false
  public member: Maybe<TeamMember> = null
  public newMemberRole: Maybe<RepositoryPermissionChoices> = null
  public isRemoveModalOpen = false

  private repoPerms = REPO_PERMS

  getRoleMessage(newRole: RepositoryPermissionChoices, name: string): string {
    const role = this.repoPerms[newRole].label
    // skipcq: JS-D009
    if (newRole == 'ADMIN') {
      return `Are you sure you want to make ${name} <b class="text-vanilla-100">${role}</b> of this repo?`
    } else {
      return `Are you sure you want to give ${name}, <b class="text-vanilla-100">${role}</b> access to this repo?`
    }
  }

  async fetch(): Promise<void> {
    await this.fetchRepoMembers(false)
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
        if (!response.ok) {
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
