<template>
  <div class="flex max-w-2xl flex-col gap-y-2 p-4">
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
    <div class="space-y-4">
      <div class="max-w-2xl flex-grow">
        <div class="mb-4">
          <h6 class="mb-1 text-sm text-vanilla-100">Issue reporting</h6>
          <p class="text-xs leading-5 text-vanilla-400">
            Control which category of issues are reported, and when an analysis run is marked as
            failed.
          </p>
        </div>
        <z-table v-if="repoSettings && repoSettings.length" class="rounded-md text-vanilla-100">
          <template #head>
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
          <template #body>
            <template v-if="$fetchState.pending">
              <div
                v-for="index in 8"
                :key="index"
                class="animate-pulse border-b border-slate-400 bg-ink-300 p-5 opacity-50"
              ></div>
            </template>
            <template v-else>
              <z-table-row
                v-for="type in repoSettings"
                :key="type.name"
                class="text-vanilla-100 hover:bg-ink-300"
              >
                <z-table-cell
                  text-align="left"
                  class="overflow-hidden overflow-ellipsis text-sm font-normal"
                  >{{ type.name }}</z-table-cell
                >
                <z-table-cell
                  text-align="center"
                  class="flex items-center justify-center text-sm font-normal"
                >
                  <z-checkbox
                    :model-value="type.isIgnoredToDisplay"
                    :true-value="false"
                    :false-value="true"
                    spacing="4"
                    font-size="base"
                    class="h-full"
                    @change="
                      (newValue) =>
                        updateRepoSetting(InputTypes.ISSUE_TYPE, {
                          settingType: 'issueTypeSettings',
                          field: type.slug,
                          value: {
                            isIgnoredToDisplay: newValue,
                            isIgnoredInCheckStatus: newValue ? true : type.isIgnoredInCheckStatus
                          }
                        })
                    "
                  />
                </z-table-cell>
                <z-table-cell
                  text-align="center"
                  class="flex items-center justify-center text-sm font-normal"
                >
                  <z-checkbox
                    v-tooltip="{
                      content: type.isIgnoredToDisplay
                        ? 'An issue needs to be reported in order to mark a run as failed.'
                        : '',
                      delay: { show: 0, hide: 100 }
                    }"
                    :model-value="type.isIgnoredInCheckStatus"
                    :true-value="false"
                    :false-value="true"
                    :read-only="type.isIgnoredToDisplay"
                    spacing="4"
                    font-size="base"
                    class="m-0 h-full"
                    @change="
                      (newValue) =>
                        updateRepoSetting(InputTypes.ISSUE_TYPE, {
                          settingType: 'issueTypeSettings',
                          field: type.slug,
                          value: { isIgnoredInCheckStatus: newValue }
                        })
                    "
                  />
                </z-table-cell>
              </z-table-row>
            </template>
          </template>
        </z-table>
        <z-table
          v-if="issuePrioritySettings && issuePrioritySettings.length"
          class="mt-4 text-vanilla-100"
        >
          <template #head>
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
          <template #body>
            <template v-if="$fetchState.pending">
              <div
                v-for="index in 3"
                :key="index"
                class="animate-pulse border-b border-slate-400 bg-ink-300 p-5 opacity-50"
              ></div>
            </template>
            <template v-else>
              <z-table-row
                v-for="priority in issuePrioritySettings"
                :key="priority.slug"
                class="text-vanilla-100 hover:bg-ink-300"
              >
                <z-table-cell text-align="left" class="text-sm font-normal">
                  {{ priority.verboseName }}
                </z-table-cell>
                <z-table-cell
                  text-align="center"
                  class="flex items-center justify-center text-sm font-normal"
                >
                  <z-checkbox
                    :model-value="priority.isIgnoredToDisplay"
                    :true-value="false"
                    :false-value="true"
                    spacing="4"
                    font-size="base"
                    class="h-full"
                    @change="
                      (newValue) =>
                        updateRepoSetting(InputTypes.ISSUE_PRIORITY, {
                          settingType: 'issuePrioritySettings',
                          field: priority.slug,
                          value: {
                            isIgnoredToDisplay: newValue,
                            isIgnoredInCheckStatus: newValue
                              ? true
                              : priority.isIgnoredInCheckStatus
                          }
                        })
                    "
                  />
                </z-table-cell>
                <z-table-cell
                  text-align="center"
                  class="flex items-center justify-center text-sm font-normal"
                >
                  <z-checkbox
                    v-tooltip="{
                      content: priority.isIgnoredToDisplay
                        ? 'An issue needs to be reported in order to mark a run as failed.'
                        : '',
                      delay: { show: 0, hide: 100 }
                    }"
                    :model-value="priority.isIgnoredInCheckStatus"
                    :true-value="false"
                    :false-value="true"
                    :read-only="priority.isIgnoredToDisplay"
                    spacing="4"
                    font-size="base"
                    class="m-0 h-full"
                    @change="
                      (newValue) =>
                        updateRepoSetting(InputTypes.ISSUE_PRIORITY, {
                          settingType: 'issuePrioritySettings',
                          field: priority.slug,
                          value: { isIgnoredInCheckStatus: newValue }
                        })
                    "
                  />
                </z-table-cell>
              </z-table-row>
            </template>
          </template>
        </z-table>
      </div>

      <div class="max-w-2xl flex-grow">
        <div class="mb-4">
          <h6 class="mb-1 text-sm text-vanilla-100">Metrics reporting</h6>
          <p class="text-xs leading-5 text-vanilla-400">
            Configure which metrics are reported and mark analysis runs as failing when thresholds
            are not met.
          </p>
        </div>
        <z-table v-if="metricSettings && metricSettings.length" class="rounded-md text-vanilla-100">
          <template #head>
            <z-table-row>
              <z-table-cell
                v-for="head in metricsHeaderData"
                :key="head.title"
                class="text-sm font-bold"
                :class="head.align"
                >{{ head.title }}</z-table-cell
              >
            </z-table-row>
          </template>
          <template #body>
            <template v-if="$fetchState.pending">
              <div
                v-for="index in 5"
                :key="index"
                class="animate-pulse border-b border-slate-400 bg-ink-300 p-5 opacity-50"
              ></div>
            </template>
            <template v-else>
              <z-table-row
                v-for="metricSetting in metricSettings"
                :key="metricSetting.shortcode"
                class="text-vanilla-100 hover:bg-ink-300"
              >
                <z-table-cell
                  text-align="left"
                  class="overflow-hidden overflow-ellipsis text-sm font-normal"
                  >{{ metricSetting.name }}</z-table-cell
                >
                <z-table-cell
                  text-align="center"
                  class="flex items-center justify-center text-sm font-normal"
                >
                  <!-- ? @change also sets `isIgnoredInCheckStatus` to `true` if the metric is ignored for display -->
                  <z-checkbox
                    :model-value="metricSetting.isIgnoredToDisplay"
                    :true-value="false"
                    :false-value="true"
                    spacing="4"
                    font-size="base"
                    class="h-full"
                    @change="
                      (newValue) => {
                        updateRepoSetting(InputTypes.METRICS, {
                          settingType: 'metricSettings',
                          field: metricSetting.shortcode,
                          value: {
                            isIgnoredToDisplay: newValue,
                            isIgnoredInCheckStatus: newValue
                              ? true
                              : metricSetting.isIgnoredInCheckStatus
                          }
                        })
                      }
                    "
                  />
                </z-table-cell>
                <z-table-cell
                  text-align="center"
                  class="flex items-center justify-center text-sm font-normal"
                >
                  <z-checkbox
                    v-tooltip="{
                      content: metricSetting.isIgnoredToDisplay
                        ? 'A metric needs to be reported in order to enforce its threshold.'
                        : '',
                      delay: { show: 0, hide: 100 }
                    }"
                    :model-value="metricSetting.isIgnoredInCheckStatus"
                    :true-value="false"
                    :false-value="true"
                    :read-only="metricSetting.isIgnoredToDisplay"
                    spacing="4"
                    font-size="base"
                    class="m-0 h-full"
                    @change="
                      (newValue) =>
                        updateRepoSetting(InputTypes.METRICS, {
                          settingType: 'metricSettings',
                          field: metricSetting.shortcode,
                          value: { isIgnoredInCheckStatus: newValue }
                        })
                    "
                  />
                </z-table-cell>
              </z-table-row>
            </template>
          </template>
        </z-table>
      </div>

      <!-- DSN -->
      <div class="grid gap-4">
        <div class="col-span-full md:col-auto">
          <div class="relative">
            <label for="repo-setting-dsn" class="text-sm text-vanilla-100">
              Data Source Name (DSN)

              <div class="relative">
                <z-input
                  id="repo-setting-dsn"
                  :value="isDSNHidden ? 'random-placeholder-to-hide-dsn' : repository.dsn"
                  :read-only="true"
                  :type="isDSNHidden ? 'password' : 'text'"
                  class="mt-2 border-ink-200"
                />
                <div class="absolute top-1 right-1 flex gap-x-1 bg-ink-400">
                  <z-button
                    v-tooltip="isDSNHidden ? 'Reveal DSN' : 'Hide DSN'"
                    :icon="isDSNHidden ? 'eye' : 'eye-off'"
                    :disabled="!repository.dsn"
                    button-type="secondary"
                    size="small"
                    @click="isDSNHidden = !isDSNHidden"
                  />
                  <z-button
                    v-if="canRegenerateDSN"
                    v-tooltip="'Generate new DSN'"
                    button-type="secondary"
                    icon="refresh-cw"
                    size="small"
                    @click="showDSNRegenerateConfirm = true"
                  />
                  <copy-button
                    v-tooltip="'Copy DSN'"
                    :value="repository.dsn"
                    :disabled="!repository.dsn"
                    :icon-only="true"
                  />
                </div>
              </div>
            </label>
          </div>
        </div>
        <p class="text-xs leading-5 text-vanilla-400">
          This DSN should be used to send any external information about this repository to
          DeepSource from external sources, such as DeepSource CLI.
          <span class="font-medium text-vanilla-100">Please keep this confidential.</span>
        </p>
      </div>
    </div>
    <z-divider margin="my-2" class="max-w-2xl" />

    <div class="space-y-4">
      <div>
        <h6 class="mb-1 text-sm text-vanilla-100">Test Coverage</h6>
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
      </div>
      <notice :enabled="true" class="items-baseline">
        <p v-if="repository.hasTestCoverage" class="relative top-px">
          Test coverage tracking is enabled, and we're ready to receive coverage data.
        </p>
        <p v-else class="relative top-px">
          Test coverage has not been set up for this repository yet.
        </p>
      </notice>

      <portal to="modal">
        <z-confirm
          v-if="showDSNRegenerateConfirm && canRegenerateDSN"
          title="Confirm regenerate DSN for this repository?"
          subtitle="This action is irreversible, and will invalidate the old DSN. You must replace the old DSN with the new one wherever you are using it."
          @onClose="showDSNRegenerateConfirm = false"
        >
          <template #footer="{ close }">
            <div class="mt-6 flex items-center justify-end gap-x-4">
              <z-button
                label="Cancel"
                button-type="ghost"
                size="small"
                class="text-vanilla-100"
                @click="close"
              />

              <z-button
                label="Confirm and regenerate DSN"
                loading-label="Confirm and regenerate DSN"
                icon="refresh-ccw"
                size="small"
                :is-loading="regenerateDSNLoading"
                :disabled="regenerateDSNLoading"
                @click="regenerateDSN"
              />
            </div>
          </template>
        </z-confirm>
      </portal>
    </div>
  </div>
