<template>
  <div>
    <slot :open="openInviteModal" name="trigger">
      <z-button size="small" icon="user-plus" @click="openInviteModal">
        Invite new member
      </z-button>
    </slot>

    <portal to="modal">
      <z-modal
        v-if="showModal"
        :primary-action-label="''"
        title="Invite new members"
        @onClose="close"
      >
        <div class="p-4 space-y-4 text-sm font-normal">
          <div v-if="$config.emailEnabled" class="space-y-2">
            <div>
              <h3 class="text-base font-medium text-vanilla-100">Invite via email</h3>
              <p class="text-sm text-vanilla-400">
                Teammates will create an account via the sent email
              </p>
            </div>

            <div v-if="$fetchState.pending" class="rounded-md h-28 animate-pulse bg-ink-200"></div>

            <template v-else>
              <div
                v-for="member in membersToInvite"
                :key="member.index"
                class="grid gap-2 grid-cols-fr-10"
              >
                <z-input
                  :id="member.index"
                  v-model="member.email"
                  :is-invalid="!member.isValid"
                  :show-border="true"
                  placeholder="name@email.com"
                  size="small"
                  type="email"
                  @debounceInput="areEmailsInvalid"
                />
                <div class="h-8">
                  <z-select
                    v-model="member.role"
                    :read-only="!member.modifyAllowed"
                    v-tooltip="
                      member.modifyAllowed ? '' : 'This is disabled because the seats are exhausted'
                    "
                    class="bg-ink-400"
                  >
                    <z-option
                      v-for="opt in roles"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    />
                  </z-select>
                </div>
              </div>
            </template>
            <div class="flex justify-between">
              <z-button button-type="link" spacing="px-0" size="small" @click="addMore"
                >+ Add more emails</z-button
              >
              <z-button
                :disabled="disableSend"
                button-type="primary"
                size="small"
                spacing="px-2"
                @click="sendInvite"
              >
                <div class="flex items-center space-x-2">
                  <z-icon icon="send" size="small" color="ink-400" />
                  <span>Send invite</span>
                </div>
              </z-button>
            </div>
          </div>
          <z-divider v-if="$config.emailEnabled" />
          <div class="space-y-2">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="text-base font-medium text-vanilla-100">Invite via link</h3>
                <p class="text-sm text-vanilla-400">
                  Teammates will create an account via the link
                </p>
              </div>
              <div>
                <z-button
                  button-type="secondary"
                  icon="refresh-cw"
                  size="small"
                  @click="resetInviteLink"
                >
                  Reset Link
                </z-button>
              </div>
            </div>
            <z-input :disabled="true" :show-border="true" :value="team.invitationUrl">
              <template slot="right">
                <copy-button
                  :disabled="!team.invitationUrl"
                  :value="team.invitationUrl"
                  label="Copy link"
                  class="w-36"
                />
              </template>
            </z-input>
          </div>
        </div>
      </z-modal>
      <invite-members-success-modal
        v-if="showSuccessModal"
        @invite-more="openInviteModal"
        @close="showSuccessModal = false"
      />
    </portal>
  </div>
</template>
<script lang="ts">
import { ZButton, ZDivider, ZIcon, ZInput, ZModal, ZOption, ZSelect } from '@deepsource/zeal'
import { Component, mixins } from 'nuxt-property-decorator'

import OwnerBillingMixin from '~/mixins/ownerBillingMixin'
import TeamDetailMixin from '@/mixins/teamDetailMixin'
import { Invitee, TeamMemberRoleChoices } from '~/types/types'
import { resolveNodes } from '~/utils/array'

interface member {
  index: number
  email: string
  isValid: boolean
  modifyAllowed: boolean
  role: TeamMemberRoleChoices
}

const INPUT_DATA: member[] = [
  {
    index: 0,
    email: '',
    isValid: true,
    modifyAllowed: false,
    role: TeamMemberRoleChoices.Contributor
  },
  {
    index: 1,
    email: '',
    isValid: true,
    modifyAllowed: false,
    role: TeamMemberRoleChoices.Contributor
  },
  {
    index: 2,
    email: '',
    isValid: true,
    modifyAllowed: false,
    role: TeamMemberRoleChoices.Contributor
  }
]

const ROLES = [
  {
    value: TeamMemberRoleChoices.Admin,
    label: 'Administrator'
  },
  {
    value: TeamMemberRoleChoices.Member,
    label: 'Member'
  },
  {
    value: TeamMemberRoleChoices.Contributor,
    label: 'Contributor'
  }
]

/**
 * Invite members modal
 */
