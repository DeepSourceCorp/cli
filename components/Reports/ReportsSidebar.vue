<template>
  <nav
    class="lg:w-64 flex gap-x-8 lg:flex-col lg:gap-y-4 pt-2 lg:pt-2 overflow-x-auto hide-scroll lg:sticky top-19 border-b lg:border-b-0 lg:border-r border-ink-200 lg:h-nav-sidebar"
  >
    <div class="flex flex-shrink-0 gap-x-8 lg:flex-col lg:gap-y-1 pr-0 pl-4 lg:px-2">
      <!-- Compliance Items -->
      <p class="hidden p-2 text-xs font-semibold tracking-wide uppercase text-slate lg:block">
        Security
      </p>
      <template v-for="item in complianceItems">
        <nuxt-link
          v-if="showReport(item.key)"
          :key="item.key"
          :to="$generateRoute(item.link)"
          class="flex-shrink-0 text-sm rounded-md"
        >
          <span
            class="hidden p-2 rounded-md hover:text-vanilla-100 hover:bg-ink-300 lg:block"
            :class="$route.name === `${rootPath}-${item.key}` ? 'bg-ink-300' : 'text-vanilla-400'"
            >{{ item.label }}</span
          >
          <z-tab
            :is-active="$route.name === `${rootPath}-${item.key}`"
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
          v-if="showReport(item.key)"
          :key="item.key"
          :to="$generateRoute(item.link)"
          class="flex-shrink-0 text-sm rounded-md"
        >
          <span
            class="hidden p-2 rounded-md hover:text-vanilla-100 hover:bg-ink-300 lg:block"
            :class="$route.name === `${rootPath}-${item.key}` ? 'bg-ink-300' : 'text-vanilla-400'"
            >{{ item.label }}</span
          >
          <z-tab
            :is-active="$route.name === `${rootPath}-${item.key}`"
            border-active-color="vanilla-400"
            class="lg:hidden"
          >
            <span class="text-sm cursor-pointer">{{ item.label }}</span>
          </z-tab>
        </nuxt-link>
      </template>
    </div>

    <template v-if="showPublicReports">
      <z-divider class="hidden lg:block" margin="my-0" />
      <div class="flex-shrink-0 pl-0 pr-4 lg:px-2">
        <!-- Public Reports -->
        <nuxt-link
          :key="publicReportsItem.label"
          :to="$generateRoute(publicReportsItem.link)"
          class="flex-shrink-0 text-sm rounded-md"
        >
          <span
            class="hidden p-2 rounded-md hover:text-vanilla-100 hover:bg-ink-300 lg:flex lg:items-center lg:gap-x-2"
            :class="
              $route.name === `${rootPath}-${publicReportsItem.key}`
                ? 'bg-ink-300'
                : 'text-vanilla-400'
            "
          >
            <z-icon
              icon="file-pie-chart"
              size="small"
              :color="
                $route.name === `${rootPath}-${publicReportsItem.key}`
                  ? 'vanilla-100'
                  : 'vanilla-400'
              "
              class="hover:text-vanilla-100"
            />
            {{ publicReportsItem.label }}
          </span>
          <z-tab
            :is-active="$route.name === `${rootPath}-${publicReportsItem.key}`"
            icon="file-pie-chart"
            border-active-color="vanilla-400"
            class="lg:hidden"
          >
            <span class="text-sm cursor-pointer">{{ publicReportsItem.label }}</span>
          </z-tab>
        </nuxt-link>
      </div>
    </template>
  </nav>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

import { ZDivider, ZTab, ZIcon } from '@deepsourcelabs/zeal'
import { ReportMeta, ReportPageT, ReportsTabLink } from '~/types/reportTypes'
import { ReportLevel } from '~/types/types'

/**
 * Sidebar component for public report page
 */
@Component({ components: { ZDivider, ZTab, ZIcon } })
export default class ReportsSidebar extends Vue {
  @Prop({ required: true })
  level: ReportLevel

  @Prop({ required: true })
  showPublicReports: boolean

  @Prop({ default: () => [] })
  hiddenReports: Array<ReportPageT>

  get complianceItems(): ReportsTabLink[] {
    return [
      {
        key: ReportPageT.OWASP_TOP_10,
        label: ReportMeta['owasp-top-10'].title,
        link: [...this.baseLink, ReportPageT.OWASP_TOP_10]
      },
      {
        key: ReportPageT.SANS_TOP_25,
        label: ReportMeta['sans-top-25'].title,
        link: [...this.baseLink, ReportPageT.SANS_TOP_25]
      }
    ]
  }

  get insightsItems(): ReportsTabLink[] {
    return [
      {
        key: ReportPageT.CODE_COVERAGE,
        label: ReportMeta['code-coverage'].title,
        link: [...this.baseLink, ReportPageT.CODE_COVERAGE]
      },
      {
        key: ReportPageT.DISTRIBUTION,
        label: ReportMeta['issue-distribution'].title,
        link: [...this.baseLink, ReportPageT.DISTRIBUTION]
      }
    ]
  }

  get publicReportsItem(): ReportsTabLink {
    return {
      key: ReportPageT.PUBLIC_REPORTS,
      label: ReportMeta['public-reports'].title,
      link: [...this.baseLink, ReportPageT.PUBLIC_REPORTS]
    }
  }

  get baseLink(): Array<string> {
    if (this.level === ReportLevel.Repository) {
      return ['reports']
    } else if (this.level === ReportLevel.Owner) {
      return ['settings', 'reports']
    } else {
      return []
    }
  }

  get rootPath(): string {
    // !Note Update thse routes when moving to new Team Layout

    if (this.level === ReportLevel.Repository) {
      return 'provider-owner-repo-reports'
    } else if (this.level === ReportLevel.Owner) {
      return 'provider-owner-settings-reports'
    } else {
      return ''
    }
  }

  /**
   * Method to check whether to show the report or not
   *
   * @param {ReportPageT} reportKey
   */
  showReport(reportKey: ReportPageT): boolean {
    if (this.hiddenReports.length < 1) return true

    return !this.hiddenReports.includes(reportKey)
  }
}
</script>
