<template>
  <div
    v-if="repository.metricsCaptured && repository.metricsCaptured.length"
    class="metrics-page-container grid grid-cols-1 lg:grid-cols-16-fr"
  >
    <nav
      class="lg:top-24.5 lg:h-metrics-sidebar top-10 hidden border-b border-slate-400 bg-ink-400 lg:sticky lg:block lg:border-r"
    >
      <ul class="flex flex-col gap-x-8 gap-y-1 overflow-x-auto px-2 pt-2">
        <li v-for="metric in navList" :key="metric.shortcode">
          <nuxt-link
            :to="metric.shortcode"
            class="block max-w-full rounded-md px-2 py-2.5 text-sm hover:bg-ink-300 lg:hover:text-vanilla-100"
            :class="isMetricActiveRoute(metric.shortcode) ? 'bg-ink-300' : 'text-vanilla-400'"
          >
            <div class="truncate">
              {{ metric.name }}
            </div>
          </nuxt-link>
        </li>
      </ul>
    </nav>

    <nuxt-child :repo-metric-settings="repositoryMetricSettings" class="mb-28 lg:mb-0" />

    <floating-button-mobile :nav-items="navListForMobile" />
  </div>
  <div v-else class="min-h-98 p-4">
    <lazy-empty-state
      :webp-image-path="require('~/assets/images/ui-states/metrics/no-data-found-136px.webp')"
      :png-image-path="require('~/assets/images/ui-states/metrics/no-data-found-136px.png')"
      title="Waiting for data"
      subtitle="We haven’t received any data to show this metric. Please create a new commit to the default branch to kick things off!"
      class="flex h-full flex-col justify-center"
    />
  </div>
</template>
<script lang="ts">
// Internals
import { Component, Vue, namespace } from 'nuxt-property-decorator'

// Components
import { ZTab } from '@deepsource/zeal'

// Store, Queries & Type Imports
import { Context } from '@nuxt/types'
import { RepositoryDetailActions } from '~/store/repository/detail'
import RepositoryReportingMetricSettings from '~/apollo/queries/repository/settings/metricSettings.gql'
import { MetricSetting, MetricTypeChoices, Repository } from '~/types/types'
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'

const repoStore = namespace('repository/detail')

/**
 * Metrics parent page that provides the sidebar to metrics
 * and acts as a safety middleware for automatically determining an available metric.
 */
@Component({
  components: {
    ZTab
  },
  layout: 'repository',
  middleware: [
    async function ({
      store,
      route: { params, name: routeName },
      redirect
    }: Context): Promise<void> {
      if (routeName === 'provider-owner-repo-metrics') {
        const { repo: repoName, provider, owner } = params
        if (!(store.state.repository.detail.repository as Repository).metricsCaptured?.length) {
          await store.dispatch(`repository/detail/${RepositoryDetailActions.FETCH_METRICS}`, {
            provider,
            owner,
            name: repoName,
            metricType: MetricTypeChoices.DefaultBranchOnly,
            refetch: true
          })
        }

        const firstMetric = store.state.repository.detail.repository.metricsCaptured?.[0]

        if (firstMetric) {
          redirect(302, `/${provider}/${owner}/${repoName}/metrics/${firstMetric.shortcode}`)
        }
      }
    }
  ],
  scrollToTop: true
})
export default class MetricsPage extends Vue {
  @repoStore.State
  repository: Repository

  repositoryMetricSettings: MetricSetting[] = []

  get navList() {
    if (Array.isArray(this.repository.metricsCaptured) && this.repository.metricsCaptured.length) {
      return this.repository.metricsCaptured.map((metric) => {
        return {
          name: metric?.name ?? '',
          shortcode: metric?.shortcode ?? ''
        }
      })
    }

    return []
  }

  get navListForMobile() {
    return this.navList.map((item) => {
      return {
        label: item.name ?? '',
        routePath: this.$generateRoute(['metrics', item.shortcode ?? ''])
      }
    })
  }

  /**
   * Fetch hook for the metrics page.
   * ! Fetches the metrics enabled/disabled logic, so the child page can compute if the metric is disabled or not.
   */
  async fetch() {
    const { provider, owner, repo: name } = this.$route.params

    try {
      const response = (await this.$fetchGraphqlData(RepositoryReportingMetricSettings, {
        provider: this.$providerMetaMap[provider].value,
        owner,
        name
      })) as GraphqlQueryResponse

      if (response.data.repository?.metricSettings?.length) {
        this.repositoryMetricSettings.push(
          ...(response.data.repository.metricSettings as MetricSetting[])
        )
      }
    } catch (e) {
      this.$logErrorAndToast(e as Error)
    }
  }

  /**
   * Returns a boolean which indicates if the provided shortcode is of the active route or not.
   *
   * @param {string} metricShortcode - Shortcode of a Metric
   *
   * @returns {boolean}
   */
  isMetricActiveRoute(metricShortcode: string): boolean {
    const { provider, owner, repo } = this.$route.params

    return this.$route.path === `/${provider}/${owner}/${repo}/metrics/${metricShortcode}`
  }

  /**
   * Head hook that sets meta information for a page.
   *
   * @returns {Record<string,string>}
   */
  head(): Record<string, string> {
    const { repo, owner } = this.$route.params
    return {
      title: `Metrics • ${owner}/${repo}`,
      description:
        'DeepSource is an automated code review tool that helps developers automatically find and fix issues in their code.'
    }
  }
}
</script>

<style scoped lang="postcss">
@tailwind utilities;

.metrics-page-container {
  --repo-header-height: 97px;
}

@media screen(lg) {
  .lg\:top-24.5 {
    top: var(--repo-header-height);
  }

  .lg\:h-metrics-sidebar {
    height: calc(100vh - var(--repo-header-height));
  }
}
</style>
