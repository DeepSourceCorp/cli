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
    <div class="space-y-4">
      <div class="flex-grow max-w-2xl">
        <div class="mb-4">
          <h6 class="mb-1 text-sm text-vanilla-100">Issue reporting</h6>
          <p class="text-xs leading-5 text-vanilla-400">
            Control which category of issues are reported, and when an analysis run is marked as
            failed.
          </p>
        </div>
        <z-table v-if="repoSettings && repoSettings.length" class="rounded-md text-vanilla-100">
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
                <z-table-cell
                  text-align="left"
                  class="overflow-hidden text-sm font-normal overflow-ellipsis"
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
                    class="h-full m-0"
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
                    class="h-full m-0"
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

      <div class="flex-grow max-w-2xl">
        <div class="mb-4">
          <h6 class="mb-1 text-sm text-vanilla-100">Metrics reporting</h6>
          <p class="text-xs leading-5 text-vanilla-400">
            Configure which metrics are reported and mark analysis runs as failing when thresholds
            are not met.
          </p>
        </div>
        <z-table v-if="metricSettings && metricSettings.length" class="rounded-md text-vanilla-100">
          <template v-slot:head>
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
          <template v-slot:body>
            <template v-if="$fetchState.pending">
              <div
                v-for="index in 5"
                :key="index"
                class="p-5 border-b opacity-50 bg-ink-300 animate-pulse border-ink-200"
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
                  class="overflow-hidden text-sm font-normal overflow-ellipsis"
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
                    class="h-full m-0"
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
      <div class="flex justify-between gap-x-4">
        <div>
          <h6 class="mb-1 text-sm text-vanilla-100">New code coverage thresholds</h6>
          <p class="text-xs leading-5 text-vanilla-400">
            Configure thresholds for new code coverage in pull requests.
          </p>
        </div>
        <z-button
          v-if="repository.hasTestCoverage && canModifyThreshold"
          v-tooltip="{
            content:
              !analyzersWithoutThreshold.length && !$fetchState.pending
                ? 'Thresholds for all langugages have been set'
                : '',
            delay: { show: 0, hide: 100 }
          }"
          button-type="ghost"
          size="small"
          color="vanilla-400"
          icon="plus"
          label="Add new threshold"
          loading-label="Fetching data"
          :disabled="!analyzersWithoutThreshold.length"
          :is-loading="$fetchState.pending"
          class="float-right border border-dashed border-ink-100"
          @click="showAddThresholdModal = true"
        />
      </div>

      <div v-if="$fetchState.pending || repository.hasTestCoverage" class="space-y-2">
        <z-table>
          <template v-slot:head>
            <z-table-row>
              <z-table-cell
                v-for="head in nlcvHeaderData"
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
                class="border-b opacity-50 h-11 bg-ink-300 animate-pulse border-ink-200"
              ></div>
            </template>
            <template
              v-else-if="nonAggregateMetricNamespaces && nonAggregateMetricNamespaces.length"
            >
              <z-table-row
                v-for="namespace in nonAggregateMetricNamespaces"
                :key="namespace.key"
                class="text-vanilla-100 hover:bg-ink-300"
              >
                <z-table-cell text-align="left" class="text-sm font-normal">{{
                  namespace.key
                }}</z-table-cell>
                <z-table-cell text-align="right" class="text-sm font-normal">
                  <div
                    v-if="namespace.threshold || namespace.threshold === 0"
                    class="flex items-center justify-end gap-x-4"
                  >
                    <span
                      >{{ namespace.threshold
                      }}{{ nlcvMetricData.unit ? nlcvMetricData.unit : '' }}</span
                    >
                    <z-menu v-if="canModifyThreshold" direction="left">
                      <template v-slot:trigger="{ toggle }">
                        <z-button
                          button-type="ghost"
                          icon="more-vertical"
                          icon-color="vanilla-400"
                          size="x-small"
                          @click="toggle"
                        />
                      </template>
                      <template slot="body">
                        <z-menu-section :divider="false" class="text-left">
                          <z-menu-item
                            class="text-sm"
                            icon="edit-2"
                            @click="toggleEditThreshold(namespace)"
                          >
                            Update Threshold
                          </z-menu-item>
                          <z-menu-item
                            class="text-sm text-cherry"
                            icon="trash-2"
                            @click="deleteThreshold(namespace)"
                          >
                            Delete Threshold
                          </z-menu-item>
                        </z-menu-section>
                      </template>
                    </z-menu>
                  </div>
                </z-table-cell>
              </z-table-row>
            </template>
            <lazy-empty-state
              v-else-if="repository.hasTestCoverage"
              title="No active analyzer threshold"
            >
              <template #action>
                <z-button
                  v-if="canModifyThreshold"
                  icon="plus"
                  size="small"
                  label="Add new threshold"
                  @click="showAddThresholdModal = true"
                />
              </template>
            </lazy-empty-state>
          </template>
        </z-table>
        <z-table>
          <template v-slot:body>
            <template v-if="$fetchState.pending">
              <div class="border-b opacity-50 h-11 bg-ink-300 animate-pulse border-ink-200"></div>
            </template>
            <z-table-row v-else class="text-vanilla-100 hover:bg-ink-300">
              <z-table-cell text-align="left" class="space-x-1 text-sm font-normal capitalize h-11">
                <span>{{ aggregateMetricNamespace.key }}</span>
                <tooltip
                  :delay="{ show: 300, hide: 1500 }"
                  :triggers="['hover', 'click']"
                  placement="top"
                  offset="5"
                  popper-class="rich-tooltip w-44"
                  class="inline"
                >
                  <z-icon
                    icon="help-circle"
                    size="x-small"
                    color="current"
                    class="inline text-vanilla-400 hover:text-vanilla-100"
                  />
                  <template #popper>
                    <p class="text-xs text-vanilla-100">
                      Aggregate is a weighted average of analyzers activated in the repo.
                      <a
                        href="https://deepsource.io/docs/dashboard/repo-overview#metric-aggregate-calculation"
                        target="blank"
                        rel="noopener noreferrer"
                        class="text-juniper hover:underline whitespace-nowrap"
                        >Learn more --></a
                      >
                    </p>
                  </template>
                </tooltip>
              </z-table-cell>
              <z-table-cell text-align="right" class="text-sm font-normal text-right">
                <div
                  v-if="
                    aggregateMetricNamespace.threshold || aggregateMetricNamespace.threshold === 0
                  "
                  class="flex items-center justify-end gap-x-4"
                >
                  <span
                    >{{ aggregateMetricNamespace.threshold
                    }}{{ nlcvMetricData.unit ? nlcvMetricData.unit : '' }}</span
                  >
                  <z-menu v-if="canModifyThreshold" direction="left">
                    <template v-slot:trigger="{ toggle }">
                      <z-button
                        button-type="ghost"
                        icon="more-vertical"
                        icon-color="vanilla-400"
                        size="x-small"
                        @click="toggle"
                      />
                    </template>
                    <template slot="body">
                      <z-menu-section :divider="false" class="text-left">
                        <z-menu-item
                          class="text-sm"
                          icon="edit-2"
                          @click="toggleEditThreshold(aggregateMetricNamespace)"
                        >
                          Update Threshold
                        </z-menu-item>
                        <z-menu-item
                          class="text-sm text-cherry"
                          icon="trash-2"
                          @click="deleteThreshold(aggregateMetricNamespace)"
                        >
                          Delete Threshold
                        </z-menu-item>
                      </z-menu-section>
                    </template>
                  </z-menu>
                </div>
                <z-button
                  v-else
                  button-type="ghost"
                  size="x-small"
                  color="vanilla-400"
                  class="text-sm font-normal outline-none focus:outline-none"
                  @click="toggleEditThreshold(aggregateMetricNamespace)"
                >
                  Add threshold
                </z-button>
              </z-table-cell>
            </z-table-row>
          </template>
        </z-table>
      </div>
      <lazy-empty-state
        v-else
        title="Test coverage has not been set up for this repository yet."
        subtitle="Test coverage needs to be enabled for this repository in order to configure the new code coverage metric."
        :show-border="true"
      />
      <portal to="modal">
        <add-nlcv-threshold-modal
          v-if="showAddThresholdModal"
          :analyzers="analyzersWithoutThreshold"
          @addThreshold="addThreshold"
          @close="showAddThresholdModal = false"
        />
        <edit-threshold-modal
          v-if="showEditThresholdModal"
          v-bind="editThresholdProps"
          @editThreshold="editThreshold"
          @close="showEditThresholdModal = false"
        />
      </portal>
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
  ZRadio,
  ZMenu,
  ZMenuSection,
  ZMenuItem
} from '@deepsourcelabs/zeal'
import {
  Analyzer,
  IssuePrioritySetting,
  IssueTypeSetting,
  Metric,
  MetricNamespace,
  MetricSetting,
  MetricSettingsInput,
  MetricTypeChoices,
  Repository,
  UpdateRepositorySettingsInput
} from '~/types/types'
import { InfoBanner } from '@/components/Settings/index'
import { RepoPerms } from '~/types/permTypes'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import {
  RepositoryDetailMutations,
  RepoSettingOptions,
  RepositoryDetailActions
} from '~/store/repository/detail'
import { MetricType, NLCV_SHORTCODE } from '~/types/metric'
import { GraphqlMutationResponse } from '~/types/apollo-graphql-types'
import { AnalyzerListActions } from '~/store/analyzer/list'
import { Tooltip } from 'floating-vue'

