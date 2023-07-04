<template>
  <z-accordion class="text-vanilla-100 border border-ink-200 rounded-md bg-ink-300">
    <z-accordion-item title="Delete account" class="p-3" @isOpen="isOpenHandler">
      <template #title="{ toggleAccordion }">
        <div class="flex items-center cursor-pointer gap-1" @click="toggleAccordion">
          <z-icon icon="chevron-right" :class="chevronIconAnimateClass" class="transform" />
          <span class="font-medium text-xs uppercase text-vanilla-400 tracking-wider"
            >Advanced settings</span
          >
        </div>
      </template>
      <div
        class="grid border border-cherry border-opacity-20 bg-cherry bg-opacity-5 rounded-md divide-y divide-cherry divide-opacity-20 mt-4"
      >
        <div class="flex gap-12 p-4">
          <div class="space-y-1.5">
            <span class="text-cherry text-sm">Delete account</span>
            <div v-if="deleteAllowed" class="text-cherry-300 text-xs leading-6">
              Permanently remove your personal account and all of its contents from the DeepSource
              platform.
            </div>
            <div v-else-if="teamOwnerships.length === 1" class="text-cherry-300 text-xs leading-6">
              You cannot delete your account as you are the owner of
              <team-label v-bind="teamOwnerships[0]" />
              . Transfer the ownership of the team to another team member OR delete your team first
              to safely delete your account.
            </div>
            <div v-else class="text-cherry-300 text-xs leading-6">
              You cannot delete your account as you are the owner of
              <span v-for="(team, index) in teamOwnerships.slice(0, -1)" :key="index">
                <team-label v-bind="team" /><span v-if="index < teamOwnerships.slice(0, -2).length"
                  >,
                </span>
              </span>
              and
              <team-label v-bind="teamOwnerships.slice(-1)[0]" />. Transfer the ownership of the
              teams to other team members OR delete your team first to safely delete your account.
            </div>
          </div>
          <z-button
            v-if="deleteAllowed"
            size="small"
            button-type="danger"
            icon="trash-2"
            @click="showDeleteDialog = true"
          >
            Delete account
          </z-button>
        </div>
        <nuxt-link
          v-if="teamOwnerships.length === 1"
          :to="teamSettingsLink(teamOwnerships[0])"
          class="text-cherry-300 text-xs leading-6 p-4"
        >
          Go to
          <team-label v-bind="teamOwnerships[0]" />
          settings ->
        </nuxt-link>
      </div>
    </z-accordion-item>
    <portal to="modal">
      <z-modal
        v-if="showDeleteDialog"
        title="Delete account"
        primary-action-type="danger"
        primary-action-label="I understand, continue to delete ->"
        @onClose="handleDialogClose"
      >
        <div class="text-sm p-4">
          <!-- Delete Step 1-->
          <div v-if="deleteStep === 0" class="space-y-3">
            <div>Are you sure you want to delete your account? Deleting your account would:</div>
            <div class="flex items-start gap-2 w-full">
              <z-icon
                icon="alert-circle"
                color="cherry"
                size="x-small"
                class="mt-1 flex-shrink-0"
              />

              <div>
                Remove all data associated with
                <span class="bg-vanilla-100 bg-opacity-10 rounded-sm px-0.5">{{
                  viewer.email
                }}</span
                >. This includes all repositories and analyses runs in the past.
              </div>
            </div>
            <div class="flex items-start gap-2 w-full">
              <z-icon
                icon="alert-circle"
                color="cherry"
                size="x-small"
                class="mt-1 flex-shrink-0"
              />

              <span>Remove you from all teams you are a part of.</span>
            </div>
          </div>
          <!-- Delete Step 2-->
          <div v-else-if="deleteStep === 1" class="flex flex-col gap-y-4 w-full">
            <div
              class="p-2 text-cherry-400 bg-cherry bg-opacity-10 rounded-md flex items-center gap-2"
            >
              <z-icon icon="solid-alert-circle" color="cherry" />This action is irreversible and
              cannot be undone.
            </div>
            <label>
              <div class="mb-2">Please type your email address to confirm deletion</div>
              <z-input
                v-model="typedEmail"
                type="email"
                placeholder="Type your email address"
                @input="validateEmail"
              />
              <input ref="emailInput" type="email" class="hidden" />
            </label>
          </div>
        </div>
        <template #footer>
          <div class="flex items-center justify-end p-4 gap-x-4 text-right text-vanilla-100">
            <z-button
              v-if="deleteStep === 0"
              button-type="danger"
              size="small"
              label="I understand, continue to delete ->"
              class="modal-primary-action"
              @click="deleteStep = 1"
            />
            <z-button
              v-else-if="deleteStep === 1"
              :is-loading="deletingUser"
              :disabled="!emailIsValid"
              icon="trash-2"
              button-type="danger"
              size="small"
              label="Delete account"
              class="modal-primary-action"
              loading-label="Deleting user"
              @click="handleDeleteUser"
            />
          </div>
        </template>
      </z-modal>
    </portal>
  </z-accordion>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import AuthMixin from '~/mixins/authMixin'
