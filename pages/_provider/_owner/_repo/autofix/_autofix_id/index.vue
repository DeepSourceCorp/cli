<template>
  <div class="relative top-0 flex flex-col w-full pb-6 space-y-5">
    <div class="px-4 py-3.5 min-h-13 border-b border-ink-200 flex flex-row items-center">
      <z-breadcrumb separator="/" class="text-sm text-vanilla-100">
        <z-breadcrumb-item class="text-vanilla-400">
          <nuxt-link :to="$generateRoute(['autofix'])">Autofix</nuxt-link>
        </z-breadcrumb-item>
        <z-breadcrumb-item>{{ title }}</z-breadcrumb-item>
      </z-breadcrumb>
    </div>
    <!-- heading -->
    <div class="flex flex-col px-4 space-y-2">
      <div
        class="items-center space-x-2 text-xs font-normal sm:flex lg:text-lg lg:leading-9 text-vanilla-400"
      >
        <span class="text-base font-medium text-vanilla-100" v-html="safeRenderBackticks(title)" />
        <span class="inline md:flex" v-if="autofixRun.issue">{{ autofixRun.issue.shortcode }}</span>
      </div>
      <div class="flex space-x-6">
        <issue-type v-if="autofixRun.issue" :issueType="autofixRun.issue.issueType"></issue-type>
        <!-- Created -->
        <info icon="clock" :title="formatDuration"></info>
        <!-- Analyzer -->
        <info
          v-if="autofixRun.analyzer && autofixRun.analyzer.name"
          :icon="autofixRun.analyzer.name.toLowerCase()"
          :title="autofixRun.analyzer.name"
        ></info>
      </div>
    </div>
    <!-- banner -->
    <div
      v-if="isAutofixConcluded"
      class="flex items-center px-4 py-3 space-x-4 border-t border-b bg-ink-300 border-ink-200"
    >
      <div class="flex items-center flex-1 space-x-6">
        <div class="flex items-center space-x-2">
          <z-icon icon="autofix" size="small" color="vanilla-400"></z-icon>
          <span class="text-sm uppercase text-vanilla-400">Autofix Session</span>
        </div>
        <!-- issues being fixed -->
        <info v-if="autofixRun.isGeneratedFromPr">
          <z-icon icon="flag" size="small" color="vanilla-400"></z-icon>
          <span class="text-sm">
            <span class="text-semibold">
              {{ autofixRun.issuesAffected }}
              {{ autofixRun.issuesAffected > 1 ? 'issues' : 'issue' }}
            </span>
            <span v-if="!isReadOnly">can be</span>
            <span>fixed</span>
          </span>
        </info>
        <!-- Total occurrences fixed -->
        <info v-if="autofixRun.resolvedIssuesCount">
          <z-icon icon="target" size="small" color="vanilla-400"></z-icon>
          <span class="text-sm">
            <span class="text-semibold">
              {{ autofixRun.resolvedIssuesCount }}
              {{ autofixRun.resolvedIssuesCount > 1 ? 'occurrences' : 'occurrence' }}
            </span>
            <span v-if="!isReadOnly">can be</span>
            <span>fixed</span>
          </span>
        </info>
        <!-- Total files being affected -->
        <info v-if="filesAffected.length">
          <z-icon icon="file-text" size="small" color="vanilla-400"></z-icon>
          <span class="text-sm">
            <span class="text-semibold">
              {{ filesAffected.length }}
              {{ filesAffected.length > 1 ? 'files' : 'file' }}
            </span>
            <span v-if="!isReadOnly">will be</span>
            <span>affected</span>
          </span>
        </info>
      </div>
      <div v-if="!isReadOnly">
        <z-button
          v-if="repository.isAutofixEnabled"
          buttonType="primary"
          size="small"
          :disabled="
            selectedHunkIds.length === 0 || shouldDisableActionButtons || triggeringAutofix
          "
          @click="triggerRun()"
        >
          <div class="flex items-center px-4 py-2 space-x-2">
            <template v-if="triggeringAutofix">
              <z-icon icon="spin-loader" size="small" color="ink-300" class="animate-spin"></z-icon>
              <span class="text-xs text-ink-300">Creating Autofix</span>
            </template>
            <template v-else-if="autofixRun.isGeneratedFromPr">
              <z-icon icon="git-pull-request" size="small" color="ink-300"></z-icon>
              <span class="text-xs text-ink-300">{{ pullRequestStatusText.COMMIT }}</span>
            </template>
            <template v-else>
              <z-icon icon="git-pull-request" size="small" color="ink-300"></z-icon>
              <span class="text-xs text-ink-300">{{ pullRequestStatusText.CREATE }}</span>
            </template>
          </div>
        </z-button>
        <z-button
          v-else-if="canEnableAutofix"
          size="small"
          icon="autofix"
          @click="showInstallModal = true"
        >
          Install Autofix
        </z-button>
      </div>
      <div v-else>
        <template v-if="autofixRun.isGeneratedFromPr">
          <z-button
            v-if="autofixRun.committedToBranchStatus === COMMIT_STATUS.IN_PROGRESS"
            buttonType="primary"
            size="small"
            :disabled="true"
            class="cursor-wait"
          >
            <z-icon class="animate-spin" icon="spin-loader" color="ink-300"></z-icon>
            <span>{{ pullRequestStatusText.COMMITTING }}</span>
          </z-button>
          <z-button
            v-if="autofixRun.committedToBranchStatus === COMMIT_STATUS.COMMITTED"
            buttonType="primary"
            size="small"
            target="_blank"
            rel="noopener noreferrer"
            :to="autofixRun.vcsPrUrl"
          >
            <z-icon icon="external-link" color="ink-300"></z-icon>
            <span>{{ pullRequestStatusText.VIEW }}</span>
          </z-button>
        </template>
        <template v-else>
          <z-button
            buttonType="primary"
            size="small"
            class="cursor-wait"
            v-if="autofixRun.pullRequestStatus === PULL_REQUEST_STATUS.IN_PROGRESS"
          >
            <z-icon class="animate-spin" icon="spin-loader" color="ink-300"></z-icon>
            <span>{{ pullRequestStatusText.CREATING }}</span>
          </z-button>
          <z-button
            v-if="
              autofixRun.pullRequestStatus === PULL_REQUEST_STATUS.OPENED ||
              autofixRun.pullRequestStatus === PULL_REQUEST_STATUS.MERGED
            "
            buttonType="primary"
            size="small"
            target="_blank"
            rel="noopener noreferrer"
            :to="autofixRun.vcsPrUrl"
          >
            <z-icon icon="external-link" color="ink-300"></z-icon>
            <span>{{ pullRequestStatusText.VIEW }}</span>
          </z-button>
          <z-button
            buttonType="primary"
            size="small"
            target="_blank"
            :to="autofixRun.vcsPrUrl"
            rel="noopener noreferrer"
            v-if="autofixRun.pullRequestStatus === PULL_REQUEST_STATUS.CREATED"
          >
            <z-icon icon="git-pull-request" color="ink-300"></z-icon>
            <span>{{ pullRequestStatusText.CLOSED }}</span>
          </z-button>
        </template>
      </div>
    </div>
    <section v-if="isAutofixConcluded && autofixHasErrors" class="px-4 space-y-4">
      <alert-box
        v-if="autofixRun.status === AUTOFIX_STATUS.STALE"
        text-color="text-honey-300"
        bg-color="bg-honey"
      >
        <div class="flex items-start space-x-4">
          <p>
            New changes were pushed since this Autofix was created which has invalidated these
            changes. Please check the results from the latest analysis run to see if this issue
            still exists and re-run Autofix.
          </p>
          <z-button
            :to="autofixRun.staleRedirectUrl"
            button-type="custom"
            class="bg-honey-500"
            size="small"
            color="ink-400"
          >
            View latest analysis
          </z-button>
        </div>
      </alert-box>

      <alert-box
        v-if="autofixRun.committedToBranchStatus === COMMIT_STATUS.FAILED"
        text-color="text-honey-300"
        bg-color="bg-honey"
      >
        Something went wrong when trying to commit your changes. Please try running this again in a
        few minutes. We're terribly sorry about this.
      </alert-box>

      <alert-box
        v-if="autofixRun.pullRequestStatus === PULL_REQUEST_STATUS.FAILED"
        text-color="text-honey-300"
        bg-color="bg-honey"
      >
        Something went wrong when trying to create the pull-request. Please try running this again
        in a few minutes. We're terribly sorry about this.
      </alert-box>
    </section>
    <div class="px-4" v-if="!$fetchState.pending && autofixRun.errorsRendered.length">
      <run-error-box :errors-rendered="autofixRun.errorsRendered" />
    </div>
    <template v-if="isAutofixConcluded">
      <!-- TODO: flash message shown for autofix status - stale, commit status - failed, Pull request status - failed  -->
      <!-- Code snippets -->
      <div class="relative px-4 gap-y-3">
        <!-- Group Head -->
        <div
          v-if="isGroup"
          class="inline-flex items-center px-2 py-2 space-x-2 rounded-sm group-head bg-ink-300"
        >
          <z-checkbox
            v-if="!isReadOnly"
            v-model="selectedFiles"
            class="h-full"
            :true-value="false"
            :false-value="true"
            spacing="4"
            fontSize="base"
            @change="selectFile(key)"
          />
          <z-icon icon="bug-risk" size="small" color="vanilla-400"></z-icon>
          <span class="text-sm font-bold">Missing argument in function call</span>
          <span class="text-sm text-vanilla-400">PYL-43WQ</span>
        </div>
        <div
          :class="{
            'ml-12': isGroup
          }"
        >
          <autofix-code-diff
            :changeSet="autofixRun.changeset"
            :isGeneratedFromPr="autofixRun.isGeneratedFromPr"
            :isGroup="isGroup"
            :selectedFiles="selectedFiles"
            :isReadOnly="isReadOnly"
            :selectedHunkIds="selectedHunkIds"
            @selectFile="selectFile"
            @selectFileIfAllHunksSelected="selectFileIfAllHunksSelected"
          ></autofix-code-diff>
        </div>
        <div
          v-if="isGroup"
          class="absolute top-6 left-6 w-0.5 bg-juniper"
          :style="{ height: height, zIndex: -1 }"
        ></div>
      </div>
    </template>
    <div v-else class="p-4 mb-4">
      <base-state v-if="autofixRun.status === AUTOFIX_STATUS.PENDING" title="Generating fixes">
        <template #hero>
          <z-icon
            icon="spin-loader"
            color="juniper"
            size="large"
            class="mx-auto mb-5 animate-spin"
          />
        </template>
        Please give us a moment while we generate a patch with fixes for this issue.
      </base-state>
      <base-state
        v-else-if="autofixRun.status === AUTOFIX_STATUS.TIMEOUT"
        title="Autofix timed out"
      >
        <template #hero>
          <z-icon icon="alert-circle" class="mx-auto mb-5" />
        </template>
        The generation of fixes took too long to complete, so we had to exit without any results.
        Please try again.
      </base-state>
      <base-state v-else-if="autofixRun.status === AUTOFIX_STATUS.CANCEL" title="Autofix cancelled">
        <template #hero>
          <z-icon icon="slash" class="mx-auto mb-5" />
        </template>
        The generation of fixes was stopped before completion either due to an external trigger or
        the repository state not being available any longer. Please try again.
      </base-state>
      <base-state v-else-if="autofixRun.status === AUTOFIX_STATUS.FAIL" title="Autofix failed">
        There were errors generating fixes for some files. Please try again.
      </base-state>
    </div>
    <install-autofix-modal v-if="showInstallModal" @close="showInstallModal = false" />
    <audio
      v-if="isChristmasSeason()"
      id="bell-sound"
      src="~/assets/audio/bell.mp3"
      hidden
      type="audio/mp3"
    ></audio>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Watch, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZButton, ZCheckbox, ZBreadcrumb, ZBreadcrumbItem, ZDivider } from '@deepsource/zeal'
