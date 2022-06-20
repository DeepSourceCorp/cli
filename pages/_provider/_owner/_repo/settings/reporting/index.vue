<template>
  <div class="flex flex-col max-w-2xl p-4 gap-y-2">
    <!-- title -->
    <h2 class="text-lg font-medium" :class="{ 'mb-4': !providerIsGitLab }">Reporting</h2>

    <!-- GitLab reporting mode -->
    <form-group v-if="providerIsGitLab">
      <radio-group-input
        v-model="reportingMode"
        :read-only="$fetchState.pending || updatingIntegrationModeSettings"
        :options="reportingModeOptions"
        label="Integration mode"
        input-id="team-settings-access-base-perms"
        input-width="wide"
        @change="updateRepositorySettings(InputTypes.INTEGRATION_MODE)"
      />
    </form-group>

    <!-- Reporting Configuration -->

    <div class="max-w-2xl">
      <div class="mb-4">
        <h6 class="mb-1 text-sm text-vanilla-100">Reporting configuration</h6>
        <p class="text-xs leading-5 text-vanilla-400">
          Control which category of issues are reported, and when analysis run is marked as failed.
        </p>
      </div>
      <z-table v-if="repoSettings.length" class="rounded-md text-vanilla-100">
        <template v-slot:head>
          <z-table-row>
            <z-table-cell
              v-for="head in headerData"
              :key="head.title"
              class="text-sm font-bold"
              :class="head.align"
              >{{ head.title }}</z-table-cell
            >
          </z-table-row>
        </template>
        <template v-slot:body>
          <template v-if="$fetchState.pending">
            <div
              v-for="index in 8"
              :key="index"
              class="p-5 border-b opacity-50 bg-ink-300 animate-pulse border-ink-200"
            ></div>
          </template>
          <template v-else>
            <z-table-row
              v-for="type in repoSettings"
              :key="type.name"
              class="text-vanilla-100 hover:bg-ink-300"
            >
              <z-table-cell text-align="left" class="text-sm font-normal">{{
                type.name
              }}</z-table-cell>
              <z-table-cell
                text-align="center"
                class="flex items-center justify-center text-sm font-normal"
              >
                <z-checkbox
                  v-model="type.isIgnoredToDisplay"
                  :true-value="false"
                  :false-value="true"
                  spacing="4"
                  font-size="base"
                  class="h-full"
                  @change="updateRepositorySettings(InputTypes.ISSUE_TYPE)"
                />
              </z-table-cell>
              <z-table-cell
                text-align="center"
                class="flex items-center justify-center text-sm font-normal"
              >
                <z-checkbox
                  v-model="type.isIgnoredInCheckStatus"
                  :true-value="false"
                  :false-value="true"
                  spacing="4"
                  font-size="base"
                  class="h-full m-0"
                  @change="updateRepositorySettings(InputTypes.ISSUE_TYPE)"
                />
              </z-table-cell>
            </z-table-row>
          </template>
        </template>
      </z-table>
      <z-table v-if="issuePrioritySettings.length" class="mt-4 text-vanilla-100">
        <template v-slot:head>
          <z-table-row>
            <z-table-cell
              v-for="head in priorityHeaderData"
              :key="head.title"
              class="text-sm font-bold"
              :class="head.align"
              >{{ head.title }}</z-table-cell
            >
          </z-table-row>
        </template>
        <template v-slot:body>
          <template v-if="$fetchState.pending">
            <div
              v-for="index in 3"
              :key="index"
              class="p-5 border-b opacity-50 bg-ink-300 animate-pulse border-ink-200"
            ></div>
          </template>
          <template v-else>
            <z-table-row
              v-for="priority in issuePrioritySettings"
              :key="priority.slug"
              class="text-vanilla-100 hover:bg-ink-300"
            >
              <z-table-cell text-align="left" class="text-sm font-normal">{{
                priority.verboseName
              }}</z-table-cell>
              <z-table-cell
                text-align="center"
                class="flex items-center justify-center text-sm font-normal"
              >
                <z-checkbox
                  v-model="priority.isIgnoredToDisplay"
                  :true-value="false"
                  :false-value="true"
                  spacing="4"
                  font-size="base"
                  class="h-full"
                  @change="updateRepositorySettings(InputTypes.ISSUE_PRIORITY)"
                />
              </z-table-cell>
              <z-table-cell
                text-align="center"
                class="flex items-center justify-center text-sm font-normal"
              >
                <z-checkbox
                  v-model="priority.isIgnoredInCheckStatus"
                  :true-value="false"
                  :false-value="true"
                  spacing="4"
                  font-size="base"
                  class="h-full m-0"
                  @change="updateRepositorySettings(InputTypes.ISSUE_PRIORITY)"
                />
              </z-table-cell>
            </z-table-row>
          </template>
        </template>
      </z-table>
    </div>

    <!-- DSN -->
    <div class="grid gap-4 mt-6">
      <div class="col-span-full md:col-auto">
        <div class="relative">
          <label for="repo-setting-dsn" class="text-sm text-vanilla-100">
            Data Source Name (DSN)
            <z-input :value="repository.dsn" id="repo-setting-dsn" :read-only="true" class="mt-2">
              <template slot="right">
                <copy-button :value="repository.dsn" :disabled="!repository.dsn" class="w-32" />
              </template>
            </z-input>
          </label>
          <div
            v-if="hideContents"
            class="absolute flex items-center justify-between w-full h-10 p-2 border top-8 backdrop-blur bg-ink-400 bg-opacity-10 no-filter:bg-opacity-100 border-ink-200"
          >
            <button
              class="flex items-center mx-auto text-sm leading-none cursor-pointer gap-x-2"
              @click="showContents()"
            >
              <z-icon size="small" icon="eye" color="vanilla-100"></z-icon>
              <span>Reveal</span>
            </button>
            <copy-button :value="repository.dsn" :disabled="!repository.dsn" class="w-26" />
          </div>
        </div>
      </div>
      <p class="text-xs leading-5 text-vanilla-400">
        This DSN should be used to send any external information about this repository to DeepSource
        from external sources, such as DeepSource CLI.
        <span class="font-medium text-vanilla-100">Please keep this confidential.</span>
      </p>
    </div>

    <z-divider margin="my-2" class="max-w-2xl" />

    <div class="flex flex-col gap-y-4">
      <div class="text-sm text-vanilla-100">Test Coverage</div>
      <!-- Notice -->
      <p class="text-xs leading-5 text-vanilla-400">
        For tracking test coverage, external data has to be sent to DeepSource. Read
        <a
          href="https://deepsource.io/docs/analyzer/test-coverage"
          target="_blank"
          rel="noopener noreferrer"
          class="text-juniper"
          >documentation</a
        >
        on configuration.
      </p>
      <notice class="items-baseline" :enabled="repository.hasTestCoverage">
        <p v-if="repository.hasTestCoverage" class="relative top-px">
          Test coverage tracking is enabled, and we're ready to receive coverage data.
        </p>
        <p v-else class="relative top-px">
          Test coverage has not been set up for this repository yet.
        </p>
      </notice>
    </div>
  </div>