const repoStore = namespace('repository/detail')
const analyzerStore = namespace('analyzer/list')

export enum InputTypes {
  ISSUE_TYPE = 'issueType',
  ISSUE_PRIORITY = 'issuePriority',
  METRICS = 'metricsReporting',
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
    ZRadio,
    ZMenu,
    ZMenuSection,
    ZMenuItem,
    Tooltip
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

  @repoStore.Mutation(RepositoryDetailMutations.SET_REPO_SETTING_VALUE)
  setRepoSettingField: (options: RepoSettingOptions) => void

  @repoStore.Action(RepositoryDetailActions.FETCH_NLCV_METRIC)
  fetchNlcvMetic: (args: {
    provider: string
    owner: string
    name: string
    shortcode: typeof NLCV_SHORTCODE
    metricType: MetricTypeChoices.PullRequestOnly
    refetch?: boolean
  }) => Promise<Repository>

  @repoStore.Action(RepositoryDetailActions.SET_METRIC_THRESHOLD)
  setMetricThreshold: (args: {
    metricShortcode: string
    repositoryId: string
    thresholdValue: number | null
    key: string
  }) => Promise<GraphqlMutationResponse>

  @analyzerStore.Action(AnalyzerListActions.FETCH_ANALYZER_NAMES)
  fetchAnalyzerNames: (args: { categories?: string[] }) => Promise<Analyzer[]>