import { AutofixCard, AutofixListItem, AutofixCodeDiff, Info } from '@/components/Autofix/index'

import { RunDetailActions } from '~/store/run/detail'
import { AutofixRunPullRequestStatus, CreatePullRequestInput } from '~/types/types'

import { AppFeatures, RepoPerms } from '~/types/permTypes'

import RoleAccessMixin from '~/mixins/roleAccessMixin'
import RepoDetailMixin from '~/mixins/repoDetailMixin'

import { fromNow } from '~/utils/date'
import { isChristmasSeason } from '~/utils/easter'
import { safeRenderBackticks } from '~/utils/string'
import AutofixRunMixin from '~/mixins/autofixRunMixin'

// store
const runStore = namespace('run/detail')

/**
 * Component for Autofix ID page
 */
@Component({
  components: {
    ZIcon,
    ZButton,
    ZCheckbox,
    ZBreadcrumb,
    ZBreadcrumbItem,
    ZDivider,
    Info,
    AutofixCard,
    AutofixListItem,
    AutofixCodeDiff
  },
  middleware: ['validateProvider', 'featureGate', 'perm'],
  meta: {
    auth: {
      strict: true,
      RepoPerms: [RepoPerms.READ_REPO]
    },
    gateFeature: AppFeatures.AUTOFIX
  },
  layout: 'repository',
  methods: {
    safeRenderBackticks,
    isChristmasSeason
  }
})
export default class Autofix extends mixins(RoleAccessMixin, RepoDetailMixin, AutofixRunMixin) {
  public height = '1px'
  public isGroup = false
  public isReadOnly = false
  public showInstallModal = false
  public triggeringAutofix = false

