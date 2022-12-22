<template>
  <div class="reports-nav-container">
    <nav
      class="lg:w-64 hidden lg:flex gap-x-8 lg:flex-col lg:gap-y-4 pt-2 lg:pt-2 overflow-x-auto hide-scroll lg:sticky border-b lg:border-b-0 lg:border-r border-slate-400"
      :class="atOwnerLevel ? 'vertical-sidebar-owner-level' : 'vertical-sidebar-repository-level'"
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

    <!-- Set `z-index` to a lower value than main sidebar -->
    <floating-button-mobile :nav-items="navItemsForMobile" class="z-40" />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

import { ZDivider, ZTab, ZIcon } from '@deepsource/zeal'
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

  get complianceItems(): ReportsTabLink[] {
    return [
      {
        key: ReportPageT.OWASP_TOP_10,
        label: ReportMeta[ReportPageT.OWASP_TOP_10].title,
        link: [...this.baseLink, ReportPageT.OWASP_TOP_10]
      },
      {
        key: ReportPageT.SANS_TOP_25,
        label: ReportMeta[ReportPageT.SANS_TOP_25].title,
        link: [...this.baseLink, ReportPageT.SANS_TOP_25]
      }
    ]
  }

  get insightsItems(): ReportsTabLink[] {
    return [
      {
        key: ReportPageT.CODE_HEALTH_TREND,
        label: ReportMeta[ReportPageT.CODE_HEALTH_TREND].title,
        link: [...this.baseLink, ReportPageT.CODE_HEALTH_TREND]
      },
      {
        key: ReportPageT.CODE_COVERAGE,
        label: ReportMeta[ReportPageT.CODE_COVERAGE].title,
        link: [...this.baseLink, ReportPageT.CODE_COVERAGE]
      },
      {
        key: ReportPageT.ISSUES_PREVENTED,
        label: ReportMeta[ReportPageT.ISSUES_PREVENTED].title,
        link: [...this.baseLink, ReportPageT.ISSUES_PREVENTED]
      },
      {
        key: ReportPageT.ISSUES_AUTOFIXED,
        label: ReportMeta[ReportPageT.ISSUES_AUTOFIXED].title,
        link: [...this.baseLink, ReportPageT.ISSUES_AUTOFIXED]
      },
      {
        key: ReportPageT.DISTRIBUTION,
        label: ReportMeta[ReportPageT.DISTRIBUTION].title,
        link: [...this.baseLink, ReportPageT.DISTRIBUTION]
      }
    ]
  }

  get publicReportsItem(): ReportsTabLink {
    return {
      key: ReportPageT.PUBLIC_REPORTS,
      label: ReportMeta[ReportPageT.PUBLIC_REPORTS].title,
      link: [...this.baseLink, ReportPageT.PUBLIC_REPORTS]
    }
  }

  get baseLink(): Array<string> {
    if (this.level === ReportLevel.Repository) {
      return ['reports']
    } else if (this.level === ReportLevel.Owner) {
      return ['reports']
    } else {
      return []
    }
  }

  get rootPath(): string {
    if (this.level === ReportLevel.Repository) {
      return 'provider-owner-repo-reports'
    }
    if (this.level === ReportLevel.Owner) {
      return 'provider-owner-reports'
    }
    return ''
  }

  get navItemsForMobile() {
    const visibleNavItems = [
      ...this.complianceItems,
      ...this.insightsItems,
      { ...this.publicReportsItem, separator: true }
    ].filter(({ key }) => this.showReport(key))

    return visibleNavItems.map((item) => {
      return {
        label: item.label,
        routePath: this.$generateRoute(item.link),
        separator: 'separator' in item ? item.separator : false
      }
    })
  }

  get atOwnerLevel(): boolean {
    return this.level === ReportLevel.Owner
  }

  /**
   * Method to check whether to show the report or not
   *
   * @param {ReportPageT} reportKey
   */
  showReport(reportKey: ReportPageT): boolean {
    return ReportMeta[reportKey].level.includes(this.level)
  }
}
</script>

<style scoped>
.reports-nav-container {
  /* The dashboard header comprising of the team avatar, VCS icon, etc. */
  --dashboard-header-height: 53px;

  /* The horizontal navbar as part of `dashboard`` layout */
  --horizontal-navbar-height: 44.5px;

  --repository-header-height: 168px;
}

@media screen and (min-width: 1024px) {
  .vertical-sidebar-owner-level {
    /* The vertical sidebar top position would be the sum of aforementioned values */
    --vertical-sidebar-top-offset: calc(
      var(--dashboard-header-height) + var(--horizontal-navbar-height)
    );

    top: var(--vertical-sidebar-top-offset);
    height: calc(100vh - var(--vertical-sidebar-top-offset));
  }

  .vertical-sidebar-repository-level {
    /* The vertical sidebar top position would be the repository header height */
    --vertical-sidebar-top-offset: var(--repository-header-height);

    top: var(--vertical-sidebar-top-offset);
    height: calc(100vh - var(--vertical-sidebar-top-offset));
  }
}

@media screen and (min-width: 1280px) {
  .vertical-sidebar-repository-level {
    --vertical-sidebar-top-offset: 96px;
  }
}
</style>
