<template>
  <z-modal @onClose="$emit('close')">
    <template #title>
      <z-breadcrumb :key="showRepoSelection" class="text-base text-vanilla-100">
        <z-breadcrumb-item
          :class="showRepoSelection ? 'text-vanilla-400 cursor-pointer' : 'text-vanilla-100'"
        >
          <div role="button" @click="showRepoSelection = false">
            {{ editMode ? 'Edit report' : 'Share report' }}
          </div>
        </z-breadcrumb-item>
        <z-breadcrumb-item v-if="showRepoSelection" is-current
          >Select repositories</z-breadcrumb-item
        >
      </z-breadcrumb>
    </template>

    <fieldset v-show="!showRepoSelection" class="p-4 flex flex-col gap-y-7">
      <label for="report-title" class="space-y-2 text-sm text-vanilla-200 w-full">
        <p class="text-sm font-medium text-vanilla-100">Label</p>
        <z-input
          id="report-title"
          v-model="reportLabel"
          v-focus
          :required="true"
          :show-border="false"
          placeholder="What’s this report for?"
          size="small"
        />
        <p class="flex items-center gap-x-1 text-vanilla-400 text-xs">
          This is used for internal reference only
        </p>
      </label>

      <label v-if="reportIdOld" for="report-link" class="space-y-2 text-sm text-vanilla-200 w-full">
        <p class="text-sm font-medium text-vanilla-100">Shareable link</p>
        <z-input
          id="report-link"
          v-focus
          :value="reportUrl"
          :read-only="true"
          :show-border="false"
          placeholder="Shareable link for the report..."
        >
          <template #right>
            <copy-button
              v-tooltip="'Copy report shareable link'"
              :value="reportUrl"
              :icon-only="true"
            />
          </template>
        </z-input>
      </label>

      <div class="space-y-3">
        <toggle-input
          v-model="isRestricted"
          input-width="xx-small"
          label="Restrict report access"
          input-id="toggle-password-protection"
          :remove-y-padding="true"
          class="font-medium"
          @input="handlePasswordProtectedToggle"
        >
          <template #description>
            <p>
              {{
                isRestrictedOld && isRestricted
                  ? 'This report is password-protected'
                  : 'Password-protect this report'
              }}.
            </p>
            <z-button
              v-if="isRestrictedOld && isRestricted && !showPasswordInput"
              button-type="ghost"
              color="vanilla-100"
              size="x-small"
              icon-size="x-small"
              label="Reset password"
              icon="refresh-cw"
              class="gap-x-1 mt-1 bg-ink-200 opacity-80 hover:opacity-100"
              @click="handleResetPassword"
            />
          </template>
        </toggle-input>
        <label
          v-if="showPasswordInput"
          for="password"
          class="block text-sm font-medium text-vanilla-400"
        >
          <span class="mb-2 sr-only">Password</span>
          <div class="relative">
            <z-input
              id="password"
              v-model="password"
              :type="isPasswordHidden ? 'password' : 'text'"
              :required="isRestricted"
              :disabled="!isRestricted"
              :show-border="false"
              placeholder="A randomly generated password with at least 16 characters"
            />
            <div class="absolute flex top-1 right-1 gap-x-1 bg-ink-400">
              <z-button
                v-tooltip="isPasswordHidden ? 'Reveal password' : 'Hide password'"
                button-type="secondary"
                :icon="isPasswordHidden ? 'eye' : 'eye-off'"
                size="small"
                :disabled="!password"
                @click="togglePasswordVisibility"
              />
              <z-button
                v-tooltip="'Generate new password'"
                button-type="secondary"
                icon="refresh-cw"
                size="small"
                @click="generatePassword"
              />
              <copy-button
                v-tooltip="'Copy password'"
                :icon-only="true"
                :disabled="!password"
                :value="password"
              />
            </div>
          </div>
        </label>
      </div>

      <div class="grid grid-cols-2">
        <div class="flex flex-col gap-y-2">
          <p class="text-xs uppercase text-vanilla-400 font-medium tracking-wider">Security</p>
          <template v-for="(report, key) in ReportMeta">
            <z-checkbox
              v-if="report.type === ReportType.Compliance"
              :key="key"
              v-model="reportKeys"
              :value="key"
              :label="report.title"
              size="small"
              class="cursor-pointer"
            />
          </template>
        </div>
        <div class="flex flex-col gap-y-2">
          <p class="text-xs uppercase text-vanilla-400 font-medium tracking-wider">Insights</p>
          <template v-for="(report, key) in ReportMeta">
            <z-checkbox
              v-if="report.type === ReportType.Insight"
              :key="key"
              v-model="reportKeys"
              :value="key"
              :label="report.title"
              size="small"
              class="cursor-pointer"
            />
          </template>
        </div>
      </div>

      <toggle-input
        v-model="shareHistoricalData"
        input-width="xx-small"
        label="Share historical data"
        input-id="toggle-share-historical-data"
        :remove-y-padding="true"
        class="font-medium"
      >
        <template #description> Include data from past months in the report. </template>
      </toggle-input>

      <label for="source-repos" class="space-y-2 text-sm">
        <p class="font-medium text-vanilla-100">Select repositories</p>
        <z-radio-group id="source-repos" v-model="reportSource" class="grid grid-cols-2">
          <z-radio :value="ReportSource.SourceAll" label="All repositories" />
          <z-radio :value="ReportSource.SourceSelected" label="Custom" />
        </z-radio-group>
      </label>
    </fieldset>

    <select-repositories-for-report
      v-show="showRepoSelection"
      :report-id="reportIdOld"
      :owner-login="ownerLogin"
      :vcs-provider="vcsProvider"
      :edit-mode="editMode"
      @remove-repo="handleRepoRemoval"
      @add-repo="handleRepoAddition"
    />

    <template #footer="{ close }">
      <div
        class="p-4 text-right text-vanilla-100 border-slate-400"
        :class="{ 'border-t border-slate-400': showRepoSelection }"
      >
        <span
          v-if="showRepoSelection && sourceRepoCount"
          class="float-left text-xs leading-5 font-medium mt-1.5"
        >
          {{ sourceRepoCount }} selected
        </span>
        <z-button
          v-if="showRepoSelection"
          label="Go back"
          button-type="ghost"
          color="vanilla-100"
          size="small"
          icon="arrow-left"
          class="mr-px bg-ink-200 opacity-80 hover:opacity-100"
          @click="showRepoSelection = false"
        />

        <z-button
          v-if="showCreateButton"
          icon="check"
          button-type="primary"
          size="small"
          :label="editMode ? 'Update report' : 'Create report'"
          :is-loading="saveLoading"
          :disabled="saveLoading"
          class="modal-primary-action"
          @click="handleSave(close)"
        />
        <z-button
          v-else
          icon="repositories"
          button-type="primary"
          size="small"
          label="Select repositories"
          @click="showRepoSelection = true"
        />
      </div>
    </template>
  </z-modal>
