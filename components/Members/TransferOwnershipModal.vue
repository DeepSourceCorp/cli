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
        <div class="mb-0 flex items-center text-base font-medium leading-relaxed text-vanilla-100">
          Transfer ownership of
          {{ activeDashboardContext.team_name }}
        </div>
        <z-alert type="warning">
          <p class="inline-flex items-start">
            <z-icon
              icon="alert-circle"
              color="honey-400"
              size="large"
              class="-mt-1 mr-3 stroke-2 pt-px"
            />
            Please make sure you’ve thought this through! Transferring ownership is immediate and
            you cannot undo this.
          </p>
        </z-alert>
        <div class="w-full space-y-2">
          <label class="space-y-2">
            <span class="text-sm text-vanilla-100">New owner of this team</span>
            <div
              v-if="newOwner"
              class="flex h-10 flex-row justify-between space-x-2 rounded-md border border-slate-400 bg-ink-200 px-3 shadow-inner"
            >
              <div class="flex flex-row space-x-2">
                <div class="my-auto h-7">
                  <z-avatar
                    type="div"
                    :image="newOwner.user.avatar"
                    :user-name="newOwner.user.fullName || newOwner.user.email"
                    :fallback-image="getDefaultAvatar(newOwner.user.email)"
                    size="sm"
                  />
                </div>
                <div class="my-auto text-xs font-medium leading-none text-vanilla-100 sm:text-sm">
                  {{ newOwner.user.email }}
                </div>
              </div>
              <div as="button" class="my-auto cursor-pointer" @click="clearNewOwner">
                <z-icon icon="x" />
              </div>
            </div>
            <div v-else class="relative">
              <z-input
                ref="input"
                v-model="searchCandidate"
                v-focus
                :clearable="searchCandidate !== ''"
                icon="search"
                placeholder="Search for team member"
                background-color="ink-300"
                :debounce-delay="150"
                @debounceInput="fetchTransferCandidates"
                @focus="revealResults"
                @keyup="(event) => handleKeyUp(event)"
                @blur="handleBlur"
              >
                <template #left>
                  <z-icon icon="search" size="small" class="ml-1.5" />
                </template>
              </z-input>
              <div
                v-if="showSearchResults"
                class="absolute z-10 mt-1 max-h-44 w-full overflow-y-auto rounded-md border border-slate-400 shadow-double-dark sm:max-h-80"
                tabindex="-1"
              >
                <div
                  v-if="searchResults.length"
                  class="flex w-full flex-col divide-y divide-ink-100"
                  tabindex="-1"
                >
                  <div
                    v-for="(member, index) in searchResults"
                    :key="member.id"
                    :ref="`searchResult${index}`"
                    tabindex="-1"
                    class="w-full cursor-pointer space-y-1.5 bg-ink-300 p-3 leading-none hover:bg-ink-200 focus:bg-ink-200 focus:outline-none"
                    @click="() => setNewOwner(member)"
                    @focus="() => setItemInFocus(index)"
                    @blur="clearItemInFocus"
                    @keydown="(event) => handleSearchResultKeyDown(event, member)"
                  >
                    <div class="text-sm font-medium">
                      {{ member.user.fullName || member.user.email }}
                    </div>
                    <div v-if="member.user.fullName" class="text-xs text-vanilla-400">
                      {{ member.user.email }}
                    </div>
                  </div>
                </div>
                <div
                  v-else
                  class="w-full bg-ink-300 px-3 py-6 text-center font-medium text-vanilla-400"
                >
                  <span class="text-base">No results found</span>
                </div>
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
            <div class="h-4">
              <p v-if="emailEmpty" class="text-xs text-cherry">This field is required.</p>
              <p v-else-if="!validEmail" class="text-xs text-cherry">Please enter a valid email.</p>
            </div>
          </label>
          <z-checkbox
            v-model="updateBillingEmail"
            :value="updateBillingEmail"
            label="Update billing email"
            spacing="4"
            size="small"
          />
        </div>
      </div>
      <template #footer>
        <div class="mt-6 flex items-center justify-end space-x-4 text-right text-vanilla-100">
          <z-button button-type="ghost" class="text-vanilla-100" size="small" @click="close"
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
      <template #default="{ close }">
        <div class="relative p-6 sm:w-100 sm:p-8" @click.stop>
          <slot>
            <div class="absolute right-4 top-4 cursor-pointer" @click="close">
              <z-icon icon="x" />
            </div>
            <empty-state title="Ownership transferred">
              <template #subtitle>
                <div class="mt-2.5">
                  If you did not intend on transferring ownership, reach out to us at
                  <a href="mailto:support@deepsource.io" class="text-juniper underline"
                    >support@deepsource.io</a
                  >
                </div>
              </template>
            </empty-state>
            <div class="flex items-center justify-end space-x-4 text-right text-vanilla-100">
              <z-button button-type="primary" @click="close">I understand</z-button>
            </div>
          </slot>
        </div>
      </template>
    </z-dialog-generic>
  </div>