  public PULL_REQUEST_MAP: Record<string, string> = {
    PRO: 'Pull-request open',
    PRM: 'Pull-request merged',
    PRC: 'Pull-request closed'
  }

  public selectedFiles: Array<string> = []
  public selectedHunkIds: Array<number> = []
  public selectedFileIdMapping: Record<string, Array<number>> = {}

  @runStore.Action(RunDetailActions.CREATE_PR)
  createPR: (
    params: Record<string, Record<string, string[] | string>>
  ) => Promise<{ data: { input: CreatePullRequestInput } }>

  @runStore.Action(RunDetailActions.COMMIT_TO_PR)
  commitFixToPR: (
    params: Record<string, Record<string, string[] | string>>
  ) => Promise<{ data: { input: CreatePullRequestInput } }>

  /**
   * Mounted hook for Vue component
   *
   * @returns {void}
   */
  mounted(): void {
    this.$root.$on('refetch-autofix-run', this.fetchAutofixRun)
    this.$socket.$on('pull-request-created', this.showSuccess)
    this.$socket.$on('committed-to-branch', this.showSuccess)
    this.$socket.$on('repo-autofix-created', this.fetchAutofixRun)
    this.$socket.$on('autofixrun-fixes-ready', this.fetchAutofixRun)
    this.$socket.$on('autofix-installation-complete', this.fetchAutofixRun)
  }

