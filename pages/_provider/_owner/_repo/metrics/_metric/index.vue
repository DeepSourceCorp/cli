<template>
  <div>
    <template v-if="isMissingAggregate">
      <lazy-empty-trend
        :namespaces-trend="mockAggregateData"
        :metric-meta="trendMetricData"
        :filter-value="lastDays"
        @updateFilter="updateFilter"
      />
    </template>
    <template v-if="metric && metric.namespacesTrends.length">
      <trend-section
        v-for="namespacesTrend in metric.namespacesTrends"
        :key="namespacesTrend.key"
        :namespaces-trend="namespacesTrend"
        :metric-meta="trendMetricData"
        :filter-value="lastDays"
        :clip="true"
        :can-modify-threshold="canModifyThreshold"
        :data-loading="metricDataLoading"
        @addThreshold="openUpdateThresholdModal"
        @openUpdateThresholdModal="openUpdateThresholdModal"
        @deleteThreshold="deleteThreshold"
        @updateFilter="updateFilter"
      />
      <portal to="modal">
        <edit-threshold-modal
          v-if="showUpdateThresholdModal"
          v-bind="editModalProps"
          @editThreshold="editThreshold"
          @close="showUpdateThresholdModal = false"
          @refetch="refetch"
        />
      </portal>
    </template>
    <template v-else-if="$fetchState.pending">
      <div class="bg-ink-300 h-23 animate-pulse"></div>
      <div v-for="i in 2" :key="i" class="p-6 space-y-6 border-b border-ink-200">
        <div class="h-8 w-32 bg-ink-300 animate-pulse"></div>
        <div class="rounded-md space-y-4">
          <div class="flex gap-x-23">
            <div v-for="j in 2" :key="`s${j}`" class="h-13 w-32 animate-pulse bg-ink-300"></div>
          </div>
          <div class="h-72 bg-ink-300 animate-pulse"></div>
        </div>
      </div>
    </template>
    <div v-else class="p-4">
      <lazy-empty-state
        v-if="isMetricDisabled"
        use-v2
        :show-border="true"
        title="Metric capture is disabled"
      >
        <template #subtitle>
          Capturing this metric has been turned off for this repository. To change this, please go
          to
          <nuxt-link to="../settings/reporting" class="text-juniper hover:underline focus:underline"
            >Settings <span class="text-vanilla-400"> › </span> Reporting</nuxt-link
          >.
        </template>
        <template #action>
          <nuxt-link-button to="../settings/reporting" class="space-x-2">
            <z-icon icon="wrench" color="ink-400" class="flex-shrink-0" />
            <span class="text-sm font-medium">Open repository settings</span>
          </nuxt-link-button>
        </template>
      </lazy-empty-state>
      <lazy-empty-state
        v-else-if="checkTestCoverageSetupStatus && !repository.hasTestCoverage"
        use-v2
        :webp-image-path="
          require('~/assets/images/ui-states/metrics/set-up-code-coverage-136px.webp')
        "
        :png-image-path="
          require('~/assets/images/ui-states/metrics/set-up-code-coverage-136px.png')
        "
        :show-border="true"
        title="Set up code coverage"
        subtitle="Enable the Test Coverage analyzer on this repository to start collecting code coverage metrics."
      >
        <template #action>
          <z-button
            icon="scroll"
            size="small"
            to="https://deepsource.io/docs/analyzer/test-coverage#setup-test-coverage"
            target="_blank"
            rel="noopener noreferrer"
            label="Read the docs"
          />
        </template>
      </lazy-empty-state>
      <lazy-empty-state
        v-else
        :webp-image-path="require('~/assets/images/ui-states/metrics/no-data-found-136px.webp')"
        :png-image-path="require('~/assets/images/ui-states/metrics/no-data-found-136px.png')"
        :show-border="false"
        title="Not enough data"
      >
        <template #subtitle>
          We do not have enough data for the selected time range. Please select another time range
          or come back later.
        </template>
      </lazy-empty-state>
    </div>
  </div>
</template>
<script lang="ts">
// Internals
import { Component, namespace, Prop, Vue, Watch } from 'nuxt-property-decorator'

// Store imports
import { RepositoryDetailActions } from '~/store/repository/detail'
import { GraphqlMutationResponse } from '~/types/apollo-graphql-types'
import { DEFAULT_BR_COVERAGE_METRICS, MetricType } from '~/types/metric'
import {
  Maybe,
  Metric,
  MetricNamespaceTrend,
  MetricSetting,
  MetricTypeChoices,
  Repository
} from '~/types/types'

//Zeal
import { ZButton, ZIcon } from '@deepsource/zeal'

const repoStore = namespace('repository/detail')

/**
 * Metric detail page for a Repository metric.
 */
@Component({
  layout: 'repository',
  components: { ZButton, ZIcon }
})
export default class MetricPage extends Vue {
  @Prop({ required: true })
  repoMetricSettings: MetricSetting[]

  @repoStore.Action(RepositoryDetailActions.FETCH_METRIC)
  fetchMetricData: (args: {
    provider: string
    owner: string
    name: string
    shortcode: string
    metricType: MetricTypeChoices.DefaultBranchOnly
    lastDays?: number
    refetch?: boolean
  }) => Promise<Repository>

