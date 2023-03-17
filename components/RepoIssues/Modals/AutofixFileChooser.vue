<template>
  <portal to="modal">
    <z-modal v-if="isOpen" @onClose="close" title="Choose files you want to run Autofix on">
      <div class="flex p-4 space-x-2 text-vanilla-400">
        <div
          class="flex flex-col w-full space-y-2 text-sm leading-7 text-vanilla-400 custom-y-scroll min-h-40 max-h-102"
        >
          <z-input
            v-model="searchCandidate"
            spacing="tight"
            background-color="ink-400"
            placeholder="Search for files"
            class="py-1.5 leading-6 px-2"
          >
            <template slot="left">
              <z-icon icon="search" size="small" class="w-6 pl-2" />
            </template>
          </z-input>
          <z-list class="flex flex-col px-1 space-y-2">
            <z-list-item>
              <div class="flex space-x-0.5">
                <z-checkbox
                  v-model="selectAll"
                  :true-value="true"
                  :false-value="false"
                  spacing="4"
                  size="small"
                  @change="updateSelectAll"
                />
                <span class="text-vanilla-400 cursor" @click="selectAll = !selectAll">
                  Select all
                </span>
              </div>
            </z-list-item>
            <z-list-item v-for="file in searchResults" :key="file">
              <div class="flex space-x-0.5">
                <z-checkbox
                  :value="file"
                  v-model="file.isSelected"
                  :true-value="true"
                  :false-value="false"
                  spacing="4"
                  size="small"
                  :disabled="selectedFiles.length >= maxFilesAutofixRun"
                />
                <span class="text-vanilla-300 cursor" @click="file.isSelected = !file.isSelected">
                  {{ file.fileName }}
                </span>
              </div>
            </z-list-item>
            <div
              v-if="!searchResults.length"
              class="flex flex-col items-center justify-center w-full h-24 space-y-1"
            >
              <h2 class="font-bold text-md">No matching files found</h2>
              <p class="text-md">Try changing the search query.</p>
            </div>
          </z-list>
        </div>
      </div>
      <template #footer="{ close }">
        <div
          class="p-2 space-x-1 leading-none text-right border-t text-vanilla-100 border-slate-400"
        >
          <button
            @click="close()"
            class="inline-flex items-center justify-center h-8 px-4 py-1 space-x-1 text-xs font-medium leading-loose transition-colors duration-300 ease-in-out rounded-sm bg-ink-200 focus:outline-none whitespace-nowrap text-vanilla-100 hover:bg-ink-100"
          >
            <span> Cancel </span>
          </button>
          <z-button
            :disabled="selectedFiles.length < 1 || autofixLoading"
            :is-loading="autofixLoading"
            loading-label="Creating Autofix"
            class="flex items-center space-x-2 modal-primary-action"
            spacing="px-2"
            button-type="primary"
            size="small"
            @click="autofixSelectedFiles(close)"
          >
            <span class="text-xs text-ink-300"
              >Run Autofix on {{ selectedFiles.length || 0 }}
              {{ selectedFiles.length === 1 ? 'file' : 'files' }}</span
            >
          </z-button>
        </div>
      </template>
    </z-modal>
  </portal>
</template>

<script lang="ts">
import { Component, Prop, Watch, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZModal, ZButton, ZCheckbox, ZList, ZListItem, ZInput } from '@deepsource/zeal'

// types
import { AutofixRunStatus, Maybe } from '~/types/types'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import AutofixRunMixin from '~/mixins/autofixRunMixin'
import IssueDetailMixin from '~/mixins/issueDetailMixin'
import RepoDetailMixin from '~/mixins/repoDetailMixin'

/**
 * Modal component that allows selecting files to create autofixes for a specified issue.
 */
