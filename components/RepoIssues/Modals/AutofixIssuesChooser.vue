<template>
  <portal to="modal">
    <z-modal
      v-if="isOpen"
      title="Choose issues you want to run Autofix on"
      @onClose="$emit('close')"
    >
      <div class="flex space-x-2 py-4 text-vanilla-400">
        <div
          class="default-scroll flex max-h-102 min-h-40 w-full flex-col space-y-2 text-sm leading-7 text-vanilla-400"
        >
          <div class="px-4">
            <z-input
              v-model="searchedIssue"
              spacing="tight"
              background-color="ink-400"
              :show-border="false"
              placeholder="Search for issues"
              class="px-2 py-1.5 leading-6"
            >
              <template #left><z-icon icon="search" size="small" class="ml-2" /></template>
            </z-input>
          </div>
          <div class="flex flex-col gap-y-2 overflow-y-auto">
            <label class="flex cursor-pointer gap-x-0.5 px-4">
              <z-checkbox
                v-model="selectAll"
                :true-value="true"
                :false-value="false"
                size="small"
                spacing="4"
                @change="updateSelectAll"
              />
              <span class="text-vanilla-400">Select all</span>
            </label>
            <div>
              <div
                v-for="issue in searchedIssues"
                :key="issue.shortcode"
                class="flex w-full flex-col"
                :class="{
                  'bg-ink-200': isIssueSelected(selectedIssues, issue),
                  'bg-transparent': !isIssueSelected(selectedIssues, issue)
                }"
              >
                <label
                  class="flex w-full cursor-pointer items-center space-x-1 px-4 py-2 leading-7"
                >
                  <z-checkbox
                    v-model="selectedIssues"
                    :value="issue"
                    :true-value="true"
                    :false-value="false"
                    size="small"
                    spacing="4"
                  />
                  <div class="flex w-full space-x-2">
                    <span class="flex-grow">
                      <span class="mr-1.5 text-vanilla-300">{{ issue.title }}</span>
                      <span class="text-vanilla-400">{{ issue.shortcode }}</span>
                    </span>
                    <span class="flex space-x-1 text-vanilla-400">
                      <span class="text-xs">×</span>
                      <span>{{ issue.occurrenceCount }}</span>
                    </span>
                  </div>
                </label>
              </div>
            </div>
            <div
              v-if="!searchedIssues.length"
              class="flex h-24 w-full flex-col items-center justify-center space-y-1 px-4"
            >
              <h2 class="text-md font-bold">No matching issues found</h2>
              <p class="text-md">Try changing the search query.</p>
            </div>
          </div>
        </div>
      </div>
      <template #footer="{ close }">
        <div
          class="flex items-center justify-end space-x-4 border-t border-slate-400 p-4 text-right text-vanilla-100"
        >
          <z-button button-type="secondary" size="small" @click="close">Cancel</z-button>
          <z-button
            :disabled="selectedIssues.length < 1"
            button-type="primary"
            icon="autofix"
            size="small"
            @click="autofixSelectedIssues(close)"
          >
            <template v-if="selectedIssues.length">
              Run Autofix on {{ selectedIssues.length || 0 }}
              {{ selectedIssues.length > 1 ? 'issues' : 'issue' }}
            </template>
            <template v-else> Select at least one issue </template>
          </z-button>
        </div>
      </template>
    </z-modal>
  </portal>
</template>

<script lang="ts">
import { Component, Prop, Watch, mixins } from 'nuxt-property-decorator'
import IssueType from '@/components/Repository/IssueType.vue'

import RunDetailMixin from '~/mixins/runDetailMixin'

/**
 * Modal component that allows selecting issues to autofix for an analysis run.
 */
@Component({
  name: 'AutofixIssuesChooser',
  components: {
    IssueType
  }
})
export default class AutofixIssuesChooser extends mixins(RunDetailMixin) {
  @Prop({ required: true, type: Boolean })
  isOpen!: boolean

  @Prop({ required: true, type: String })
  checkId!: string

  @Prop({ required: true, type: Array })
  autofixableIssues!: Array<Record<string, string>>

  public searchedIssue = ''
  public selectedValue = ''
  public selectedIssues: Record<string, string>[] = []
  public selectAll = false

  get searchedIssues(): Record<string, string>[] {
    const allIssues = this.autofixableIssues || []
    const searchTerm = this.searchedIssue.toLowerCase()
    if (searchTerm) {
      const filteredList = allIssues.filter((issue) => {
        return (
          issue.title.toLowerCase().includes(searchTerm) ||
          issue.shortcode.toLowerCase().includes(searchTerm)
        )
      })
      return filteredList
    }
    this.selectAll = true
    return allIssues
  }

  /**
   * @returns {Array<string>} Returns an array of shortcodes of the selectedIssues.
   */
  get selectedIssueShortcodeArray(): Array<string> {
    let shortcodeArray: Array<string> = []
    shortcodeArray = this.selectedIssues.map((issue) => {
      return issue.shortcode
    })
    return shortcodeArray
  }

  /**
   * Watcher for `selectAll`. Selects all issues (w/ searched filter if available) when `newVal` is true.
   *
   * @param {boolean} newVal - Updated value of `selectAll`.
   * @returns {void}
   */
  @Watch('selectAll')
  public updateSelectAll(newVal: boolean): void {
    if (newVal) {
      this.selectedIssues = this.searchedIssues
    } else {
      this.selectedIssues = []
    }
  }

  /**
   * Creates autofixes for selected issues and redirects user to the created autofix run.
   *
   * @param {() => void} close - Function to close the selector modal on success.
   * @returns {Promise<void>}
   */
  public async autofixSelectedIssues(close: () => void): Promise<void> {
    const { owner, provider, repo } = this.$route.params
    try {
      const response = await this.createAutofixPullRequest({
        input: {
          issues: this.selectedIssueShortcodeArray,
          checkId: this.checkId
        }
      })
      if (close) {
        close()
      } else {
        this.$emit('close')
      }
      if (response.autofixRunId) {
        this.$router.push(`/${provider}/${owner}/${repo}/autofix/${response.autofixRunId}`)
      } else {
        this.$toast.danger(
          'An error occured while redirecting you to autofixes for selected issues.'
        )
      }
    } catch (e) {
      this.$toast.danger('An error occured while creating autofixes for selected issues.')
    }
  }

  /**
   * Function to check if a given `issue` is already present in list of `selectedIssues` or not.
   *
   * @param {Record<string, string>[]} selectedIssues
   * @param {Record<string, string>} issue
   * @returns {boolean} - Returns `true` if an issue is already selected.
   */
  public isIssueSelected(
    selectedIssues: Record<string, string>[],
    issue: Record<string, string>
  ): boolean {
    return selectedIssues.includes(issue)
  }
}
</script>
