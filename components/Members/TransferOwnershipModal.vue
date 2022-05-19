<template>
  <div>
    <z-confirm
      v-if="showModal && !transferSuccess"
      :close-after-primary-action="false"
      primary-action-label="Confirm and transfer ownership"
      @onClose="close"
      @primaryAction="triggerTransferOwnership"
    >
      <div class="flex flex-col space-y-6">
        <div class="flex items-center mb-0 text-base font-medium leading-relaxed text-vanilla-100">
          Transfer ownership of
          {{ activeDashboardContext.team_name }}
        </div>
        <z-alert type="danger">
          <p class="inline-flex items-start">
            <z-icon icon="alert-circle" color="cherry-400" size="large" class="mr-3 stroke-2" />
            Please make sure you’ve thought this through! Transferring ownership is immediate and
            you cannot undo this.
          </p>
        </z-alert>
        <div class="w-full space-y-2">
          <label class="space-y-2">
            <span class="text-sm text-vanilla-100">New owner of this team</span>
            <div class="relative">
              <z-input
                v-model="searchCandidate"
                v-focus
                :clearable="searchCandidate !== ''"
                icon="search"
                placeholder="Search for team member"
                background-color="ink-300"
                @debounceInput="fetchTransferCandidates"
                @focus="revealResults"
                @keyup="handleKeyUp"
                @blur="handleBlur"
                :class="[newOwnerId === '' ? 'text-vanilla-400' : 'text-vanilla-100']"
              >
                <template slot="left">
                  <z-icon icon="search" size="small" class="ml-1.5" />
                </template>
              </z-input>
              <div
                v-if="showSearchResults"
                class="absolute mt-1 w-full shadow-double-dark max-h-80 overflow-y-auto border border-ink-100 rounded-sm"
              >
                <div
                  v-if="searchResults.length && searchCandidate"
                  class="w-full flex flex-col divide-y divide-ink-100"
                >
                  <div
                    v-for="member in searchResults"
                    :key="member.id"
                    @click="() => setNewOwner(member)"
                    class="p-3 w-full leading-none cursor-pointer bg-ink-300 hover:bg-ink-200 space-y-1.5"
                  >
                    <div class="text-sm font-medium">
                      {{ member.user.fullName || member.user.email }}
                    </div>
                    <div v-if="member.user.fullName" class="text-xs text-vanilla-400">
                      {{ member.user.email }}
                    </div>
                  </div>
                </div>
                <lazy-empty-state
                  v-else
                  image-width="w-20"
                  class="font-medium text-vanilla-400 bg-ink-300"
                >
                  <template #title> <span class="text-base">No results found</span></template>
                </lazy-empty-state>
              </div>
            </div>
          </label>
        </div>

        <div class="w-full">
          <label class="space-y-2">
            <span class="text-sm text-vanilla-100">Your email address for verification</span>
            <z-input
              v-model="oldOwnerTypedEmail"
              :is-invalid="emailEmpty || !validEmail"
              :validate-on-blur="true"
              placeholder="Enter your email address"
              background-color="ink-300"
              type="email"
              @blur="(ev) => validateEmail(ev.target)"
            />
            <p v-if="emailEmpty" class="text-xs text-cherry">This field is required.</p>
            <p v-else-if="!validEmail" class="text-xs text-cherry">Please enter a valid email.</p>
          </label>
        </div>
      </div>
      <template slot="footer">
        <div class="mt-6 space-x-4 text-right text-vanilla-100 flex items-center justify-end">
          <z-button buttonType="ghost" class="text-vanilla-100" size="small" @click="close"
            >Cancel</z-button
          >
          <z-button
            :is-loading="transferLoading"
            button-type="primary"
            icon="check"
            size="small"
            loading-label="Transferring ownership"
            class="modal-primary-action"
            @click="triggerTransferOwnership"
            >Confirm and transfer ownership</z-button
          >
        </div>
      </template>
    </z-confirm>
    <z-dialog-generic v-else @onClose="close">
      <template v-slot:default="{ close }">
        <div class="relative p-6 sm:p-8 sm:w-100" @click.stop>
          <slot>
            <div @click="close" class="absolute cursor-pointer top-4 right-4">
              <z-icon icon="x" />
            </div>
            <empty-state title="Ownership transferred">
              <template slot="subtitle">
                <div class="mt-2.5">
                  If you did not intend on transferring ownership, reach out to us at
                  <a href="mailto:support@deepsource.io" class="underline text-juniper"
                    >support@deepsource.io</a
                  >
                </div>
              </template>
            </empty-state>
          </slot>
        </div>
      </template>
    </z-dialog-generic>
  </div>