</template>

<script lang="ts">
import { mixins, Component, namespace } from 'nuxt-property-decorator'
import { Notice } from '@/components/Settings/index'
import {
  ZDivider,
  ZInput,
  ZIcon,
  ZButton,
  ZTable,
  ZTableCell,
  ZTableRow,
  ZCheckbox,
  ZRadioGroup,
  ZRadio
} from '@deepsourcelabs/zeal'
import {
  IssuePrioritySetting,
  IssueTypeSetting,
  Maybe,
  Repository,
  UpdateRepositorySettingsInput
} from '~/types/types'
import { InfoBanner } from '@/components/Settings/index'
import { RepoPerms } from '~/types/permTypes'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import { IssueType } from '~/components/Repository'

const repoStore = namespace('repository/detail')

enum InputTypes {
  ISSUE_TYPE = 'issueType',
  ISSUE_PRIORITY = 'issuePriority',
  INTEGRATION_MODE = 'integrationMode'
}

@Component({
  components: {
    Notice,
    ZDivider,
    ZInput,
    ZIcon,
    ZButton,
    ZTable,
    ZTableCell,
    ZTableRow,
    ZCheckbox,
    InfoBanner,
    ZRadioGroup,
    ZRadio
  },
  layout: 'repository',
  middleware: ['perm'],
  meta: {
    auth: {
      strict: true,
      repoPerms: [
        RepoPerms.VIEW_DSN,
        RepoPerms.CHANGE_ISSUE_TYPES_TO_REPORT,
        RepoPerms.CHANGE_ISSUES_TO_TYPE_TO_BLOCK_PRS_ON,
        RepoPerms.CHANGE_PRIORITY_SETTINGS_TO_REPORT,
        RepoPerms.CHANGE_PRIORITY_SETTINGS_TO_BLOCK_PRS_ON
      ]
    }
  }
})
export default class Reporting extends mixins(RepoDetailMixin) {
  @repoStore.State
  repository!: Repository

  public hideContents = true
  public isFetchingData = false
  public updatingIntegrationModeSettings = false

  public repoSettings: Array<IssueTypeSetting> = []
  public issuePrioritySettings: Array<IssuePrioritySetting> = []

  InputTypes = InputTypes

  reportingMode = ''

