<template>
  <section class="grid grid-cols-1 lg:grid-cols-16-fr">
    <nav
      class="flex px-4 pt-2 overflow-x-auto border-b gap-x-8 top-19 hide-scroll border-ink-200 lg:sticky lg:flex-col lg:gap-y-1 lg:p-2 lg:border-r lg:h-nav-sidebar"
    >
      <p class="hidden p-2 text-xs font-semibold tracking-wide uppercase text-slate lg:block">
        Security
      </p>
      <!-- Compliance Items -->
      <template v-for="item in complianceItems">
        <nuxt-link
          :key="item.label"
          :to="$generateRoute(item.link)"
          class="flex-shrink-0 text-sm rounded-md group hover:bg-ink-300"
        >
          <span
            class="hidden p-2 rounded-md group-hover:text-vanilla-100 lg:block"
            :class="
              $route.name === `provider-owner-settings-reports-${item.pathName}`
                ? 'bg-ink-300'
                : 'text-vanilla-400'
            "
            >{{ item.label }}</span
          >
          <z-tab
            :is-active="$route.name === `provider-owner-settings-reports-${item.pathName}`"
            border-active-color="vanilla-400"
            class="lg:hidden"
          >
            <span class="text-sm cursor-pointer">{{ item.label }}</span>
          </z-tab>
        </nuxt-link>
      </template>

      <!-- Insights items -->
      <p class="hidden p-2 text-xs font-semibold tracking-wide uppercase text-slate lg:block">
        Insights
      </p>
      <template v-for="item in insightsItems">
        <nuxt-link
          :key="item.label"
          :to="$generateRoute(item.link)"
          class="flex-shrink-0 text-sm rounded-md group hover:bg-ink-300"
        >
          <span
            class="hidden p-2 rounded-md group-hover:text-vanilla-100 lg:block"
            :class="
              $route.name === `provider-owner-settings-reports-${item.pathName}`
                ? 'bg-ink-300'
                : 'text-vanilla-400'
            "
            >{{ item.label }}</span
          >
          <z-tab
            :is-active="$route.name === `provider-owner-settings-reports-${item.pathName}`"
            border-active-color="vanilla-400"
            class="lg:hidden"
          >
            <span class="text-sm cursor-pointer">{{ item.label }}</span>
          </z-tab>
        </nuxt-link>
      </template>
    </nav>
    <div class="flex flex-col p-4 gap-y-2">
      <page-title
        :title="reportTitle"
        class="flex-col md:flex-row gap-y-4"
        description-width-class="max-w-xl"
      >
        <template slot="description">
          <p class="mt-2 text-sm text-vanilla-400">{{ reportDescription }}</p>
        </template>
      </page-title>
      <nuxt-child class="mb-24 -mt-4 sm:mt-0" />
    </div>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { ZTab, ZButton, ZIcon, ZMenu, ZMenuItem, ZSplitButtonDropdown } from '@deepsourcelabs/zeal'

import { TeamPerms } from '~/types/permTypes'
import { ReportMeta, ReportPageT, ReportsTabLink } from '~/types/reportTypes'

/**
 * Parent page for reports UI.
 */
@Component({
  components: {
    ZTab,
    ZButton,
    ZIcon,
    ZMenu,
    ZMenuItem,
    ZSplitButtonDropdown
  },
  layout: 'dashboard',
  middleware: [
    'perm',
    'teamOnly',
    'betaOnly',
    async function ({ route, redirect }) {
      const { provider, owner } = route.params
      if (route.name === 'provider-owner-settings-reports') {
        redirect(`/${provider}/${owner}/settings/reports/${ReportPageT.OWASP_TOP_10}`)
      }
    }
  ],
  meta: {
    auth: {
      strict: true,
      teamPerms: [TeamPerms.VIEW_REPORTS]
    }
  }
})
export default class OwnerReports extends Vue {
  complianceItems: ReportsTabLink[] = [
    {
      label: 'OWASP Top 10',
      link: ['settings', 'reports', ReportPageT.OWASP_TOP_10],
      pathName: ReportPageT.OWASP_TOP_10
    },
    {
      label: 'SANS Top 25',
      link: ['settings', 'reports', ReportPageT.SANS_TOP_25],
      pathName: ReportPageT.SANS_TOP_25
    }
  ]

  insightsItems: ReportsTabLink[] = [
    {
      label: 'Issue Distribution',
      link: ['settings', 'reports', ReportPageT.DISTRIBUTION],
      pathName: ReportPageT.DISTRIBUTION
    }
  ]

  get activeReportName(): ReportPageT {
    const currentRouteItem =
      [...this.complianceItems, ...this.insightsItems].find(
        (item) => this.$route.name === `provider-owner-settings-reports-${item.pathName}`
      ) ?? this.complianceItems[0]

    return currentRouteItem.pathName
  }

  get reportTitle(): string {
    const metadata = ReportMeta[this.activeReportName]
    return metadata.title
  }

  get reportDescription(): string {
    const metadata = ReportMeta[this.activeReportName]
    return metadata.description
  }

  /**
   * Set meta tags
   *
   * @return {Record<string, string>}
   */
  head(): Record<string, string> {
    const { owner } = this.$route.params
    return {
      title: `Reports • ${owner}`,
      description:
        'DeepSource is an automated code review tool that helps developers automatically find and fix issues in their code.'
    }
  }
}
</script>
