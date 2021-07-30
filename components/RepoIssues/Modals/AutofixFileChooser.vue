<template>
  <portal to="modal">
    <z-modal v-if="isOpen" @onClose="close" title="Choose files you want to run Autofix on">
      <div class="flex space-x-2 p-4 text-vanilla-400">
        <div
          class="text-vanilla-400 custom-y-scroll min-h-40 max-h-102 text-sm leading-7 w-full flex flex-col space-y-2"
        >
          <z-input
            v-model="searchCandidate"
            spacing="tight"
            backgroundColor="ink-400"
            placeholder="Search for files"
            class="py-1.5 leading-6 px-2"
          >
            <template slot="left">
              <z-icon icon="search" size="small" class="pl-2 w-6"></z-icon>
            </template>
          </z-input>
          <z-list class="flex flex-col space-y-2 px-1">
            <z-list-item>
              <div class="flex space-x-0.5">
                <z-checkbox
                  :value="true"
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
              class="h-24 w-full flex flex-col space-y-1 justify-center items-center"
            >
              <h2 class="text-md font-bold">No matching files found</h2>
              <p class="text-md">Try changing the search query.</p>
            </div>
          </z-list>
        </div>
      </div>
      <template>
        <div class="p-2 space-x-1 text-right text-vanilla-100 border-t border-ink-200 leading-none">
          <button
            @click="close()"
            class="bg-ink-200 inline-flex items-center justify-center font-medium transition-colors duration-300 ease-in-out rounded-sm focus:outline-none whitespace-nowrap h-8 px-4 py-1 text-xs space-x-1 leading-loose text-vanilla-100 hover:bg-ink-100"
          >
            <span> Cancel </span>
          </button>
          <z-button
            :disabled="selectedFiles.length < 1"
            class="modal-primary-action flex space-x-2 items-center"
            spacing="px-2"
            buttonType="primary"
            size="small"
            @click="autofixSelectedFiles(close)"
          >
            <span class="text-xs text-ink-300"
              >Run Autofix on {{ selectedFiles.length || 0 }} files</span
            >
          </z-button>
        </div>
      </template>
    </z-modal>
  </portal>
</template>

<script lang="ts">
import { Component, Prop, Watch, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZModal, ZButton, ZCheckbox, ZList, ZListItem, ZInput } from '@deepsourcelabs/zeal'

// types
import { Maybe } from '~/types/types'
import IssueDetailMixin from '~/mixins/issueDetailMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'

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
export default class AutofixFileChooser extends mixins(IssueDetailMixin, ActiveUserMixin) {
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

  mounted() {
    this.selectAll = true
    this.updateFiles()
  }

  @Watch('raisedInFiles')
  updateFiles() {
    this.allFiles = this.raisedInFiles.map((file) => {
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

  @Watch('selectAll')
  public updateSelectAll(): void {
    const searchedFiles = this.searchResults.map((file) => file.fileName)
    this.allFiles.forEach((file) => {
      if (searchedFiles.includes(file.fileName)) {
        file.isSelected = this.selectAll
      }
    })
  }

  public close(): void {
    this.$emit('close')
  }

  public async autofixSelectedFiles(close: () => void): Promise<void> {
    try {
      const response = await this.createAutofixRun({
        inputFiles: this.selectedFiles,
        repoIssueId: this.issueId
      })

      if (close) {
        close()
      } else {
        this.close()
      }

      if (this.$route.name?.startsWith('provider-owner-repo')) {
        this.$router.push(this.$generateRoute(['autofix', response.runId as string]))
      } else if (this.repoParams) {
        const { provider, login, name } = this.repoParams
        this.$router.push(
          ['', provider, login, name, 'autofix', response.runId as string].join('/')
        )
      }
    } catch (e) {
      this.$toast.danger('There was a problem running Autofix')
      this.logSentryErrorForUser(e, 'AutofixError', {
        method: 'Create Autofix Run',
        inputFiles: this.selectedFiles,
        repoIssueId: this.issueId
      })
    }
  }
}
</script>
