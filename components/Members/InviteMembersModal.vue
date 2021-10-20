<template>
  <z-modal v-if="showModal" title="Invite new members" @onClose="close" :primaryActionLabel="''">
    <div class="p-4 text-sm font-normal space-y-4">
      <div class="space-y-2" v-if="$config.emailEnabled">
        <div>
          <h3 class="text-vanilla-100 text-base font-medium">Invite via email</h3>
          <p class="text-vanilla-400 text-sm">
            Teammates will create an account via the sent email
          </p>
        </div>
        <div
          v-for="member in membersToInvite"
          :key="member.index"
          class="grid grid-cols-fr-10 gap-2"
        >
          <z-input
            v-model="member.email"
            size="small"
            type="email"
            :id="member.index"
            :showBorder="true"
            :isInvalid="!member.isValid"
            placeholder="name@email.com"
          >
          </z-input>
          <z-select v-model="member.role" class="bg-ink-400">
            <z-option v-for="opt in roles" :key="opt.value" :label="opt.label" :value="opt.value">
            </z-option>
          </z-select>
        </div>
        <div class="flex justify-between">
          <z-button buttonType="link" spacing="px-0" size="small" @click="addMore"
            >+ Add more emails</z-button
          >
          <z-button
            @click="sendInvite"
            buttonType="primary"
            size="small"
            spacing="px-2"
            :disabled="disableSend"
          >
            <div class="flex items-center space-x-2">
              <z-icon icon="send" size="small" color="ink-400"></z-icon>
              <span>Send invite</span>
            </div>
          </z-button>
        </div>
      </div>
      <z-divider v-if="$config.emailEnabled"></z-divider>
      <div class="space-y-2">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-vanilla-100 text-base font-medium">Invite via link</h3>
            <p class="text-vanilla-400 text-sm">Teammates will create an account via the link</p>
          </div>
          <div>
            <z-button
              icon="refresh-cw"
              size="small"
              buttonType="secondary"
              @click="resetInviteLink"
            >
              Reset Link
            </z-button>
          </div>
        </div>
        <z-input :disabled="true" :value="team.invitationUrl" :showBorder="true">
          <template slot="right">
            <z-button buttonType="secondary" size="small" @click="copyInviteLink" spacing="px-2">
              <div class="flex items-center space-x-2">
                <z-icon :icon="clipboardIcon" size="small" :color="clipboardColor"></z-icon>
                <span>Copy Link</span>
              </div>
            </z-button>
          </template>
        </z-input>
      </div>
    </div>
  </z-modal>
</template>
<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import TeamDetailMixin from '@/mixins/teamDetailMixin'
import { ZIcon, ZModal, ZInput, ZButton, ZDivider, ZSelect, ZOption } from '@deepsourcelabs/zeal'

const INPUT_DATA = [
  {
    index: 0,
    email: '',
    isValid: true,
    role: 'MEMBER'
  },
  {
    index: 1,
    email: '',
    isValid: true,
    role: 'MEMBER'
  },
  {
    index: 2,
    email: '',
    isValid: true,
    role: 'MEMBER'
  }
]

const ROLES = [
  {
    value: 'ADMIN',
    label: 'Administrator'
  },
  {
    value: 'MEMBER',
    label: 'Member'
  },
  {
    value: 'CONTRIBUTOR',
    label: 'Contributor'
  }
]

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
export default class InviteMembersModal extends mixins(TeamDetailMixin) {
  @Prop({ default: false })
  showModal: boolean

  membersToInvite = INPUT_DATA
  roles = ROLES
  clipboardIcon = 'copy'
  clipboardColor = 'vanilla-100'

  async fetch(): Promise<void> {
    const { owner, provider } = this.$route.params
    await this.fetchInviteUrl({
      login: owner,
      provider
    })
  }

  copyInviteLink(): void {
    if (this.team.invitationUrl) {
      this.$copyToClipboard(this.team.invitationUrl)
      this.clipboardIcon = 'check'
      this.clipboardColor = 'juniper'
      this.$toast.success('Invite link copied to your clipboard')
      setTimeout(() => {
        this.clipboardIcon = 'copy'
        this.clipboardColor = 'vanilla-100'
      }, 800)
    }
  }

  async resetInviteLink(): Promise<void> {
    await this.resetInviteUrl({
      ownerId: this.team.id
    })
    this.$toast.success('Invitiation link successfully reset')
  }

  areEmailsInvalid(): boolean {
    this.membersToInvite = this.membersToInvite.map((member) => {
      if (member.email) {
        return {
          index: member.index,
          email: member.email,
          role: member.role,
          isValid: this.validEmail(member.email)
        }
      }
      return member
    })

    return this.membersToInvite.map((member) => member.isValid).some((el) => el === false)
  }

  validEmail(email: string): boolean {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(email)
  }

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
      this.membersToInvite = INPUT_DATA

      this.$emit('inviteSuccess')
      this.close()
    } catch (e) {
      this.$toast.danger(e.message.replace('GraphQL error: ', ''))
    }
  }

  addMore(): void {
    this.membersToInvite.push({
      index: this.membersToInvite.length + 1,
      email: '',
      isValid: true,
      role: 'MEMBER'
    })
  }

  get disableSend(): boolean {
    return (
      this.membersToInvite.filter((member) => {
        return member.email !== ''
      }).length < 1
    )
  }

  close(): void {
    this.membersToInvite = INPUT_DATA
    this.$emit('close')
  }
}
</script>