  /**
   * Show Autofix status toast
   *
   * @returns {Promise<void>}
   */
  async showSuccess(): Promise<void> {
    await this.fetchAutofixRun()
    if (this.autofixRun.pullRequestStatus === AutofixRunPullRequestStatus.Prf) {
      this.$toast.danger('Autofix failed')
    } else {
      // skipcq: JS-D009
      if (this.autofixRun.isGeneratedFromPr) {
        this.$toast.success(this.pullRequestStatusText.SUCCESS_COMMIT)
      } else {
        this.$toast.success(this.pullRequestStatusText.SUCCESS_PR)
      }

      // Play bell sound
      if (isChristmasSeason()) {
        this.playAudio()
      }
    }
  }

  /**
   * Fetch Autofix run details
   *
   * @returns {Promise<void>}
   */
  async fetchAutofixRun(): Promise<void> {
    await this.fetchRepoPerms(this.baseRouteParams)
    await this.fetchAutofixRunDetails({
      runId: this.$route.params.autofix_id,
      refetch: true
    })
  }

  /**
   * BeforeDestroy hook for Vue component
   *
   * @returns {void}
   */
  beforeDestroy(): void {
    this.$root.$off('refetch-autofix-run', this.fetchAutofixRun)
    this.$socket.$off('pull-request-created', this.showSuccess)
    this.$socket.$off('committed-to-branch', this.showSuccess)
    this.$socket.$off('repo-autofix-created', this.fetchAutofixRun)
    this.$socket.$off('autofixrun-fixes-ready', this.fetchAutofixRun)
    this.$socket.$off('autofix-installation-complete', this.fetchAutofixRun)
  }

