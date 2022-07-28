<template>
  <div
    v-if="repository.metricsCaptured && repository.metricsCaptured.length"
    class="grid grid-cols-1 lg:grid-cols-16-fr"
  >
    <nav
      class="border-b lg:border-r border-ink-200 lg:h-nav-sidebar sticky top-10 lg:top-24 bg-ink-400"
    >
      <ul class="flex flex-row lg:flex-col px-4 pt-2 lg:px-2 gap-x-8 gap-y-1 overflow-x-auto">
        <li v-for="metric in navList" :key="metric.shortcode">
          <nuxt-link
            :to="metric.shortcode"
            class="lg:px-2 lg:py-2.5 lg:hover:bg-ink-300 lg:hover:text-vanilla-100 lg:rounded-md max-w-full text-sm block"
            :class="isMetricActiveRoute(metric.shortcode) ? 'lg:bg-ink-300' : 'text-vanilla-400'"
          >
            <div class="hidden lg:block truncate">
              {{ metric.name }}
            </div>
            <z-tab
              :is-active="isMetricActiveRoute(metric.shortcode)"
              border-active-color="vanilla-400"
              class="lg:hidden whitespace-nowrap"
            >
              <span class="text-sm cursor-pointer">{{ metric.name }}</span>
            </z-tab>
          </nuxt-link>
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
import { MetricTypeChoices, Repository } from '~/types/types'

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
