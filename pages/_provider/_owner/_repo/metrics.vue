<template>
  <div
    v-if="repository.metricsCaptured && repository.metricsCaptured.length"
    class="grid grid-cols-1 lg:grid-cols-16-fr"
  >
    <nav
      class="hidden border-b lg:block lg:sticky lg:border-r border-ink-200 lg:h-nav-sidebar top-10 lg:top-24 bg-ink-400"
    >
      <ul class="flex flex-col px-2 pt-2 overflow-x-auto gap-x-8 gap-y-1">
        <li v-for="metric in navList" :key="metric.shortcode">
          <nuxt-link
            :to="metric.shortcode"
            class="px-2 py-2.5 hover:bg-ink-300 lg:hover:text-vanilla-100 rounded-md max-w-full text-sm block"
            :class="isMetricActiveRoute(metric.shortcode) ? 'bg-ink-300' : 'text-vanilla-400'"
          >
            <div class="truncate">
              {{ metric.name }}
            </div>
          </nuxt-link>
        </li>
      </ul>
    </nav>

    <nuxt-child class="mb-28 lg:mb-0" />

    <floating-button-mobile :nav-items="navListForMobile" />
  </div>
  <div v-else class="p-4 min-h-98">
    <lazy-empty-state
      title="Not enough data"
      :webp-image-path="require('~/assets/images/ui-states/metrics/no-data-found-136px.webp')"
      :png-image-path="require('~/assets/images/ui-states/metrics/no-data-found-136px.png')"
      :show-border="true"
      class="flex flex-col justify-center h-full"
    >
      <template #subtitle>
        We do not have enough data to show a trend yet. <br class="hidden md:block" />
        Please come back later.
      </template>
    </lazy-empty-state>
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
  ],
  scrollToTop: true
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

  get navListForMobile() {
    return this.navList.map((item) => {
      return {
        label: item.name ?? '',
        routePath: this.$generateRoute(['metrics', item.shortcode ?? ''])
      }
    })
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