</template>

<script lang="ts">
import { Component, Prop, mixins, namespace } from 'nuxt-property-decorator'

import { TeamMember } from '~/types/types'
import TeamDetailMixin from '@/mixins/teamDetailMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import { TeamActions } from '~/store/team/detail'
import { getDefaultAvatar } from '~/utils/ui'

const teamStore = namespace('team/detail')

@Component({
  methods: { getDefaultAvatar },
  layout: 'dashboard'
})
export default class TransferOwnershipModal extends mixins(TeamDetailMixin, ActiveUserMixin) {
  private validEmail = true
  private emailEmpty = false
  private searchCandidate = ''
  public transferInProgress = false
  public showSearchResults = false
  public newOwner = null as TeamMember | null
  public updateBillingEmail = false
  public oldOwnerTypedEmail = ''
  public listLoading = false
  public searchResults = [] as Array<TeamMember> | undefined
  public itemInFocus = -1

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

  mounted() {
    this.fetchTransferCandidates()
  }

  setNewOwner(member: TeamMember) {
    this.newOwner = member
    this.hideResults()
    this.searchCandidate = ''
  }

  clearNewOwner() {
    this.newOwner = null
    this.clearItemInFocus()
    this.fetchTransferCandidates()
  }

  close(): void {
    this.$emit('close')
  }

  hideResults(): void {
    this.showSearchResults = false
  }

  revealResults(): void {
    this.showSearchResults = true
  }

  handleKeyUp(event: KeyboardEvent): void {
    this.revealResults()
    if (event.key === 'ArrowDown') this.focusNext()
  }

  handleSearchResultKeyDown(event: KeyboardEvent, member: TeamMember): void {
    if (event.key === 'Enter') {
      this.setNewOwner(member)
      this.clearItemInFocus()
    } else if (event.key === 'ArrowDown') this.focusNext()
    else if (event.key === 'ArrowUp') this.focusPrevious()
  }

  // Sets the index of the currently focused item
  setItemInFocus(index: number): void {
    this.itemInFocus = index
  }

  // Resets the focused item index
  clearItemInFocus(): void {
    this.itemInFocus = -1
  }

  // Moves focus the next item in the results list
  focusNext(): void {
    if (this.searchResults && this.itemInFocus < this.searchResults.length - 1) {
      const nextItem = this.$refs[`searchResult${this.itemInFocus + 1}`] as Array<HTMLElement>
      if (nextItem[0]) nextItem[0].focus()
    }
  }

  // Moves focus the previous item in the results list
  focusPrevious(): void {
    if (this.searchResults && this.itemInFocus > 0) {
      const prevItem = this.$refs[`searchResult${this.itemInFocus - 1}`] as Array<HTMLElement>
      if (prevItem[0]) prevItem[0].focus()
    } else if (this.itemInFocus === 0) {
      const input = this.$refs.input as HTMLElement
      if (input) input.focus()
    }
  }

  // The timeout allows a search result item to be clicked before the results are hidden
  // The if condition ensures that the results window is not hidden in case a result item is focused via keyboard navigation,
  // allowing subsquent keydown events to continue to navigate the results list
  handleBlur() {
    setTimeout(() => {
      if (this.itemInFocus === -1) this.hideResults()
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
    if (!this.newOwner) {
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
    this.$emit('primaryAction', this.newOwner.user.id, this.updateBillingEmail)
  }
}
</script>