  @repoStore.Action(RepositoryDetailActions.SET_METRIC_THRESHOLD)
  setMetricThreshold: (args: {
    metricShortcode: string
    repositoryId: string
    thresholdValue: number | null
    key: string
  }) => Promise<GraphqlMutationResponse>

  lastDays = 30
  showUpdateThresholdModal = false
  repository = {} as Repository
  editModalProps = {}
  mockAggregateData = { key: '' } as MetricNamespaceTrend
  metricDataLoading = false

  /**
   * Fetch a metric depending on page route.
   *
   * @param {boolean} [refetch] - Optional parameter that performs a `network-only` fetch of metric data.
   *
   * @returns {Promise<void>}
   */
  async fetchMetric(refetch?: boolean): Promise<void> {
    const { provider, owner, repo, metric } = this.$route.params
    this.metricDataLoading = true
    try {
      this.repository = await this.fetchMetricData({
        provider,
        owner,
        name: repo,
        shortcode: metric,
        metricType: MetricTypeChoices.DefaultBranchOnly,
        lastDays: this.lastDays,
        refetch
      })
    } catch (e) {
      this.$router.replace(`/${provider}/${owner}/${repo}/metrics`)
    } finally {
      this.metricDataLoading = false
    }
  }

  /**
   * Fetch hook for the metric detail page.
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    await this.fetchMetric(true)
  }

  /**
   * Refetch hook for the metric detail page.
   *
   * @returns {Promise<void>}
   */
  async refetch(): Promise<void> {
    await this.fetchMetric(true)
  }

  get metric(): Maybe<Metric> | undefined {
    const metric = this.repository?.metricsCaptured?.find(
      (metric) => metric?.shortcode === this.$route.params.metric
    )
    return metric
  }

  get trendMetricData(): {
    shortcode?: Metric['shortcode']
    name?: Metric['name']
    description?: Metric['description']
    supportsAggregateThreshold?: Metric['supportsAggregateThreshold']
    unit?: Metric['unit']
  } {
    if (this.metric) {
      const { shortcode, name, description, supportsAggregateThreshold, unit } = this
        .metric as Metric
      return { shortcode, name, description, supportsAggregateThreshold, unit }
    }
    return {}
  }

  get isMissingAggregate(): boolean {
    const isMissing = !this.metric?.namespacesTrends?.some(
      (namespaceTrend) => namespaceTrend?.key === MetricType.aggregate
    )
    if (isMissing) {
      this.mockAggregateData = {
        key: MetricType.aggregate
      }
    }
    return isMissing
  }

  get canModifyThreshold(): boolean {
    return Boolean(this.repository.userPermissionMeta?.can_modify_metric_thresholds)
  }

  get checkTestCoverageSetupStatus(): boolean {
    return DEFAULT_BR_COVERAGE_METRICS.includes(this.$route.params.metric)
  }

  get isMetricDisabled(): boolean {
    return Boolean(
      this.repoMetricSettings?.find(
        (metricSetting) => metricSetting.shortcode === this.$route.params.metric
      )?.isIgnoredToDisplay
    )
  }

  /**
   * Opens the update threshold modal after setting the required paramters.
   *
   * @param {MetricNamespaceTrend} namespacesTrend - Object of the namespace whose threshold needs to be updated
   *
   * @returns {void}
   */
  openUpdateThresholdModal(namespacesTrend: MetricNamespaceTrend): void {
    this.editModalProps = {
      thresholdValue: namespacesTrend.threshold,
      metricName: this.metric?.name,
      analyzerKey: namespacesTrend.key,
      metricShortcode: this.$route.params.metric,
      repositoryId: this.repository.id,
      unit: this.metric?.unit
    }
    this.showUpdateThresholdModal = true
  }

  /**
   * Updates the threshold of a namespace.
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
          metricShortcode: this.$route.params.metric,
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
        this.refetch()
      }
    } else {
      this.$toast.danger('An error occured while updating repository metrics.')
    }
  }

  /**
   * Updates the threshold of a namespace to `null`, effectively deleting it.
   *
   * @param {MetricNamespace} namespace - Object of the namespace whose threshold needs to be updated
   *
   * @returns {Promise<void>}
   */
  async deleteThreshold(namespacesTrend: MetricNamespaceTrend): Promise<void> {
    await this.editThreshold(null, namespacesTrend.key as string)
  }

  /**
   * Refetch the metric when `$route.params.metric` changes.
   *
   * @returns {Promise<void>}
   */
  async updateFilter(newValue: number): Promise<void> {
    const { provider, owner, repo } = this.$route.params

    this.lastDays = newValue
    this.$localStore.set(`${provider}-${owner}-${repo}`, 'metrics-last-days-filter', newValue)
    await this.refetch()
  }

  /**
   * Watcher for {@link this.$route.params.metric} that refetches metric data on change of metric shortcode.
   *
   * @returns {void}
   */
  @Watch('$route.params.metric')
  fetchNewMetric(): void {
    this.$fetch()
  }

  /**
   * Head hook that sets meta information for a page.
   *
   * @returns {Record<string,string>}
   */
  head(): Record<string, string> {
    const { repo, owner } = this.$route.params
    return {
      title: `${this.metric?.name ? `${this.metric.name} ` : ''}Metric • ${owner}/${repo}`,
      description:
        'DeepSource is an automated code review tool that helps developers automatically find and fix issues in their code.'
    }
  }
}
</script>
