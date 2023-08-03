<template>
  <portal to="modal">
    <z-modal v-if="isOpen" title="Choose files you want to run Autofix on" @onClose="close">
      <div class="flex space-x-2 p-4 text-vanilla-400">
        <div
          class="custom-y-scroll flex max-h-102 min-h-40 w-full flex-col space-y-2 text-sm leading-7 text-vanilla-400"
        >
          <z-input
            v-model="searchCandidate"
            spacing="tight"
            background-color="ink-400"
            placeholder="Search for files"
            class="px-2 py-1.5 leading-6"
          >
            <template #left>
              <z-icon icon="search" size="small" class="w-6 pl-2" />
            </template>
          </z-input>
          <z-list class="flex flex-col space-y-2 px-1">
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
                <span class="cursor text-vanilla-400" @click="selectAll = !selectAll">
                  Select all
                </span>
              </div>
            </z-list-item>
            <z-list-item v-for="file in searchResults" :key="file">
              <div class="flex space-x-0.5">
                <z-checkbox
                  v-model="file.isSelected"
                  :value="file"
                  :true-value="true"
                  :false-value="false"
                  spacing="4"
                  size="small"
                  :disabled="selectedFiles.length >= maxFilesAutofixRun"
                />
                <span class="cursor text-vanilla-300" @click="file.isSelected = !file.isSelected">
                  {{ file.fileName }}
                </span>
              </div>
            </z-list-item>
            <div
              v-if="!searchResults.length"
              class="flex h-24 w-full flex-col items-center justify-center space-y-1"
            >
              <h2 class="text-md font-bold">No matching files found</h2>
              <p class="text-md">Try changing the search query.</p>
            </div>
          </z-list>
        </div>
      </div>
      <template #footer="{ close }">
        <div
          class="space-x-1 border-t border-slate-400 p-2 text-right leading-none text-vanilla-100"
        >
          <button
            class="inline-flex h-8 items-center justify-center space-x-1 whitespace-nowrap rounded-sm bg-ink-200 px-4 py-1 text-xs font-medium leading-loose text-vanilla-100 transition-colors duration-300 ease-in-out hover:bg-ink-100 focus:outline-none"
            @click="close()"
          >
            <span> Cancel </span>
          </button>
          <z-button
            :disabled="selectedFiles.length < 1 || autofixLoading"
            :is-loading="autofixLoading"
            loading-label="Creating Autofix"
            class="modal-primary-action flex items-center space-x-2"
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
  name: 'AutofixFileChooser'
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