  /**
   * Update selected files based on autofixRun
   *
   * @returns {void}
   */
  @Watch('autofixRun')
  public updateSelectedFiles(): void {
    this.selectedHunkIds = []
    this.selectedFiles = []
    const changeset = { ...this.autofixRun.changeset }
    if (changeset) {
      for (const key in changeset) {
        if (Object.prototype.hasOwnProperty.call(changeset, key)) {
          this.selectedFiles.push(key)
          this.selectedFileIdMapping[key] = []
          changeset[key].patches.forEach((patch: Record<string, string | number>) => {
            this.selectedHunkIds.push(patch.id as number)
            this.selectedFileIdMapping[key].push(patch.id as number)
          })
        }
      }
      // If PR status is not 'PNC', then only enable ready only mode
      if (
        this.autofixRun.pullRequestStatus !== this.PULL_REQUEST_STATUS.NOT_CREATED ||
        this.autofixRun.committedToBranchStatus !== this.COMMIT_STATUS.NOT_COMMITTED
      ) {
        this.isReadOnly = true
      }
    }
  }

  /**
   * Fetch hook
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    await this.fetchRepoPerms(this.baseRouteParams)
    await this.fetchAutofixRunDetails({
      runId: this.$route.params.autofix_id,
      refetch: false
    })
    this.updateSelectedFiles()
  }

  /**
   * Play the bell sound (Easter egg for Christmas)
   *
   * @returns {void}
   */
  playAudio() {
    const audio = document.getElementById('bell-sound') as HTMLAudioElement
    audio?.play()
  }

  get title(): string | undefined {
    return this.autofixRun.pullRequestTitle || this.autofixRun?.issue?.title
  }

  get formatDuration(): string {
    return `Created ${fromNow(this.autofixRun.createdAt)}`
  }

  get affectedFilesCount(): number {
    return this.autofixRun.changeset ? Object.keys(this.autofixRun.changeset).length : 0
  }

  get filesAffected(): Array<string> {
    const files: Array<string> = []
    this.selectedHunkIds.forEach((id) => {
      for (const filePath in this.autofixRun.changeset) {
        if (Object.prototype.hasOwnProperty.call(this.autofixRun.changeset, filePath)) {
          this.autofixRun.changeset[filePath].patches.forEach(
            (patch: Record<string, string | number>) => {
              if ((patch.id as number) === id && !files.includes(filePath)) {
                files.push(filePath)
              }
            }
          )
        }
      }
    })
    return files
  }

  get isAutofixConcluded(): boolean {
    return (
      this.autofixRun.status === this.AUTOFIX_STATUS.SUCCESS ||
      this.autofixRun.status === this.AUTOFIX_STATUS.STALE
    )
  }

  get autofixHasErrors(): boolean {
    return (
      this.autofixRun.status === this.AUTOFIX_STATUS.STALE ||
      this.autofixRun.committedToBranchStatus === this.COMMIT_STATUS.FAILED ||
      this.autofixRun.pullRequestStatus === this.PULL_REQUEST_STATUS.FAILED
    )
  }

  get shouldDisableActionButtons(): boolean {
    return (
      this.autofixRun.status === this.AUTOFIX_STATUS.STALE ||
      this.autofixRun.committedToBranchStatus === this.COMMIT_STATUS.FAILED ||
      this.autofixRun.pullRequestStatus === this.PULL_REQUEST_STATUS.FAILED
    )
  }

  get pullRequestStatusText(): Record<string, string> {
    switch (this.$route.params.provider) {
      case 'gl':
        /* GITLAB */
        return {
          COMMITTING: 'Committing to merge-request',
          COMMIT: 'Commit to merge-request',
          CREATE: 'Create merge-request',
          CREATING: 'Creating merge-request',
          VIEW: 'View merge-request',
          CLOSED: 'Merge-request closed',
          SUCCESS_COMMIT: 'Fix committed to the merge request successfully',
          SUCCESS_PR: 'Merge request created successfully'
        }

      default:
        return {
          COMMITTING: 'Committing to pull-request',
          COMMIT: 'Commit to pull-request',
          CREATE: 'Create pull-request',
          CREATING: 'Creating pull-request',
          VIEW: 'View pull-request',
          CLOSED: 'Pull-request closed',
          SUCCESS_COMMIT: 'Fix committed to the pull request successfully',
          SUCCESS_PR: 'Pull request created successfully'
        }
    }
  }

  /**
   * Select/Remove a file, and select or remove hunks from that file, accordingly
   *
   * @param {string} file
   * @returns {void}
   */
  public selectFile(file: string): void {
    // If the file is already selected, deselect the file and its respective hunks
    if (this.selectedFiles.includes(file)) {
      this.removeHunksFromFile(file)
    } else {
      // If the file is not selected, select the file and its respective hunks
      this.selectHunksFromFile(file)
    }
  }

