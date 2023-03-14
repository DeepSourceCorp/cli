<template>
  <div class="flex items-center flex-auto justify-end space-x-2">
    <!-- Autofix -->
    <z-button
      v-if="isAutofixEnabled && issue.autofixAvailable && hasRepoReadAccess"
      button-type="primary"
      size="small"
      custom-classes="hidden xl:flex items-center space-x-2"
      :disabled="!canCreateAutofix"
      @click.prevent="openModal('autofix')"
    >
      <z-icon icon="autofix" size="small" color="ink-300" />
      <span>Autofix</span>
    </z-button>

    <!-- Ignore issue actions -->
    <z-menu v-if="canIgnoreIssues" direction="left" class="text-vanilla-100">
      <template v-slot:trigger="{ toggle }">
        <div class="flex items-center gap-x-2">
          <div v-if="showNavButtons" class="flex items-center gap-x-2">
            <z-button
              type="button"
              button-type="secondary"
              size="small"
              icon="chevron-left"
              class="hidden sm:flex"
              v-tooltip="previousIssue && previousIssue.label"
              :disabled="!previousIssue"
              @click="() => $router.push(previousIssue.to)"
            />

            <z-button
              type="button"
              button-type="secondary"
              size="small"
              icon="chevron-right"
              class="hidden sm:flex"
              v-tooltip="nextIssue && nextIssue.label"
              :disabled="!nextIssue"
              @click="() => $router.push(nextIssue.to)"
            />
          </div>

          <z-button
            type="button"
            button-type="secondary"
            size="small"
            icon="slash"
            class="hidden sm:flex"
            @click="toggle"
          >
            Ignore this issue
          </z-button>
          <z-button
            type="button"
            button-type="secondary"
            size="small"
            icon="slash"
            class="sm:hidden"
            @click="toggle"
          />
        </div>
      </template>
      <template slot="body" class="text-vanilla-200">
        <z-menu-item
          v-for="filter in ignoreIssues"
          v-bind:key="filter.name"
          @click="() => openModal(filter.name)"
        >
          {{ filter.label }}
        </z-menu-item>
      </template>
    </z-menu>
    <ignore-issue-all-files
      v-if="currentComponent === 'all-files'"
      :is-open="isOpen"
      :check-id="checkId"
      :shortcode="shortcode"
      @close="close"
      @ignore="markAllOccurrenceDisabled"
    />
    <ignore-issue-test-files
      v-if="currentComponent === 'test-files'"
      :is-open="isOpen"
      :check-id="checkId"
      :shortcode="shortcode"
      @close="close"
      @ignore="markAllOccurrenceDisabled"
    />
    <ignore-issue-file-pattern
      v-if="currentComponent === 'file-pattern'"
      :is-open="isOpen"
      :check-id="checkId"
      :shortcode="shortcode"
      @close="close"
      @ignore="markAllOccurrenceDisabled"
    />
    <autofix-file-chooser
      v-if="currentComponent === 'autofix'"
      :is-open="isOpen"
      :issue-id="issue.id"
      :repository-id="repository.id"
      :shortcode="issue.shortcode"
      :raised-in-files="issue.raisedInFiles"
      @close="close"
      @run-quota-exhausted="openUpgradeAccountModal"
    />
    <upgrade-account-modal
      v-if="isUpgradeAccountModalOpen"
      :login="$route.params.owner"
      :provider="$route.params.provider"
      @close="isUpgradeAccountModalOpen = false"
    />
    <!-- Create issue on VCS -->
    <template v-if="hasRepoReadAccess">
      <template v-if="createIssueOptions.length > 1">
        <z-split-button-dropdown
          :icon="currentOption.icon"
          :is-loading="isActionLoading"
          button-type="secondary"
          size="small"
          @click="wrapAction(currentOption)"
        >
          <template #button-label>
            <span class="hidden sm:flex">{{ currentOption.label }}</span>
          </template>
          <template #menu-body>
            <template v-for="opt in createIssueOptions">
              <z-menu-item
                v-if="currentOption.id !== opt.id"
                :key="opt.id"
                as="button"
                @click="wrapAction(opt)"
                :icon="opt.icon"
                class="w-full"
              >
                {{ opt.label }}
              </z-menu-item>
            </template>
          </template>
        </z-split-button-dropdown>
      </template>

      <template v-else-if="currentOption">
        <z-button
          :icon="currentOption.icon"
          target="_blank"
          rel="noopener noreferrer"
          button-type="secondary"
          size="small"
          @click="wrapAction(currentOption)"
        >
          <span class="hidden sm:flex">{{ currentOption.label }}</span>
        </z-button>
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZButton, ZMenu, ZMenuItem, ZSplitButtonDropdown } from '@deepsource/zeal'
import { RepositoryIssue, Maybe } from '~/types/types'
import { AutofixFileChooser } from '@/components/RepoIssues'
import {
  IgnoreIssueTestFiles,
  IgnoreIssueAllFiles,
  IgnoreIssueFilePattern
} from '@/components/RepoIssues/index'

import RoleAccessMixin from '~/mixins/roleAccessMixin'
import IntegrationsDetailMixin from '~/mixins/integrationsDetailMixin'
import { AppFeatures } from '~/types/permTypes'
import { IssueLink } from '~/mixins/issueListMixin'

export interface CreateIssueActionItem {
  id: string
  icon: string
  label: string
  to?: string
  action?: () => Promise<void>
}

