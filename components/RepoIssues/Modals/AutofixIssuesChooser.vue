<template>
  <portal to="modal">
    <z-modal
      v-if="isOpen"
      @onClose="$emit('close')"
      title="Choose files you want to run Autofix on"
    >
      <div class="flex space-x-2 py-4 text-vanilla-400">
        <div
          class="text-vanilla-400 default-scroll max-h-40 text-sm leading-7 w-full flex flex-col space-y-2"
        >
          <div class="flex-grow px-4">
            <z-input
              v-model="searchedIssue"
              spacing="tight"
              backgroundColor="ink-400"
              :showBorder="false"
              placeholder="Search for files"
              class="py-1.5 leading-6 px-2"
            >
              <template slot="left"
                ><z-icon icon="search" size="small" class="ml-2"></z-icon
              ></template>
            </z-input>
          </div>
          <div class="flex flex-col space-y-2">
            <label class="flex space-x-0.5 px-4 cursor-pointer">
              <z-checkbox
                :value="true"
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
                class="flex flex-col w-full"
                :class="{
                  'bg-ink-200': isIssueSelected(selectedIssues, issue),
                  'bg-transparent': !isIssueSelected(selectedIssues, issue)
                }"
              >
                <label
                  class="w-full flex space-x-1 items-center leading-7 py-2 px-4 cursor-pointer"
                >
                  <z-checkbox
                    :value="issue"
                    v-model="selectedIssues"
                    :true-value="true"
                    :false-value="false"
                    size="small"
                    spacing="4"
                  />
                  <div class="flex w-full space-x-2">
                    <span class="text-vanilla-300">{{ issue.title }}</span>
                    <span class="text-vanilla-400 flex-1">{{ issue.shortcode }}</span>
                    <span class="text-vanilla-400 flex space-x-1">
                      <span class="text-xs">×</span>
                      <span>{{ issue.occurrenceCount }}</span>
                    </span>
                  </div>
                </label>
              </div>
            </div>
            <div
              v-if="!searchedIssues.length"
              class="h-24 px-4 w-full flex flex-col space-y-1 justify-center items-center"
            >
              <h2 class="text-md font-bold">No matching issues found</h2>
              <p class="text-md">Try changing the search query.</p>
            </div>
          </div>
        </div>
      </div>
      <template v-slot:footer="{ close }">
        <div
          class="p-4 space-x-4 text-right text-vanilla-100 border-t border-ink-200 flex items-center justify-end"
        >
          <z-button buttonType="secondary" size="small" @click="close">Cancel</z-button>
          <z-button
            :disabled="selectedIssues.length < 1"
            buttonType="primary"
            icon="autofix"
            size="small"
            @click="autofixSelectedIssues(close)"
          >
            <template v-if="selectedIssues.length">
              Run Autofix on {{ selectedIssues.length || 0 }}
              {{ selectedIssues.length > 1 ? 'files' : 'file' }}
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
import { ZIcon, ZModal, ZButton, ZCheckbox, ZList, ZListItem, ZInput } from '@deepsourcelabs/zeal'
import IssueType from '@/components/Repository/IssueType.vue'

import RunDetailMixin from '~/mixins/runDetailMixin'

@Component({
  name: 'AutofixIssuesChooser',
  components: {
    ZIcon,
    ZModal,
    ZButton,
    ZCheckbox,
    ZList,
    ZListItem,
    ZInput,
    IssueType
  }
})
export default class AutofixIssuesChooser extends mixins(RunDetailMixin) {
  @Prop()
  isOpen!: boolean

  @Prop()
  checkId!: string

  @Prop()
  autofixableIssues!: Array<Record<string, string>>

  public searchedIssue = ''
  public selectedValue = ''
  public selectedIssues: Record<string, string>[] = []
  public selectAll = false
  public maxFilesAutofixRun = 50

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

  get selectedIssueShortcodeArray(): Array<string> {
    /**
     * Returns an array of shortcodes of the selectedIssues
     */
    let shortcodeArray: Array<string> = []
    shortcodeArray = this.selectedIssues.map((issue) => {
      return issue.shortcode
    })
    return shortcodeArray
  }

  @Watch('selectAll')
  public updateSelectAll(newVal: boolean): void {
    if (newVal) {
      this.selectedIssues = this.searchedIssues
    } else {
      this.selectedIssues = []
    }
  }

  public async autofixSelectedIssues(close: () => void): Promise<void> {
    const { owner, provider, repo } = this.$route.params
    // TODO: Add a try-catch block and the catch block will have an error toast
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

    this.$router.push(`/${provider}/${owner}/${repo}/autofix/${response.autofixRunId}`)
  }

  public isIssueSelected(
    selectedIssues: Record<string, string>[],
    issue: Record<string, string>
  ): boolean {
    /**
     * Return true if a issue is already selected
     *
     * @param {String} issue
     * @param {Array} selectedIssues
     *
     */
    return selectedIssues.includes(issue)
  }
}
</script>