</template>

<script lang="ts">
import { mixins, Component, namespace } from 'nuxt-property-decorator'
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
  ZRadio,
  ZMenu,
  ZMenuSection,
  ZMenuItem,
  ZConfirm
} from '@deepsource/zeal'
import { Tooltip } from 'floating-vue'

import { RepositoryDetailMutations, RepoSettingOptions } from '~/store/repository/detail'

import RepoDetailMixin from '~/mixins/repoDetailMixin'
import RoleAccessMixin from '~/mixins/roleAccessMixin'

import {
  IssuePrioritySetting,
  IssueTypeSetting,
  MetricSetting,
  MetricSettingsInput,
  Repository,
  UpdateRepositorySettingsInput
} from '~/types/types'
import { RepoPerms } from '~/types/permTypes'

const repoStore = namespace('repository/detail')

export enum InputTypes {
  ISSUE_TYPE = 'issueType',
  ISSUE_PRIORITY = 'issuePriority',
  METRICS = 'metricsReporting',
  INTEGRATION_MODE = 'integrationMode'
}

@Component({
  components: {
    ZDivider,
    ZInput,
    ZIcon,
    ZButton,
    ZTable,
    ZTableCell,
    ZTableRow,
    ZCheckbox,
    ZRadioGroup,
    ZRadio,
    ZMenu,
    ZMenuSection,
    ZMenuItem,
    ZConfirm,
    Tooltip
  },
  layout: 'repository',
  middleware: ['perm'],
  meta: {
    auth: {
      strict: true,
      repoPerms: [
        RepoPerms.VIEW_DSN,
        RepoPerms.REGENERATE_DSN,
        RepoPerms.CHANGE_ISSUE_TYPES_TO_REPORT,
        RepoPerms.CHANGE_ISSUES_TO_TYPE_TO_BLOCK_PRS_ON,
        RepoPerms.CHANGE_PRIORITY_SETTINGS_TO_REPORT,
        RepoPerms.CHANGE_PRIORITY_SETTINGS_TO_BLOCK_PRS_ON
      ]
    }
  }
})
export default class Reporting extends mixins(RepoDetailMixin, RoleAccessMixin) {
  @repoStore.State
  repository!: Repository