@Component({
  components: {
    ZIcon,
    ZButton,
    ZMenu,
    ZMenuItem,
    ZSplitButtonDropdown,
    IgnoreIssueTestFiles,
    IgnoreIssueAllFiles,
    IgnoreIssueFilePattern,
    AutofixFileChooser
  }
})
export default class IssueActions extends mixins(RoleAccessMixin, IntegrationsDetailMixin) {
  @Prop()
  issue!: RepositoryIssue

  @Prop({ default: true })
  canCreateAutofix!: boolean

  @Prop({ default: true })
  isAutofixEnabled!: boolean

  @Prop({ required: true })
  checkId: string

  @Prop({ default: () => [] })
  issueCreateIntegrations?: string[]

  @Prop({ required: true })
  shortcode: string

  @Prop({ default: null })
  nextIssue: IssueLink | null

  @Prop({ default: null })
  previousIssue: IssueLink | null

  public isOpen = false
  public isUpgradeAccountModalOpen = false
  public currentComponent = ''
  public isActionLoading = false
  public defaultActionId = ''

  public ignoreIssues: Array<Record<string, string | boolean>> = [
    { label: 'For a file pattern', name: 'file-pattern', isActive: false },
    { label: 'For all test files', name: 'test-files', isActive: false },
    { label: 'For all files', name: 'all-files', isActive: false }
  ]

  /**
   * Created hook
   *
   * @return {any}
   */
  created() {
    this.defaultActionId = this.$cookies.get('ds-default-create-issue-action')
  }

  get createIssueOptions(): CreateIssueActionItem[] {
    const options: CreateIssueActionItem[] = []
    const { provider } = this.$route.params

    const vcsAction = {
      id: 'create-issue-on-vcs',
      icon: provider === 'gl' ? 'gitlab' : 'github',
      label: `Create issue on ${provider === 'gl' ? 'GitLab' : 'GitHub'}`,
      to: this.issue.newVcsIssueUrl || ''
    }

    if (this.isJiraEnabled) {
      options.push({
        id: 'create-issue-on-jira',
        icon: 'jira',
        label: 'Create issue on Jira',
        action: this.createJiraIssue
      })
    }

    if (
      this.$gateKeeper.provider(AppFeatures.CREATE_ISSUE_ON_VCS, provider) &&
      this.issue.newVcsIssueUrl
    ) {
      options.push(vcsAction)
    }

    return options
  }

  /**
   * Create JIRA issue, show success toast if done, otherwise log the error
   *
   * @return {Promise<void>}
   */
  async createJiraIssue(): Promise<void> {
    this.isActionLoading = true
    try {
      const { ok, issueCode, issueUrl } = await this.createIssueOnIntegration({
        integrationShortcode: 'jira',
        repositoryIssueId: this.issue.id
      })

      if (ok && issueUrl) {
        this.$toast.show({
          type: 'success',
          message: `Created issue ${issueCode} on Jira.`,
          timeout: 10,
          primary: {
            label: 'Open issue',
            action: () => {
              window.open(issueUrl, '_blank')
            }
          }
        })
      } else {
        // This error message will only be reported internally, and won't be visible to the user
        throw Error('Got a non-ok response while creating Jira issue.')
      }
    } catch (e) {
      this.$logErrorAndToast(
        e as Error,
        'There was a problem while creating the issue, please try again later.'
      )
    } finally {
      this.isActionLoading = false
    }
  }

  get isJiraEnabled(): boolean {
    return (this.issueCreateIntegrations ?? []).includes('jira')
  }

  /**
   * Wrapper to set the default option for vcs issue creation and executing it
   *
   * @param {CreateIssueActionItem} opt
   * @return {Promise<void> | void}
   */
  wrapAction(opt: CreateIssueActionItem): Promise<void> | void {
    this.$cookies.set('ds-default-create-issue-action', opt.id)
    this.defaultActionId = opt.id
    if (opt.to) {
      window.open(opt.to, '_blank')
    } else if (opt.action) {
      return opt.action()
    }
  }

  get currentOption(): Maybe<CreateIssueActionItem> {
    const userPreferredAction =
      this.defaultActionId ?? this.$cookies.get('ds-default-create-issue-action')

    if (userPreferredAction) {
      const filteredOptions = this.createIssueOptions.filter(
        (opt) => opt.id === userPreferredAction
      )
      if (filteredOptions.length) {
        return filteredOptions[0]
      }
    }

    return this.createIssueOptions.length ? this.createIssueOptions[0] : null
  }

  /**
   * close the modal
   *
   * @return {void}
   */
  public close(): void {
    this.isOpen = false
  }

  /**
   * Function to open Upgrade account modal on the `run-quota-exhausted` event
   *
   * @returns {void}
   */
  public openUpgradeAccountModal(): void {
    this.isOpen = false
    this.isUpgradeAccountModalOpen = true
  }

  /**
   * Open the given component modal
   *
   * @param {string} name - Name of the component
   *
   * @return {void}
   */
  public openModal(name: string): void {
    this.currentComponent = name
    this.isOpen = true
  }

  get canIgnoreIssues() {
    return this.repoPerms.canIgnoreIssues
  }

  /**
   * Ensures that nav buttons are only shown for the history page
   */
  get showNavButtons() {
    const { runId } = this.$route.params
    return runId ? true : false
  }

  /**
   * Post ignore issue, dispatch events to refetch data and close the modal
   *
   * @param {string[]} issueIds
   *
   * @return {void}
   */
  public markAllOccurrenceDisabled(issueIds: string[]): void {
    this.$root.$emit('refetchCheck', this.checkId)
    this.$emit('ignoreIssues', issueIds)
    this.close()
  }
}
</script>