</template>
<script lang="ts">
import { Component, Watch, Prop, Vue } from 'nuxt-property-decorator'
import Shifty from '@deepsource/shifty'
import {
  ZModal,
  ZInput,
  ZButton,
  ZCheckbox,
  ZRadioGroup,
  ZRadio,
  ZBreadcrumb,
  ZBreadcrumbItem
} from '@deepsource/zeal'
import { ReportPageT, ReportMeta } from '~/types/reportTypes'
import {
  CreatePublicReportInput,
  ReportLevel,
  ReportSource,
  ReportType,
  UpdatePublicReportInput,
  UpdateAction,
  UpdatePublicReportSourcedRepositoriesInput
} from '~/types/types'

/**
 * ? Why create and update in same modal
 *
 * On an individual report page, we have a share button. On clicking it, this modal opens with
 * the reportKeys prefilled, which is done through reprtoKeys being prop controlled.
 * Since we'll anyways need to support prop controlled reportKeys, we added support for
 * all data properties to be prop controlled. Hence this modal works for both, report creation and updation.
 */

/**
 * Create Public Report modal
 */
@Component({
  components: {
    ZModal,
    ZInput,
    ZButton,
    ZCheckbox,
    ZRadioGroup,
    ZRadio,
    ZBreadcrumb,
    ZBreadcrumbItem
  }
})
export default class MutateOwnerReportModal extends Vue {
  // Need level as prop because CreatePublicReportInput has level as required type
  @Prop({ required: true })
  level: ReportLevel

  @Prop({ required: true })
  editMode: boolean

  @Prop({ required: true })
  ownerLogin: string

