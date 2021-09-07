<template>
  <portal to="modal">
    <z-modal
      v-if="isOpen"
      @onClose="$emit('close')"
      title="Choose files you want to run Autofix on"
    >
      <div class="flex space-x-2 py-4 text-vanilla-400">
        <div
          class="text-vanilla-400 custom-y-scroll max-h-40 text-sm leading-7 w-full flex flex-col space-y-2"
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
              <template slot="left"><z-icon icon="search" size="small"></z-icon></template>
            </z-input>
          </div>
          <div class="flex flex-col space-y-2">
            <div class="flex space-x-0.5 px-4">
              <z-checkbox
                :value="true"
                v-model="selectAll"
                :true-value="true"
                :false-value="false"
                spacing="4"
                @change="updateSelectAll"
              />
              <span class="text-vanilla-400">Select all</span>
            </div>
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
                <div class="w-full flex space-x-1 items-center leading-7 py-2 px-4">
                  <z-checkbox
                    :value="issue"
                    v-model="selectedIssues"
                    :true-value="true"
                    :false-value="false"
                    spacing="4"
                  />
                  <div class="flex w-full space-x-2">
                    <span class="text-vanilla-300">{{ issue.title }}</span>
                    <span class="text-vanilla-400 flex-1">{{ issue.shortcode }}</span>
                    <span class="text-vanilla-300 flex space-x-1">
                      <span class="text-xs">x</span>
                      <span>{{ issue.occurrenceCount }}</span>
                    </span>
                  </div>
                </div>
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
        <div class="py-3 px-3 space-x-2 text-right text-vanilla-100 border-t border-ink-200">
          <z-button buttonType="secondary" size="small" @click="close">Cancel</z-button>
          <z-button
            :disabled="this.selectedIssues.length < 1"
            class="modal-primary-action flex space-x-2 items-center"
            spacing="px-2"
            buttonType="primary"
            size="small"
            @click="autofixSelectedIssues(close)"
          >
            <span class="text-xs text-ink-300"
              >Run Autofix on {{ this.selectedIssues.length || 0 }} files</span
            >
          </z-button>
        </div>
      </template>
    </z-modal>
  </portal>
</template>

<script lang="ts">
import { Vue, Component, Prop, namespace, Watch } from 'nuxt-property-decorator'
import { ZIcon, ZModal, ZButton, ZCheckbox, ZList, ZListItem, ZInput } from '@deepsourcelabs/zeal'
import { RunDetailActions } from '~/store/run/detail'
import IssueType from '@/components/Repository/IssueType.vue'

// types
import { CreateAutofixRunForPullRequestPayload } from '~/types/types'

const runDetailStore = namespace('run/detail')

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
export default class AutofixIssuesChooser extends Vue {
  @Prop()
  isOpen!: boolean

  @Prop()
  checkId!: string

  @Prop()
  autofixableIssues!: Array<Record<string, string>>

  @runDetailStore.Action(RunDetailActions.CREATE_AUTOFIX_PR)
  createAutofixRunPR: (
    params: Record<string, Record<string, string[] | string>>
  ) => { data: { createAutofixRunForPullRequest: CreateAutofixRunForPullRequestPayload } }

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
    const response: {
      data: { createAutofixRunForPullRequest: CreateAutofixRunForPullRequestPayload }
    } = await this.createAutofixRunPR({
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

    this.$router.push(
      `/${provider}/${owner}/${repo}/autofix/${response.data.createAutofixRunForPullRequest.autofixRunId}`
    )
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
