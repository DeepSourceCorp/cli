<template>
  <div
    v-if="repository.metricsCaptured && repository.metricsCaptured.length"
    class="grid grid-cols-1 lg:grid-cols-16-fr"
  >
    <nav
      class="border-b lg:border-r border-ink-200 lg:h-nav-sidebar sticky top-10 lg:top-24 bg-ink-400"
    >
      <ul
        class="flex flex-row lg:flex-col px-4 pt-2 lg:py-4 lg:px-2 gap-x-8 gap-y-5 overflow-x-auto"
      >
        <li v-for="(metrics, category) in navStruct" :key="category" class="flex flex-col gap-y-1">
          <p class="px-3 text-xs font-semibold text-slate uppercase tracking-wider hidden lg:block">
            {{ category }}
          </p>
          <ul class="flex flex-row lg:flex-col gap-x-8 gap-y-1">
            <li v-for="metric in metrics" :key="metric.shortcode">
              <nuxt-link
                :to="metric.shortcode"
                class="lg:px-3 lg:py-2 lg:hover:bg-ink-200 lg:hover:text-vanilla-100 lg:rounded-md max-w-full text-sm block"
                :class="{
                  'lg:bg-ink-200': isMetricActiveRoute(metric.shortcode),
                  'text-vanilla-400': !isMetricActiveRoute(metric.shortcode)
                }"
              >
                <div class="hidden lg:block truncate">
                  {{ metric.name }}
                </div>
                <z-tab
                  :isActive="isMetricActiveRoute(metric.shortcode)"
                  border-active-color="vanilla-400"
                  class="lg:hidden whitespace-nowrap"
                >
                  <span class="text-sm cursor-pointer">{{ metric.name }}</span>
                </z-tab>
              </nuxt-link>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
    <nuxt-child></nuxt-child>
  </div>
  <div v-else class="min-h-98 p-4">
    <lazy-empty-state
      title="Not enough data"
      subtitle="We’re still crunching the numbers before we can show you the metrics. Please come back later!"
      :show-border="true"
      class="h-full flex flex-col justify-center"
    />
  </div>
</template>
<script lang="ts">
// Internals
import { Component, Vue, namespace } from 'nuxt-property-decorator'

// Components
import { ZTab } from '@deepsourcelabs/zeal'

// Store & Type Imports
import { Context } from '@nuxt/types'
import { RepositoryDetailActions } from '~/store/repository/detail'
import { Maybe, Metric, MetricTypeChoices, Repository } from '~/types/types'

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
  ]
})
export default class MetricsPage extends Vue {
  @repoStore.State
  repository: Repository

  get navStruct() {
    /**
     * ? Reducer that generates the routes object for navigational sidebar.
     *
     * ```js
     * {
     *   "category": [
     *     {
     *       "name": "metricName",
     *       "shortcode": "metricShortcode",
     *     }
     *     .
     *     .
     *     .
     *   ],
     *   "category2": [...],
     *   .
     *   .
     *   .
     * }
     * ```
     */
    const routeGenerator = (
      categoriesObject: Record<string, Array<{ shortcode: String; name: String }>>,
      metric: Maybe<Metric>
    ) => {
      const category = metric?.category || 'other'
      const metricData = { name: metric?.name as String, shortcode: metric?.shortcode as String }
      if (!categoriesObject[category]?.length) {
        categoriesObject[category] = []
      }
      categoriesObject[category].push(metricData)
      return categoriesObject
    }

    return this.repository.metricsCaptured?.reduce(
      routeGenerator,
      {} as Record<string, Array<{ shortcode: String; name: String }>>
    )
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