  @Prop({ required: true })
  vcsProvider: string

  @Prop({ default: '' })
  reportIdOld: string

  @Prop({ default: false })
  isRestrictedOld: boolean

  @Prop({ default: () => [] })
  reportKeysOld: Array<ReportPageT>

  @Prop({ default: false })
  shareHistoricalDataOld: boolean

  @Prop({ default: '' })
  reportLabelOld: string

  @Prop({ default: ReportSource.SourceAll })
  reportSourceOld: ReportSource

  @Prop({ default: 0 })
  sourceRepoCountOld: number

  @Prop({ default: false })
  saveLoading: boolean

  isRestricted = false
  password = ''
  reportKeys: Array<ReportPageT> = []
  shareHistoricalData: boolean = false
  reportLabel = ''
  reportSource: ReportSource = ReportSource.SourceAll

  sourceRepoCount = 0
  repoListToAdd: Array<string> = []
  repoListToRemove: Array<string> = []

  isPasswordHidden = false
  showPasswordInput = false
  showRepoSelection = false

  engine: Shifty
  ReportMeta = ReportMeta
  ReportType = ReportType
  ReportSource = ReportSource

  /**
   * Mounted hook to generate password
   */
  mounted() {
    this.reportKeys = this.reportKeysOld
    this.shareHistoricalData = this.shareHistoricalDataOld
    this.reportLabel = this.reportLabelOld
    this.isRestricted = this.isRestrictedOld
    this.reportSource = this.reportSourceOld

    if (this.reportSourceOld !== ReportSource.SourceAll) {
      this.sourceRepoCount = this.sourceRepoCountOld
    }
  }

  get reportUrl(): string {
    return `https://${this.$config.domain}/report/${this.reportIdOld}`
  }

  get showCreateButton(): boolean {
    return this.reportSource === ReportSource.SourceAll ? true : this.showRepoSelection
  }

  /**
   * Method to handle password-protected toggle updation and, based on value received from it,
   * control visibility of password input field .
   *
   * @param passworProtected boolean
   *
   * @return void
   */
  handlePasswordProtectedToggle(passworProtected: boolean) {
    /**
     * We receive new value of password-protected toggle as argument.
     * If this new value is true, that means we need to show the password input field,
     * for which we need to also generate a new password.
     *
     * However, we want to show the password input field only if the report was not
     * password-protected already, because in that case we wan't to show the password
     * reset button.
     */
    if (passworProtected) {
      this.generatePassword()
      if (!this.isRestrictedOld) {
        this.showPasswordInput = true
      }
    } else {
      this.password = ''
      this.showPasswordInput = false
    }
  }

  /**
   * Click handler method for password reset button.
   * Generates new password and makes password input field visible.
   *
   * @return void
   */
  handleResetPassword() {
    this.generatePassword()
    this.showPasswordInput = true
  }

  /**
   * handle repo selection event
   *
   * @param {Array<string>} addedRepos
   * @returns void
   */
  handleRepoAddition(addedRepos: Array<string>): void {
    this.sourceRepoCount += 1

    // Only add unique repo IDs
    this.repoListToAdd = Array.from(new Set([...this.repoListToAdd, ...addedRepos]))

    // If a repo is  deselected and reselected again, it'll be present in repoListToRemove
    // Hence, we need to remove it from repoListToRemove since it's selected again.
    this.repoListToRemove = this.repoListToRemove.filter((repoId) => !addedRepos.includes(repoId))
  }

  /**
   * handle repo unselection event
   *
   * @param {Array<string>} removedRepos
   * @returns void
   */
  handleRepoRemoval(removedRepos: Array<string>): void {
    this.sourceRepoCount -= 1

    // Only add unique repo IDs
    this.repoListToRemove = Array.from(new Set([...this.repoListToRemove, ...removedRepos]))

    // If a repo is  selected and then deselected again, it'll be present in repoListToAdd
    // Hence, we need to remove it from repoListToAdd since it's deselected agaion.
    this.repoListToAdd = this.repoListToAdd.filter((repoId) => !removedRepos.includes(repoId))
  }

  /**
   * Click handler button for save report button.
   *
   * @param close {() => void}
   *
   * @return void
   */
  handleSave(close?: () => void) {
    if (this.editMode) {
      this.emitEditReport(close)
    } else {
      this.emitCreateReport(close)
    }
  }