  @repoStore.Mutation(RepositoryDetailMutations.SET_REPO_SETTING_VALUE)
  setRepoSettingField: (options: RepoSettingOptions) => void

  public isDSNHidden = true
  public showDSNRegenerateConfirm = false
  public regenerateDSNLoading = false

  public isFetchingData = false
  public updatingIntegrationModeSettings = false

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

  public metricsHeaderData = [
    { title: 'Metric', align: 'text-left' },
    { title: 'Metric reported?', align: 'text-center' },
    { title: 'Threshold enforced?', align: 'text-center' }
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

  /**
   * Fetch hook for `reporting` page in repo settings.
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    this.isFetchingData = true
    try {
      const { provider, owner, repo } = this.$route.params
      await this.fetchRepositorySettingsReporting({
        provider: provider,
        owner: owner,
        name: repo
      })
    } catch (e) {
      this.$toast.danger((e as Error).message.replace('GraphQL error: ', ''))
    } finally {
      this.isFetchingData = false

      if (this.providerIsGitLab) {
        this.reportingMode = this.repository.gitlabIntegrationUseStatus ? 'commit' : 'comments'
      }
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

  get repoSettings(): Array<IssueTypeSetting> {
    return (this.repository?.issueTypeSettings?.filter(Boolean) as IssueTypeSetting[]) ?? []
  }

  get issuePrioritySettings(): Array<IssuePrioritySetting> {
    return (
      (this.repository?.issuePrioritySettings?.filter(
        (issuePrioritySetting) => issuePrioritySetting?.slug !== 'noop'
      ) as IssuePrioritySetting[]) ?? []
    )
  }

  get metricSettings(): Array<MetricSetting> {
    return (this.repository?.metricSettings?.filter(Boolean) as MetricSetting[]) ?? []
  }

  get canRegenerateDSN(): boolean {
    return this.$gateKeeper.repo(RepoPerms.REGENERATE_DSN, this.repoPerms.permission)
  }

  /**
   *  Method to update the repository settings. Constructs the mutation payload based on the type and slug of the setting to be updated.
   *  Uses the `inputType` and `slugToUpdate` to find the corresponding setting in the repository store (which has been updated with the new values),
   *  and deconstructs the settings object to get the necessary values for the `UpdateRepositorySettingsInput`.
   *  The mutation is executed after which the repository reporting settings are re-fetched.
   *
   * @param inputType - The category of settings to be updated
   * @param slugToUpdate - The specific slug to be updated
   * @returns {Promise<void>}
   */
  public async updateRepositorySettings(
    inputType: InputTypes,
    slugToUpdate: string
  ): Promise<void> {
    if (this.repository?.id && !this.isFetchingData) {
      try {
        const input = { id: this.repository.id } as UpdateRepositorySettingsInput

        if (inputType === InputTypes.ISSUE_TYPE && this.repository?.issueTypeSettings) {
          const options = this.repository.issueTypeSettings.find(
            (typeSetting) => typeSetting && typeSetting.slug === slugToUpdate
          ) as IssueTypeSetting
          const { slug, isIgnoredInCheckStatus, isIgnoredToDisplay, name } = options
          input.issueTypeSettings = [
            options ? { slug, isIgnoredInCheckStatus, isIgnoredToDisplay, name } : {}
          ]
        } else if (
          inputType === InputTypes.ISSUE_PRIORITY &&
          this.repository.issuePrioritySettings
        ) {
          const options = this.repository.issuePrioritySettings.find(
            (prioritySetting) => prioritySetting && prioritySetting.slug === slugToUpdate
          ) as IssuePrioritySetting
          const { slug, isIgnoredInCheckStatus, verboseName, isIgnoredToDisplay, weight } = options
          input.issuePrioritySettings = [
            options ? { slug, isIgnoredInCheckStatus, verboseName, isIgnoredToDisplay, weight } : {}
          ]
        } else if (inputType === InputTypes.METRICS && this.repository.metricSettings) {
          const options = this.repository.metricSettings.find(
            (metricSetting) => metricSetting && metricSetting.shortcode === slugToUpdate
          ) as MetricSettingsInput
          const { shortcode, isIgnoredInCheckStatus, isIgnoredToDisplay } = options
          input.metricSettings = [{ shortcode, isIgnoredInCheckStatus, isIgnoredToDisplay }]
        } else if (inputType === InputTypes.INTEGRATION_MODE) {
          this.updatingIntegrationModeSettings = true
          input.gitlabIntegrationUseStatus = this.gitlabIntegrationUseStatus
        }

        await this.updateRepoSettings({
          input
        })

        this.$toast.success('Repository settings updated successfully.')
      } catch (error) {
        this.$toast.danger('Error updating repository. Please try again.')
      } finally {
        await this.fetchRepositorySettingsReporting({
          provider: this.$route.params.provider,
          owner: this.$route.params.owner,
          name: this.$route.params.repo,
          refetch: true
        })
        if (inputType === InputTypes.INTEGRATION_MODE) {
          this.updatingIntegrationModeSettings = false
        }
      }
    }
  }

  /**
   * Update settings for a repository.
   *
   * @param {InputTypes} inputType - Type of setting to update
   * @param {RepoSettingOptions} options - Options for the repo setting to update
   *
   * @returns {void} void
   */
  public updateRepoSetting(inputType: InputTypes, options: RepoSettingOptions): void {
    this.setRepoSettingField(options)
    this.updateRepositorySettings(inputType, options.field)
  }

  async regenerateDSN() {
    this.regenerateDSNLoading = true
    try {
      await this.regenerateRepositoryDSN()
      this.showDSNRegenerateConfirm = false
      this.$toast.success('Regenerated DSN successfully.')
    } catch (e) {
      this.$logErrorAndToast(e as Error, 'Unable to regenrate DSN. Please contact support.')
    } finally {
      this.regenerateDSNLoading = false
    }
  }
}
</script>