@Component({
  name: 'AutofixFileChooser',
  components: {
    ZIcon,
    ZModal,
    ZButton,
    ZCheckbox,
    ZList,
    ZListItem,
    ZInput
  }
})
export default class AutofixFileChooser extends mixins(
  ActiveUserMixin,
  AutofixRunMixin,
  IssueDetailMixin,
  RepoDetailMixin
) {
  @Prop()
  isOpen!: boolean

  @Prop({ default: () => [] })
  raisedInFiles!: Array<string>

  @Prop({ required: false })
  repoParams: Maybe<{ name: string; provider: string; login: string }>

  @Prop()
  issueId!: string

  public searchCandidate = ''
  public selectedValue = ''
  public allFiles: { fileName: string; isSelected: boolean }[] = []
  public selectAll = true
  public maxFilesAutofixRun = 50
  public autofixLoading = false

  /**
   * Mounted lifecycle hook for the modal.
   *
   * @returns {void}
   */
  mounted(): void {
    this.selectAll = true
  }

  /**
   * Watcher for `raisedInFiles`. Updates list of `allFiles` with files passed via the `raisedInFiles` prop.
   *
   * @param {Array<string>} newRaisedInFiles - New value for `raisedInFiles` prop.
   * @returns {void}
   */
  @Watch('raisedInFiles', { immediate: true })
  updateFiles(newRaisedInFiles: Array<string>): void {
    this.allFiles = newRaisedInFiles.map((file) => {
      return {
        fileName: file,
        isSelected: this.selectAll
      }
    })
  }

  get searchResults(): { fileName: string; isSelected: boolean }[] {
    if (this.searchCandidate) {
      return this.allFiles.filter((file) => {
        return file.fileName.toLowerCase().includes(this.searchCandidate.toLowerCase())
      })
    }

    return this.allFiles
  }

  get selectedFiles(): string[] {
    return this.allFiles.filter((file) => file.isSelected).map((file) => file.fileName)
  }

  /**
   * Watcher for `selectAll` data property. Selects all files (w/ searched filter if available).
   *
   * @returns {void}
   */
  @Watch('selectAll')
  public updateSelectAll(): void {
    const searchedFiles = this.searchResults.map((file) => file.fileName)
    this.allFiles.forEach((file) => {
      if (searchedFiles.includes(file.fileName)) {
        file.isSelected = this.selectAll
      }
    })
  }

  /**
   * Emits the `close` event.
   *
   * @returns {void}
   */
  public close(): void {
    this.$emit('close')
  }

  /**
   * Creates autofixes for selected files and redirects user to the created autofix run.
   *
   * @param {() => void} close - Function to close the selector modal on success.
   * @returns {Promise<void>}
   */
  public async autofixSelectedFiles(close: () => void): Promise<void> {
    this.autofixLoading = true
    try {
      const response = await this.createAutofixRun({
        inputFiles: this.selectedFiles,
        repoIssueId: this.issueId
      })

      // Refetch Autofix list
      this.fetchAutofixRunList({
        ...this.baseRouteParams,
        limit: 10,
        statusIn: [
          AutofixRunStatus.Pass,
          AutofixRunStatus.Timo,
          AutofixRunStatus.Cncl,
          AutofixRunStatus.Fail,
          AutofixRunStatus.Stal
        ],
        refetch: true
      })

      this.fetchPendingAutofixRuns({
        ...this.baseRouteParams,
        refetch: true
      })

      this.fetchAutofixTrends({
        ...this.baseRouteParams,
        lastDays: this.lastDays
      })

      if (this.$route.name?.startsWith('provider-owner-repo')) {
        this.$router.push(this.$generateRoute(['autofix', response.runId as string]))
      } else if (this.repoParams) {
        const { provider, login, name } = this.repoParams
        this.$router.push(
          ['', provider, login, name, 'autofix', response.runId as string].join('/')
        )
      }

      if (close) {
        close()
      } else {
        this.close()
      }
    } catch (e) {
      const err = e as Error
      if (err.message.includes('Your autofix run quota has been exhausted')) {
        this.$emit('run-quota-exhausted')
      } else {
        this.$toast.danger(err.message.replace('GraphQL error: ', ''))
        this.logErrorForUser(err, 'AutofixError', {
          method: 'Create Autofix Run',
          inputFiles: this.selectedFiles,
          repoIssueId: this.issueId
        })
      }
    } finally {
      this.autofixLoading = false
    }
  }
}
</script>
