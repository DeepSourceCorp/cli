<template>
  <nav
    class="flex gap-x-8 lg:flex-col lg:gap-y-4 pt-2 lg:pt-2 overflow-x-auto hide-scroll lg:sticky top-19 border-b lg:border-r border-ink-200 lg:h-nav-sidebar"
  >
    <div class="flex flex-shrink-0 gap-x-8 lg:flex-col lg:gap-y-1 pr-0 pl-4 lg:px-2">
      <!-- Compliance Items -->
      <p class="hidden p-2 text-xs font-semibold tracking-wide uppercase text-slate lg:block">
        Security
      </p>
      <template v-for="item in complianceItems">
        <nuxt-link
          :key="item.label"
          :to="$generateRoute(item.link)"
          class="flex-shrink-0 text-sm rounded-md"
        >
          <span
            class="hidden p-2 rounded-md hover:text-vanilla-100 hover:bg-ink-300 lg:block"
            :class="
              $route.name === `${rootPath}-${item.pathName}` ? 'bg-ink-300' : 'text-vanilla-400'
            "
            >{{ item.label }}</span
          >
          <z-tab
            :is-active="$route.name === `${rootPath}-${item.pathName}`"
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
          class="flex-shrink-0 text-sm rounded-md"
        >
          <span
            class="hidden p-2 rounded-md hover:text-vanilla-100 hover:bg-ink-300 lg:block"
            :class="
              $route.name === `${rootPath}-${item.pathName}` ? 'bg-ink-300' : 'text-vanilla-400'
            "
            >{{ item.label }}</span
          >
          <z-tab
            :is-active="$route.name === `${rootPath}-${item.pathName}`"
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
              $route.name === `${rootPath}-${publicReportsItem.pathName}`
                ? 'bg-ink-300'
                : 'text-vanilla-400'
            "
          >
            <z-icon
              icon="file-pie-chart"
              size="small"
              :color="
                $route.name === `${rootPath}-${publicReportsItem.pathName}`
                  ? 'vanilla-100'
                  : 'vanilla-400'
              "
              class="hover:text-vanilla-100"
            />
            {{ publicReportsItem.label }}
          </span>
          <z-tab
            :is-active="$route.name === `${rootPath}-${publicReportsItem.pathName}`"
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
import { ReportPageT, ReportsTabLink } from '~/types/reportTypes'
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

  get complianceItems(): ReportsTabLink[] {
    return [
      {
        label: 'OWASP Top 10',
        link: [...this.baseLink, ReportPageT.OWASP_TOP_10],
        pathName: ReportPageT.OWASP_TOP_10
      },
      {
        label: 'SANS Top 25',
        link: [...this.baseLink, ReportPageT.SANS_TOP_25],
        pathName: ReportPageT.SANS_TOP_25
      }
    ]
  }

  get insightsItems(): ReportsTabLink[] {
    return [
      {
        label: 'Issue Distribution',
        link: [...this.baseLink, ReportPageT.DISTRIBUTION],
        pathName: ReportPageT.DISTRIBUTION
      }
    ]
  }

  get publicReportsItem(): ReportsTabLink {
    return {
      label: 'Public Reports',
      link: [...this.baseLink, ReportPageT.PUBLIC_REPORTS],
      pathName: ReportPageT.PUBLIC_REPORTS
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
}
</script>