</template>

<script lang="ts">
import { Component, Prop, mixins, Watch, namespace } from 'nuxt-property-decorator'
import {
  ZAlert,
  ZIcon,
  ZConfirm,
  ZSelect,
  ZOption,
  ZInput,
  ZDialogGeneric,
  ZButton
} from '@deepsourcelabs/zeal'
import { TeamMember } from '~/types/types'
import TeamDetailMixin from '@/mixins/teamDetailMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import { TeamActions } from '~/store/team/detail'

const teamStore = namespace('team/detail')

@Component({
  components: {
    ZAlert,
    ZIcon,
    ZConfirm,
    ZSelect,
    ZOption,
    ZInput,
    ZDialogGeneric,
    ZButton
  },
  layout: 'dashboard'
})
export default class TransferOwnershipModal extends mixins(TeamDetailMixin, ActiveUserMixin) {
  private validEmail = true
  private emailEmpty = false
  private searchCandidate = ''
  public transferInProgress = false
  public showSearchResults = false
  public newOwnerId = ''
  public oldOwnerTypedEmail = ''
  public listLoading = false
  public searchResults = [] as Array<TeamMember> | undefined

  @teamStore.Action(TeamActions.QUERY_TEAM_MEMBERS)
  queryTeamMembers: (
    args: {
      login: string
      provider: string
      limit: number
      currentPage: number
      query: string
      refetch?: boolean
    },
    refetch?: boolean
  ) => Promise<Array<TeamMember> | undefined>

  @Prop({ default: false })
  showModal: Boolean

  @Prop({ required: true })
  members: TeamMember[]

  @Prop({ default: false })
  transferLoading: false

  @Prop({ default: false })
  transferSuccess: boolean

  get transferOwnershipCandidates(): TeamMember[] {
    return this.members.filter((member) => member.isPrimaryUser === false)
  }

  async fetchTransferCandidates(refetch = false): Promise<void> {
    this.listLoading = true
    const { owner, provider } = this.$route.params
    this.queryTeamMembers({
      login: owner,
      provider,
      currentPage: 0,
      limit: 10,
      query: this.searchCandidate,
      refetch
    }).then((teamMembers) => {
      this.searchResults = teamMembers?.filter((member) => member.isPrimaryUser === false)
    })

    this.listLoading = false
  }

  @Watch('searchCandidate')
  update(): void {
    if (!this.searchCandidate) {
      this.newOwnerId = ''
    }
  }

  setNewOwner(member: TeamMember) {
    this.newOwnerId = member.user.id
    this.searchCandidate = member.user.fullName || member.user.email
    this.hideResults()
  }

  close(): void {
    this.$emit('close')
  }

  revealResults(): void {
    if (this.searchCandidate) this.showSearchResults = true
  }

  handleKeyUp(): void {
    this.revealResults()
    this.newOwnerId = ''
  }

  hideResults(): void {
    this.showSearchResults = false
  }

  // The timeout allows a search result item to be clicked before the results are hidden
  handleBlur() {
    setTimeout(() => {
      this.hideResults()
    }, 150)
  }

  validateEmail(el: HTMLInputElement): void {
    this.validEmail = el.checkValidity()
    if (!this.oldOwnerTypedEmail) {
      this.emailEmpty = true
      return
    }
    this.emailEmpty = false
  }

  triggerTransferOwnership(): void {
    if (this.newOwnerId === '') {
      this.$toast.danger('Please choose a new owner for this team.')
      return
    }

    if (this.emailEmpty || !this.validEmail) {
      this.$toast.danger('Please enter a valid email.')
      return
    }

    if (this.oldOwnerTypedEmail !== this.viewer.email) {
      this.$toast.danger('Please ensure that your email address is entered correctly.')
      return
    }
    this.$emit('primaryAction', this.newOwnerId)
  }
}
</script>
