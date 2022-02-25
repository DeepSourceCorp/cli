<template>
  <section class="space-y-4">
    <label class="text-base font-medium">What type of issues are important to you?</label>
    <div class="grid grid-cols-1 gap-4 overflow-y-scroll lg:grid-cols-2 max-h-102">
      <div
        v-for="issue in issueTypes"
        class="p-5 transition-all duration-100 border rounded-md cursor-pointer"
        :key="issue.name"
        :class="issue.isChecked ? 'bg-ink-300 border-ink-200' : 'bg-ink-400 border-ink-300'"
        @click.prevent="issue.isChecked = !issue.isChecked"
      >
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <z-icon :icon="issue.icon" color="vanilla-100" />
            <span class="flex-1 font-medium">{{ issue.label }}</span>
            <z-checkbox :name="issue.name" v-model="issue.isChecked" />
          </div>
        </div>
      </div>
    </div>
    <z-button
      label="Save and proceed"
      loading-label="Saving"
      icon="save"
      class="w-full"
      :disabled="nextDisabled"
      :is-loading="savingPreferences"
      @click="submitSettings"
    />
  </section>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZInput, ZIcon, ZCheckbox, ZButton } from '@deepsourcelabs/zeal'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import { IssueTypeSetting } from '~/types/types'
import MetaMixin from '~/mixins/metaMixin'
import RepoDetailMixin from '~/mixins/repoDetailMixin'

export interface Issue {
  name: string
  icon: string
  label: string
  description: string
  isChecked: boolean
}

const ISSUE_TYPES: Record<string, Issue> = {
  'bug-risk': {
    name: 'bug-risk',
    icon: 'bug-risk',
    label: 'Bug risk',
    description: 'Issues that can cause bugs and breakage in production',
    isChecked: true
  },
  security: {
    name: 'security',
    icon: 'security',
    label: 'Security',
    description: 'Issues that can potentially be or lead to a security vulnerability',
    isChecked: true
  },
  coverage: {
    name: 'coverage',
    icon: 'coverage',
    label: 'Coverage',
    description: 'Lapses in test coverage in the source code',
    isChecked: true
  },
  antipattern: {
    name: 'antipattern',
    icon: 'antipattern',
    label: 'Anti-pattern',
    description: 'Code patterns that affect maintainibility negatively',
    isChecked: true
  },
  performance: {
    name: 'performance',
    icon: 'performance',
    label: 'Performance',
    description: 'Issues that impact performance code when in production',
    isChecked: true
  },
  typecheck: {
    name: 'typecheck',
    icon: 'typecheck',
    label: 'Typecheck',
    description: 'Typing violations for a dynamically typed language',
    isChecked: true
  },
  style: {
    name: 'style',
    icon: 'style',
    label: 'Style',
    description: 'Violation in the code format due to difference in style guide',
    isChecked: false
  },
  doc: {
    name: 'doc',
    icon: 'doc',
    label: 'Documentation',
    description: 'Lapses in source code documentation',
    isChecked: false
  }
}

/**
 * Onboarding page, for the user to select issue preferences
 */
@Component({
  components: {
    ZInput,
    ZIcon,
    ZCheckbox,
    ZButton
  },
  middleware: ['restrictOnboarding'],
  meta: {
    auth: {
      strict: true,
      redirectToLogin: true
    }
  }
})
export default class OnboardPreferences extends mixins(
  RepoDetailMixin,
  OwnerDetailMixin,
  MetaMixin
) {
  public searchCandidate = ''
  public savingPreferences = false
  public issueTypes = ISSUE_TYPES

  metaTitle = 'Set preferences • DeepSource'
  metaDescription = 'Pick a repository to run your first analysis'

  /**
   * Nuxt fetch hook
   *
   * @return {Promise<void>}
   */
  async fetch(): Promise<void> {
    // fetch all the issue preferences user has set
    const { owner, provider, repo } = this.$route.params
    await this.fetchIssueTypeSettings({ login: owner, provider })
    this.fetchBasicRepoDetails({
      provider,
      owner,
      name: repo
    })
    this.updateIssueTypes()
  }

  /**
   * update the local issurePreferences state
   *
   * @return {void}
   */
  updateIssueTypes() {
    this.owner?.ownerSetting?.issueTypeSettings?.forEach((issue) => {
      if (issue) {
        const { slug, isIgnoredInCheckStatus } = issue
        if (slug && typeof slug === 'string' && slug in this.issueTypes) {
          this.issueTypes[slug].isChecked = !isIgnoredInCheckStatus
        }
      }
    })
  }

  /**
   * Getter that just returns the issue from the issue types dict as an array
   *
   * @return {Issue[]}
   */
  get issuePreferencesArray(): Issue[] {
    return Object.keys(this.issueTypes).map((issueName) => {
      return this.issueTypes[issueName]
    })
  }

  /**
   * Disable next actions in no issues are selected
   *
   * @return {boolean}
   */
  get nextDisabled(): boolean {
    return this.issuePreferencesArray.filter((issue) => issue.isChecked).length === 0
  }

  /**
   * Getter to mangle the issue preferences in a way
   * that is easily consumable by the component
   *
   * @return {IssueTypeSetting[]}
   */
  get issuePreferences(): IssueTypeSetting[] {
    return this.issuePreferencesArray.map((issue) => {
      return {
        isIgnoredInCheckStatus: !issue.isChecked,
        isIgnoredToDisplay: !issue.isChecked,
        slug: issue.name
      }
    })
  }

  /**
   * Submit the issue type preferences for the owner
   *
   * @return {Promise<void>}
   */
  async submitSettings(): Promise<void> {
    this.savingPreferences = true
    const { owner, provider, repo } = this.$route.params
    await this.submitIssueTypeSettings({
      login: owner,
      provider,
      preferences: this.issuePreferences
    })
    this.updateIssueTypes()
    await this.$router.push(`/onboard/${provider}/${owner}/${repo}/config`)
    this.savingPreferences = false
  }
}
</script>