  public hideContents = true
  public isFetchingData = false
  public updatingIntegrationModeSettings = false

  //? NLCV
  analyzerNames = [] as Analyzer[]
  nlcvRepositoryData = {} as Repository
  editThresholdProps = {}
  showAddThresholdModal = false
  showEditThresholdModal = false

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

  public nlcvHeaderData = [
    { title: 'Analyzer', align: 'text-left' },
    { title: 'Threshold', align: 'text-right' }
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
   * Fetch function to fetch NLCV data.
   *
   * @param {boolean} [refetch=false] - Makes a `network-only` request when set to `true`
   *
   * @returns {Promise<Repository>}
   */
  async fetchNlcvData(refetch: boolean = false): Promise<Repository> {
    const { provider, owner, repo } = this.$route.params
    return this.fetchNlcvMetic({
      provider,
      owner,
      name: repo,
      shortcode: NLCV_SHORTCODE,
      metricType: MetricTypeChoices.PullRequestOnly,
      refetch
    })
  }

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

      const analyzerNamesPromise = this.repository.hasTestCoverage
        ? this.fetchAnalyzerNames({ categories: ['lang'] })
        : new Promise<Analyzer[]>((resolve) => resolve([] as Analyzer[]))

      const nlcvDataPromise: Promise<Repository> = this.repository.hasTestCoverage
        ? this.fetchNlcvData(true)
        : new Promise((resolve) => resolve({} as Repository))

      const [nlcvData, analyzerNames] = await Promise.all([nlcvDataPromise, analyzerNamesPromise])

      this.nlcvRepositoryData = nlcvData
      this.analyzerNames = analyzerNames
    } catch (e) {
      this.$toast.danger((e as Error).message.replace('GraphQL error: ', ''))
    } finally {
      this.isFetchingData = false

      if (this.providerIsGitLab) {
        this.reportingMode = this.repository.gitlabIntegrationUseStatus ? 'commit' : 'comments'
      }
    }
  }

  get nlcvMetricData() {
    if (this.nlcvRepositoryData.metricsCaptured?.[0]) {
      return this.nlcvRepositoryData.metricsCaptured[0]
    }
    return {} as Metric
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

  get analyzersWithoutThreshold() {
    return this.analyzerNames.filter((analyzer) => {
      return (
        !this.nlcvMetricData.namespaces?.some((namespace) => namespace?.key === analyzer.name) ||
        this.nlcvMetricData.namespaces?.some(
          (namespace) => namespace?.key === analyzer.name && namespace.threshold === null
        )
      )
    })
  }

  get nonAggregateMetricNamespaces() {
    return this.nlcvMetricData.namespaces?.filter(
      (namespace) => namespace?.threshold !== null && namespace?.key !== MetricType.aggregate
    )
  }

  get aggregateMetricNamespace() {
    return (
      this.nlcvRepositoryData.metricsCaptured?.[0]?.namespaces?.filter(
        (namespace) => namespace?.key === MetricType.aggregate
      )?.[0] ?? ({ key: MetricType.aggregate } as MetricNamespace)
    )
  }

  get canModifyThreshold(): boolean {
    return Boolean(this.nlcvRepositoryData.userPermissionMeta?.can_modify_metric_thresholds)
  }

  /**
   * Method to update the repository settings
   *
   * @returns {Promise<void>}
   */
  public async updateRepositorySettings(inputType: InputTypes): Promise<void> {
    if (this.repository?.id && !this.isFetchingData) {
      try {
        const input = { id: this.repository.id } as UpdateRepositorySettingsInput

        if (inputType === InputTypes.ISSUE_TYPE && this.repository?.issueTypeSettings) {
          input.issueTypeSettings = this.repository.issueTypeSettings.map((typeSetting) => {
            if (typeSetting) {
              const { slug, isIgnoredInCheckStatus, isIgnoredToDisplay, name } = typeSetting
              return { slug, isIgnoredInCheckStatus, isIgnoredToDisplay, name }
            }
            return {}
          })
        } else if (
          inputType === InputTypes.ISSUE_PRIORITY &&
          this.repository.issuePrioritySettings
        ) {
          input.issuePrioritySettings = this.repository.issuePrioritySettings.map(
            (prioritySetting) => {
              if (prioritySetting) {
                const { slug, isIgnoredInCheckStatus, verboseName, isIgnoredToDisplay, weight } =
                  prioritySetting
                return { slug, isIgnoredInCheckStatus, verboseName, isIgnoredToDisplay, weight }
              }
              return {}
            }
          )
        } else if (inputType === InputTypes.METRICS && this.repository.metricSettings) {
          input.metricSettings = this.repository.metricSettings.map((metricSetting) => {
            if (metricSetting) {
              const { shortcode, isIgnoredInCheckStatus, isIgnoredToDisplay } = metricSetting
              return {
                shortcode,
                isIgnoredInCheckStatus,
                isIgnoredToDisplay
              }
            }
          }) as MetricSettingsInput[]
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
    this.updateRepositorySettings(inputType)
  }

  /**
   * Show contents within the DSN field.
   *
   * @returns {void} void
   */
  public showContents(): void {
    this.hideContents = false
  }

  /**
   * Toggle the edit threshold modal open with given parameters.
   *
   * @param {{key: MetricNamespace['key'], threshold: MetricNamespace['threshold']}} namespace - Object with a `key` and `threshold` of the metric namespace to edit
   *
   * @returns {void}
   */
  toggleEditThreshold(namespace: {
    key: MetricNamespace['key']
    threshold: MetricNamespace['threshold']
  }): void {
    if (this.nlcvMetricData?.name) {
      this.editThresholdProps = {
        thresholdValue: namespace.threshold,
        analyzerKey: namespace.key,
        metricShortcode: NLCV_SHORTCODE,
        repositoryId: this.repository.id,
        metricName: this.nlcvMetricData.name,
        unit: this.nlcvMetricData.unit
      }
      this.showEditThresholdModal = true
    }
  }

  /**
   * Add a threshold for a namespace in the {@link NLCV_SHORTCODE} metric.
   *
   * @param {string} analyzerToAdd - `key` of the namespace whose threshold is being added
   * @param {number} newThresholdValue - Value to update the threshold to
   * @param {Function} close - Function to close the modal.
   *
   * @returns {Promise<void>}
   */
  async addThreshold(
    analyzerToAdd: string,
    newThresholdValue: number,
    close?: () => void
  ): Promise<void> {
    if (newThresholdValue || newThresholdValue === 0) {
      try {
        const response = (await this.setMetricThreshold({
          metricShortcode: NLCV_SHORTCODE,
          repositoryId: this.repository.id,
          thresholdValue: newThresholdValue || 0,
          key: analyzerToAdd
        })) as GraphqlMutationResponse

        if (response.data.updateRepoMetricThreshold?.ok) {
          this.$toast.success('Successfully created threshold.')
          close?.()
        }
      } catch (e) {
        this.$logErrorAndToast(e as Error, 'An error occured while updating repository metrics.')
      } finally {
        this.nlcvRepositoryData = await this.fetchNlcvData(true)
      }
    }
  }

  /**
   * Edit a threshold for a namespace in the {@link NLCV_SHORTCODE} metric.
   *
   * @param {number} newThresholdValue - Value to update the threshold to
   * @param {string} analyzerKey - `key` of the namespace whose threshold is being updated
   * @param {Function} close - Function to close the modal.
   *
   * @returns {Promise<void>}
   */
  async editThreshold(
    newThresholdValue: number | null,
    analyzerKey: string,
    close?: () => void
  ): Promise<void> {
    if (newThresholdValue !== undefined) {
      try {
        const response = (await this.setMetricThreshold({
          metricShortcode: NLCV_SHORTCODE,
          repositoryId: this.repository.id,
          thresholdValue: newThresholdValue,
          key: analyzerKey
        })) as GraphqlMutationResponse

        if (response.data.updateRepoMetricThreshold?.ok) {
          this.$toast.success('Successfully updated threshold.')
          close?.()
        }
      } catch (e) {
        this.$logErrorAndToast(e as Error, 'An error occured while updating repository metrics.')
      } finally {
        this.nlcvRepositoryData = await this.fetchNlcvData(true)
      }
    } else {
      this.$toast.danger('An error occured while updating repository metrics.')
    }
  }

  /**
   * Delete a threshold for a namespace in the {@link NLCV_SHORTCODE} metric.
   *
   * @param {MetricNamespace} namespace - MetricNamespace to delete threshold for.
   *
   * @returns {Promise<void>}
   */
  async deleteThreshold(namespace: MetricNamespace): Promise<void> {
    await this.editThreshold(null, namespace.key as string)
  }
}
</script>
