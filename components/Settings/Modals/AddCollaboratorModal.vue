<template>
  <z-modal
    :title="`Add a new collaborator to ${$route.params.owner}/${$route.params.repo}`"
    :primaryActionLabel="selectedMember ? 'Confirm and add' : ''"
    @primaryAction="addMember"
    @onClose="close"
  >
    <div class="overflow-y-scroll max-h-84">
      <div v-if="selectedMember" class="p-4 space-y-5">
        <div class="relative px-2 border rounded-lg border-ink-200 group">
          <span
            v-tooltip="'Back to search'"
            @click="selectedMember = null"
            class="absolute items-center justify-center hidden w-5 h-5 rounded-full cursor-pointer group-hover:flex -top-2 -right-2 bg-ink-100 hover:bg-slate"
          >
            <z-icon icon="corner-up-left" size="x-small" />
          </span>
          <member-list-item
            :key="selectedMember.id"
            :role="selectedMember.role"
            :showRoleOptions="false"
            :isPrimaryUser="selectedMember.isPrimaryUser"
            v-bind="selectedMember.user"
          />
        </div>
        <z-radio-group v-model="selectedRole" @change="updateValue" class="space-y-3">
          <div
            class="p-2 space-y-1 text-sm rounded-lg cursor-pointer hover:bg-ink-200"
            v-for="opt in repoPerms"
            :key="opt.value"
            @click="selectedRole = opt.value"
          >
            <z-radio :value="opt.value" :label="opt.label"></z-radio>
            <p
              v-if="opt.description"
              class="ml-6 text-xs leading-5 text-vanilla-400 md:mr-5 lg:mr-12 xl:mr-15"
              v-html="opt.description"
            ></p>
          </div>
        </z-radio-group>
      </div>
      <template v-else>
        <div class="p-4 space-y-4 text-sm font-normal">
          <p class="text-vanilla-400">
            You can add members who are already in your team to this repository. To add new members,
            please
            <nuxt-link
              class="text-juniper hover:underline"
              :to="['', $route.params.provider, $route.params.owner, 'members', 'active'].join('/')"
              >invite</nuxt-link
            >
            them to your team first.
          </p>
          <z-input
            v-model="memberSearchCandidate"
            placeholder="Search member to add as collaborator"
            @debounceInput="fetchMembers"
          />
        </div>
        <div
          v-if="memberSearchCandidate && hasMembers"
          class="border-t divide-y divide-ink-100 border-ink-100"
        >
          <member-list-item
            class="px-4 cursor-pointer hover:bg-ink-200"
            @click="selectedMember = member.node"
            v-for="member in repository.addableMembers.edges"
            :key="member.node.id"
            :role="member.node.role"
            :showRoleOptions="false"
            :isPrimaryUser="member.node.isPrimaryUser"
            v-bind="member.node.user"
          />
        </div>
        <div v-else-if="memberSearchCandidate && !fetching" class="flex items-center p-4 min-h-40">
          <div class="w-full space-y-2 text-center">
            <h3 class="font-semibold">We couldn't find {{ memberSearchCandidate }}.</h3>
            <p class="text-xs text-vanilla-400">
              If you are unable to find a user, please add them to the team first.
            </p>
          </div>
        </div>
      </template>
    </div>
  </z-modal>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZInput, ZIcon, ZModal, ZButton, ZRadioGroup, ZRadio } from '@deepsource/zeal'
import { MemberListItem } from '@/components/Members'
import RepoDetailMixin, { REPO_PERMS } from '~/mixins/repoDetailMixin'
import { Maybe, RepositoryPermissionChoices, TeamMember } from '~/types/types'

@Component({
  components: {
    ZInput,
    ZModal,
    ZIcon,
    ZButton,
    ZRadioGroup,
    ZRadio,
    MemberListItem
  }
})
export default class AddCollaboratorModal extends mixins(RepoDetailMixin) {
  private memberSearchCandidate = ''
  private selectedMember: Maybe<TeamMember> = null
  private fetching = false
  private repoPerms = REPO_PERMS
  private selectedRole: RepositoryPermissionChoices = RepositoryPermissionChoices.Write

  async fetchMembers(): Promise<void> {
    this.fetching = true
    await this.fetchAddableMembers({
      ...this.baseRouteParams,
      q: this.memberSearchCandidate
    })
    this.fetching = false
  }

  async addMember(): Promise<void> {
    try {
      if (this.selectedMember) {
        const response = await this.updateMemberPermission({
          input: {
            repositoryId: this.repository.id,
            userId: this.selectedMember.user.id,
            permission: this.selectedRole
          }
        })
        if (!response.ok) {
          throw new Error()
        }

        if (this.selectedMember?.user?.fullName) {
          this.$toast.success(
            `${this.selectedMember.user.fullName} successfully added as a collaborator.`
          )
        } else {
          this.$toast.success(`Collaborator added successfully`)
        }
        this.$emit('refetch')
        this.$emit('close')
        this.selectedMember = null
      }
    } catch ({ message }) {
      const toastMsg = message
        ? message.replace('GraphQL error: ', '')
        : 'Failed to add collaborator.'
      this.$toast.danger(toastMsg)
    }
  }

  get hasMembers(): boolean {
    return Boolean(this.repository.addableMembers?.edges?.length)
  }

  close() {
    this.selectedMember = null
    this.$emit('close')
  }
}
</script>