  public headerData = [
    { title: 'Issue category', align: 'text-left' },
    { title: 'Issues reported?', align: 'text-center' },
    { title: 'Mark runs as failed?', align: 'text-center' }
  ]

  public priorityHeaderData = [
    { title: 'Priority', align: 'text-left' },
    { title: 'Issues reported?', align: 'text-center' },
    { title: 'Mark runs as failed?', align: 'text-center' }
  ]

  reportingModeOptions = [
    {
      value: 'commit',
      label: 'Pipelines/Commit Status API',
      description:
        'We use the GitLab Commit Status API to create a pipeline. This can be used to block merges based on the results from DeepSource.'
    },
    {
      value: 'comments',
      label: 'Comments',
      description:
        'We post a comment on the respective merge request with the analysis results. This is deprecated and will be removed by us soon.',
      badgeText: 'Deprecated'
    }
  ]

  async fetch(): Promise<void> {
    this.isFetchingData = true
    await this.fetchRepositorySettingsReporting({
      provider: this.$route.params.provider,
      owner: this.$route.params.owner,
      name: this.$route.params.repo
    })
    this.refinedIssueTypeSettings()
    this.isFetchingData = false

    if (this.providerIsGitLab) {
      this.reportingMode = this.repository.gitlabIntegrationUseStatus ? 'commit' : 'comments'
    }
  }

  get gitlabIntegrationUseStatus(): boolean | undefined {
    if (!this.providerIsGitLab) {
      return undefined
    }
    return this.reportingMode === 'commit'
  }

  get providerIsGitLab(): boolean {
    return this.$route.params.provider === 'gl'
  }

  /**
   * Method to format the issue type settings to be displayed in the table
   *
   * @returns {void}
   */
  public refinedIssueTypeSettings(): void {
    if (this.repository && this.repository.issueTypeSettings) {
      let updatedRepoSettings: Array<IssueTypeSetting> = []
      this.repository?.issueTypeSettings.forEach((setting: Maybe<IssueTypeSetting>) => {
        const newObj: IssueTypeSetting = {}
        newObj.slug = setting?.slug
        newObj.name = setting?.name
        newObj.isIgnoredToDisplay = setting?.isIgnoredToDisplay
        newObj.isIgnoredInCheckStatus = setting?.isIgnoredInCheckStatus
        updatedRepoSettings.push(newObj)
      })
      this.repoSettings = updatedRepoSettings
    }

    if (this.repository && this.repository.issuePrioritySettings) {
      let updatedPrioritySettings: Array<IssuePrioritySetting> = []
      this.repository?.issuePrioritySettings.forEach((setting: Maybe<IssuePrioritySetting>) => {
        const newObj: IssuePrioritySetting = {}
        newObj.slug = setting?.slug
        newObj.weight = setting?.weight
        newObj.verboseName = setting?.verboseName
        newObj.isIgnoredToDisplay = setting?.isIgnoredToDisplay
        newObj.isIgnoredInCheckStatus = setting?.isIgnoredInCheckStatus
        if (setting?.slug !== 'noop') {
          updatedPrioritySettings.push(newObj)
        }
      })
      this.issuePrioritySettings = updatedPrioritySettings
    }
  }

  /**
   * Method to update the repository settings
   *
   * @returns {Promise<void>}
   */
  public async updateRepositorySettings(inputType: InputTypes): Promise<void> {
    if (
      this.repository?.id &&
      this.repository?.issueTypeSettings &&
      this.repoSettings.length &&
      !this.isFetchingData
    ) {
      try {
        const input = { id: this.repository.id } as UpdateRepositorySettingsInput

        if (inputType === InputTypes.ISSUE_TYPE) {
          input.issueTypeSettings = this.repoSettings.length
            ? this.repoSettings
            : this.repository.issueTypeSettings
        } else if (inputType === InputTypes.ISSUE_PRIORITY) {
          input.issuePrioritySettings = this.issuePrioritySettings.length
            ? this.issuePrioritySettings
            : this.repository.issuePrioritySettings
        } else if (inputType === InputTypes.INTEGRATION_MODE) {
          this.updatingIntegrationModeSettings = true
          input.gitlabIntegrationUseStatus = this.gitlabIntegrationUseStatus
        }

        await this.updateRepoSettings({
          input
        })
        await this.fetchRepositorySettingsReporting({
          provider: this.$route.params.provider,
          owner: this.$route.params.owner,
          name: this.$route.params.repo,
          refetch: true
        })
        this.$toast.success('Repository settings updated successfully.')
      } catch (error) {
        this.$toast.danger('Error updating repository. Please try again.')
      } finally {
        if (inputType === InputTypes.INTEGRATION_MODE) {
          this.updatingIntegrationModeSettings = false
        }
      }
    }
  }

  public showContents(): void {
    this.hideContents = false
  }
}
</script>