  /**
   * Method to build args for report creation and emit it.
   *
   * @oaram close {() => void}
   *
   * @return void
   */
  emitCreateReport(close?: () => void) {
    if (this.validateArgs()) {
      const newReportArgs: CreatePublicReportInput = {
        ownerLogin: this.ownerLogin,
        vcsProvider: this.$providerMetaMap[this.vcsProvider].value,
        label: this.reportLabel,
        level: this.level,
        isRestricted: this.isRestricted,
        password: this.password,
        shareHistoricalData: this.shareHistoricalData,
        reportKeys: this.reportKeys,
        source: this.reportSource,
        sourcedRepositories: this.repoListToAdd
      }

      if (Object.keys(newReportArgs).length) {
        this.$emit('create-report', newReportArgs, close)
      }
    }
  }

  /**
   * Callback function to close modal.
   *
   * @function {Close}
   * @returns {void}
   */

  /**
   * Method to build args for report updation and emit it.
   *
   * @param {Close} close
   *
   * @return void
   */
  emitEditReport(close?: () => void) {
    if (this.validateArgs()) {
      const updatedReportArgs: UpdatePublicReportInput = {
        reportId: this.reportIdOld,
        label: this.reportLabel,
        shareHistoricalData: this.shareHistoricalData,
        reportKeys: this.reportKeys,
        isRestricted: this.isRestricted
      }

      if (this.isRestricted && this.password.length) {
        updatedReportArgs['password'] = this.password
      }

      if (this.reportSourceOld !== this.reportSource) {
        updatedReportArgs['source'] = this.reportSource
      }

      const addRepoArgs: UpdatePublicReportSourcedRepositoriesInput = {
        reportId: this.reportIdOld,
        action: UpdateAction.Add,
        repositoryIds: this.reportSource === ReportSource.SourceSelected ? this.repoListToAdd : []
      }

      const removeRepoArgs: UpdatePublicReportSourcedRepositoriesInput = {
        reportId: this.reportIdOld,
        action: UpdateAction.Remove,
        repositoryIds:
          this.reportSource === ReportSource.SourceSelected ? this.repoListToRemove : []
      }

      // In case report source is being turnt to SourceSelected, sourcedRepositories field is required
      // Moreover, in such a case, the user would be choosing repos for the first time for the respective report,
      // so there are no reports to be removed per se.
      if (
        this.reportSourceOld === ReportSource.SourceAll &&
        this.reportSource === ReportSource.SourceSelected
      ) {
        updatedReportArgs['sourcedRepositories'] = this.repoListToAdd
        addRepoArgs['repositoryIds'] = []
      }

      if (Object.keys(updatedReportArgs).length) {
        this.$emit('edit-report', updatedReportArgs, addRepoArgs, removeRepoArgs, close)
      }
    }
  }

  /**
   * Generate password using shifty
   *
   * @return {void}
   */
  generatePassword(): void {
    if (!this.engine) this.engine = new Shifty(false, 16)

    this.password = this.engine.generate()
    if (this.isPasswordHidden) {
      this.isPasswordHidden = false
      setTimeout(() => {
        this.isPasswordHidden = true
      }, 1500)
    }
  }

  /**
   * Toggle password visibility
   *
   * @return {void}
   */
  togglePasswordVisibility(): void {
    this.isPasswordHidden = !this.isPasswordHidden
  }

  /**
   * Validate arguments for create/edit report mutation
   *
   * @return boolean
   */
  validateArgs(): boolean {
    // Check for password only if password input is shown
    if (this.showPasswordInput && !this.password) {
      this.$toast.danger("Please enter a password or disable 'Restrict report access'.")
      return false
    }

    if (!this.reportLabel) {
      this.$toast.danger('Please add a label for the report.')
      return false
    }

    if (this.reportKeys.length < 1) {
      this.$toast.danger('Please select at least one report to share.')
      return false
    }

    if (this.reportSource === ReportSource.SourceSelected && this.sourceRepoCount < 1) {
      this.$toast.danger('Please select at least one repository, or select all repositories.')
      return false
    }

    return true
  }

  /**
   * Close modal on route change
   *
   * @return {void}
   */
  @Watch('$route.path')
  closeModal(): void {
    this.$emit('close')
  }
}
</script>