import {
  ZIcon,
  ZTag,
  ZAccordion,
  ZAccordionItem,
  ZButton,
  ZModal,
  ZAlert,
  ZInput
} from '@deepsource/zeal'

import { resolveNodes } from '~/utils/array'
import { Owner, Team, TeamConnection, User } from '~/types/types'

type AliasedUser = User & { primaryTeamAccounts: TeamConnection }

@Component({
  components: {
    ZIcon,
    ZTag,
    ZAccordion,
    ZAccordionItem,
    ZButton,
    ZModal,
    ZAlert,
    ZInput
  }
})
export default class DeleteUser extends mixins(ActiveUserMixin, AuthMixin) {
  chevronIconAnimateClass = ''
  showDeleteDialog = false
  deleteStep = 0 // 0 = initial dialog with warning message, 1 = email input step with actual delete button
  deletingUser = false
  typedEmail = ''
  emailIsValid = true

  get teamOwnerships() {
    return resolveNodes((this.viewer as AliasedUser).primaryTeamAccounts)
  }

  /**
   * Whether the user is allowed to delete their account
   *
   * @returns {boolean}
   */
  get deleteAllowed() {
    return this.teamOwnerships.length === 0
  }

  /**
   * Verifies if the given email in the email input is valid or not.
   *
   * @returns {void}
   */
  validateEmail(): void {
    const emailInput = this.$refs['emailInput'] as HTMLInputElement
    emailInput.value = this.typedEmail
    this.emailIsValid = emailInput.checkValidity()
  }

  /**
   * Returns a link to the given team's member settings page
   *
   * @param {Owner} team
   * @returns {string}
   */
  teamSettingsLink(team: Owner) {
    return `/${team.vcsProvider.toLowerCase()}/${team.login}/members/active`
  }

  /**
   * Handles the delete modal close event. Makes sure that the delete processes resets completely.
   *
   * @returns {void}
   */
  handleDialogClose() {
    this.showDeleteDialog = false
    this.deleteStep = 0
  }

  /**
   * Handles the user delete. Verifies that the typed email matches the account email, if so attempts the delete action.
   * On successfull delete, redirects the user to the /user-deleted page
   *
   * @returns {void}
   */
  async handleDeleteUser() {
    if (this.typedEmail !== this.viewer.email) {
      this.$toast.danger('The typed email does not match your account email address!')
      return false
    }
    this.deletingUser = true
    const response = await this.deleteUser({
      sendEmail: true
    })
    this.deletingUser = false
    if (response === true) {
      window.location.replace('/user-deleted')
    }
  }

  /**
   * Handler for the `isOpen` event emitted by `ZAccordionItem`
   *
   * @param {boolean} open
   * @returns {void}
   */
  isOpenHandler(open: boolean): void {
    this.chevronIconAnimateClass = open
      ? 'animate-first-quarter-spin rotate-90'
      : 'animate-reverse-quarter-spin rotate-0'
  }
}
</script>