@Component({
  components: {
    ZIcon,
    ZModal,
    ZInput,
    ZButton,
    ZDivider,
    ZSelect,
    ZOption
  },
  layout: 'dashboard'
})
export default class InviteMembersModal extends mixins(TeamDetailMixin, OwnerBillingMixin) {
  showModal = false
  membersToInvite: member[] = []
  showSuccessModal = false
  roles = ROLES

  /**
   * The fetch hook
   * Update member invite list after fetching the invite URL and owner seats information
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    const { owner, provider } = this.$route.params
    const args = { login: owner, provider }

    // Set the invite members list before queries to ensure
    // consistency between states
    this.membersToInvite = this.initialMembersToInvites
    await Promise.all([this.fetchInviteUrl(args), this.fetchSeatsInfo(args)])
    this.membersToInvite = this.initialMembersToInvites
  }

  /**
   * Method to reset invite link for a team
   *
   * @returns {Promise<void>}
   */
  async resetInviteLink(): Promise<void> {
    await this.resetInviteUrl({
      ownerId: this.team.id
    })
    this.$toast.success('Invitation link successfully reset')
  }

  /**
   * Method that returns a boolean value corresponding to the email validation status
   *
   * @returns {boolean}
   */
  areEmailsInvalid(): boolean {
    this.membersToInvite = this.membersToInvite.map((member) => {
      if (member.email) {
        return {
          index: member.index,
          email: member.email,
          role: member.role,
          modifyAllowed: member.modifyAllowed,
          isValid: this.validEmail(member.email)
        }
      }
      return member
    })

    return this.membersToInvite.map((member) => member.isValid).some((el) => el === false)
  }

  /**
   * Method to validate an Email
   *
   * @param {email} string
   * @returns {boolean}
   */
  validEmail(email: string): boolean {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(email)
  }

  /**
   * Method to send invitation for all members on the list
   *
   * @returns {Promise<void>}
   */
  async sendInvite(): Promise<void> {
    if (this.areEmailsInvalid()) {
      this.$toast.danger('Please enter a valid email')
      return
    }

    const { owner, provider } = this.$route.params
    const refetchArgs = {
      login: owner,
      provider,
      currentPage: 1,
      limit: 10
    }

    const invitees = this.membersToInvite
      .filter((member) => {
        return member.email !== ''
      })
      .map((member) => {
        return {
          email: member.email,
          role: member.role
        }
      })
    try {
      await this.inviteAll({
        ownerId: this.team.id,
        invitees,
        ...refetchArgs
      })
      this.membersToInvite = this.initialMembersToInvites
      this.showSuccessModal = true
      this.$emit('inviteSuccess')
      this.close()
    } catch (e) {
      this.$toast.danger((e as Error).message.replace('GraphQL error: ', ''))
    }
  }

  /**
   * Method to add a new member entry
   *
   * @returns {void}
   */
  addMore(): void {
    let modifyAllowed = this.seatsLeftCount - this.membersToInvite.length > 0 ? true : false
    this.membersToInvite.push({
      index: this.membersToInvite.length + 1,
      email: '',
      isValid: true,
      modifyAllowed,
      role: modifyAllowed ? TeamMemberRoleChoices.Member : TeamMemberRoleChoices.Contributor
    })
  }

  /**
   * Method to open the modal
   *
   * @returns{void}
   */
  openInviteModal(): void {
    this.membersToInvite = this.initialMembersToInvites
    this.showSuccessModal = false
    this.showModal = true
  }

  /**
   * Method to update the member invite list and close the modal
   *
   * @returns{void}
   */
  close(): void {
    this.membersToInvite = this.initialMembersToInvites
    this.showModal = false
  }

  get disableSend(): boolean {
    return (
      this.membersToInvite.filter((member) => {
        return member.email !== ''
      }).length < 1
    )
  }

  get pendingInvites(): number {
    let count = 0
    const invitees = resolveNodes(this.team.invites) as Invitee[]
    invitees.forEach((invitee) => {
      // no limit on CONTRIBUTORS, so we only count ADMINs & MEMBERs
      if (invitee?.role !== 'CONTRIBUTOR') {
        count += 1
      }
    })
    return count
  }

  get seatsLeftCount(): number {
    const { seatsTotal, seatsUsed } = this.ownerBillingInfo
    if (seatsTotal && seatsUsed) {
      return seatsTotal - seatsUsed - this.pendingInvites
    }
    return 0
  }

  get initialMembersToInvites(): member[] {
    let seatsAvailable = this.seatsLeftCount
    return INPUT_DATA.map((member) => {
      // skipcq: JS-D009
      if (seatsAvailable-- > 0) {
        return {
          ...member,
          role: TeamMemberRoleChoices.Member,
          modifyAllowed: true
        }
      } else {
        return member
      }
    })
  }
}
</script>