  /**
   * Add hunk ids from the autofix run object to the fileIdMapping and the selectedHunkID list
   *
   * @param {string} file
   * @returns {void}
   */
  public selectHunksFromFile(file: string): void {
    this.selectedFiles.push(file)
    this.autofixRun.changeset[file].patches.forEach((change: Record<string, string | number>) => {
      if (!this.selectedHunkIds.includes(change.id as number)) {
        this.selectedHunkIds.push(change.id as number) // Add hunk id to selectedHunkIds
        if (this.isFileMappingEmpty(file)) {
          this.selectedFileIdMapping[file] = []
        }
        this.selectedFileIdMapping[file].push(change.id as number)
      }
    })
  }

  public removeHunksFromFile(file: string): void {
    this.selectedHunkIds = this.selectedHunkIds.filter(
      (id) => !this.selectedFileIdMapping[file].includes(id)
    )
    this.selectedFiles = this.selectedFiles.filter((fileName: string) => fileName != file)
    delete this.selectedFileIdMapping[file]
  }

  public isFileMappingEmpty(file: string): boolean {
    return (
      !this.selectedFileIdMapping.hasOwnProperty(file) ||
      this.selectedFileIdMapping[file] === undefined ||
      this.selectedFileIdMapping[file] === null
    )
  }

  /**
   * Selects file if all the hunkIds of this file are selected.
   *
   * @param {string} file - file which contains the hunkId
   * @param {number} hunkId - id of a hunk
   */
  public selectFileIfAllHunksSelected(file: string, hunkId: number): void {
    // If the selected hunk id's file is not present, add it to the map along with the Id
    if (this.isFileMappingEmpty(file)) {
      this.selectedFileIdMapping[file] = []
      this.selectedFileIdMapping[file].push(hunkId)
      this.selectedFiles.push(file)
      this.selectedHunkIds.push(hunkId)
    } else {
      // If the file already present and the selected hunk id is present, deselect and remove the id from the map and hunkId list
      if (this.selectedFileIdMapping[file].includes(hunkId)) {
        this.selectedFileIdMapping[file] = this.selectedFileIdMapping[file].filter(
          (id: number) => id != hunkId
        )
        this.selectedHunkIds = this.selectedHunkIds.filter((id: number) => id != hunkId)
        if (this.selectedFileIdMapping[file].length === 0) {
          delete this.selectedFileIdMapping[file]
        }
        this.selectedFiles = this.selectedFiles.filter((fileName: string) => fileName != file)
      } else {
        // If the file already present and the selected hunk id is not present,
        // select and add the id from the map and hunkId list
        this.selectedFileIdMapping[file].push(hunkId)
        this.selectedHunkIds.push(hunkId)
      }
    }
  }

  /**
   * Trigger Autofix run
   *
   * @returns {Promise<void>}
   */
  async triggerRun(): Promise<void> {
    this.triggeringAutofix = true
    const hunkIds = this.selectedHunkIds.map((id) => String(id))
    try {
      // skipcq: JS-D009
      if (this.autofixRun.isGeneratedFromPr) {
        await this.commitFixToPullRequest(hunkIds)
      } else {
        await this.createPullRequest(hunkIds)
      }
    } catch (e) {
      this.$toast.danger('Something went wrong')
    } finally {
      this.triggeringAutofix = false
    }
  }

  /**
   * Execute createPullRequest GQL mutation
   *
   * @param {string[]} hunkIds
   * @returns {Promise<void>}
   */
  public async createPullRequest(hunkIds: string[]): Promise<void> {
    await this.createPR({
      input: {
        patches: hunkIds,
        repoId: this.repository.id,
        autofixRunId: this.autofixRun.runId
      }
    })
    await this.fetchAutofixRun()
  }

  /**
   * Execute commitFixToPullRequest GQL mutation
   *
   * @param {string[]} hunkIds
   * @returns {Promise<void>}
   */
  public async commitFixToPullRequest(hunkIds: string[]): Promise<void> {
    await this.commitFixToPR({
      input: {
        patches: hunkIds,
        autofixRunId: this.autofixRun.runId
      }
    })
    await this.fetchAutofixRun()
  }
}
</script>
