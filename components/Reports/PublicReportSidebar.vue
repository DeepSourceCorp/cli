<template>
  <aside
    v-outside-click="closeSidebar"
    data-testid="public-report-sidebar"
    class="fixed top-0 z-50 flex-shrink-0 w-64 h-screen px-6 py-6 overflow-y-auto duration-200 border-r hide-scroll lg:sticky space-y-7 md:pt-20 lg:pt-26 lg:px-4 transform-gpu bg-ink-400 border-ink-200 lg:border-none"
    :class="[isOpen ? 'left-0' : '-left-full']"
  >
    <div class="space-y-4">
      <div class="w-15 p-2.5 bg-ink-200 rounded-sm">
        <img :src="ownerLogo" :alt="`${ownerLogin} logo`" width="42" />
      </div>
      <h1 class="text-vanilla-200 text-1.5xl font-semibold break-words">
        {{ ownerLogin }}
      </h1>
    </div>

    <div class="flex flex-col gap-y-3">
      <span class="text-xs font-semibold tracking-wider uppercase text-slate">Reports</span>
      <nuxt-link
        v-for="report in reports"
        :key="report"
        :to="`/report/${reportId}/${report}`"
        :class="$route.name === `report-reportId-${report}` ? 'text-vanilla-100' : 'text-slate'"
        class="text-sm font-medium hover:text-vanilla-100"
      >
        {{ ReportMeta[report].title }}
      </nuxt-link>
    </div>

    <z-divider color="ink-200" margin="my-0" />

    <div class="flex flex-col text-sm font-semibold gap-y-3 text-slate">
      <a
        v-for="sidebarLink in sidebarLinks"
        :key="sidebarLink.link"
        :href="sidebarLink.link"
        :class="$route.hash === sidebarLink.link ? 'text-vanilla-100' : 'text-slate'"
        class="hover:text-vanilla-100"
      >
        — {{ sidebarLink.title }}
      </a>
    </div>

    <template v-if="repositoryList && repositoryList.length">
      <z-divider color="ink-200" margin="my-0" />
      <div class="flex flex-col gap-y-3">
        <span class="text-xs font-semibold tracking-wider uppercase text-slate">
          {{ repositoryList.length > 1 ? 'Repositories' : 'Repository' }}
        </span>
        <div class="flex flex-wrap gap-2">
          <z-tag
            v-for="repo in repositoryList"
            :key="repo.id"
            size="x-small"
            :icon-left="repo.isPrivate ? 'lock' : 'globe'"
            bg-color="ink-200"
            class="gap-x-1 text-vanilla-300 cursor"
          >
            <span
              v-tooltip="{ content: repo.name, delay: { show: 0, hide: 100 } }"
              class="truncate max-w-24"
            >
              {{ repo.name }}
            </span>
          </z-tag>
        </div>
      </div>
    </template>
  </aside>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

import { ZDivider, ZTag } from '@deepsourcelabs/zeal'
import { ReportPageT, ReportMeta } from '~/types/reportTypes'
import { Repository } from '~/types/types'
import { containsElement } from '~/utils/ui'

/**
 * Sidebar component for public report page
 */
@Component({ components: { ZDivider, ZTag } })
export default class PublicReportSidebar extends Vue {
  @Prop({ required: true })
  reports: Array<ReportPageT>

  @Prop({ default: () => [] })
  repositoryList: Array<Repository>

  @Prop({ default: '' })
  ownerLogo: string

  @Prop({ default: '' })
  ownerLogin: string

  isOpen = false

  ReportMeta = ReportMeta

  /**
   * Mounted hook for the component. Binds listeners for events and fetches repository count.
   *
   * @returns {void}
   */
  mounted(): void {
    this.$root.$on('ui:show-public-report-sidebar', () => {
      this.toggleSidebar(true)
    })
  }

  /**
   * Before destroy hook for the component. Unbinds listeners for events.
   *
   * @returns {void}
   */
  beforeDestroy(): void {
    this.$root.$off('ui:show-public-report-sidebar')
  }

  get sidebarLinks() {
    return [
      {
        title: 'Summary',
        link: '#summary'
      },
      {
        title: 'Intended use',
        link: '#intended-use'
      },
      {
        title: 'About DeepSource',
        link: '#about'
      }
    ]
  }

  /**
   * Toggles between sidebar's `open` and `close` states.
   *
   * @returns {void}
   */
  toggleSidebar(newIsOpen: boolean): void {
    // console.log('NEW IS OPEN ', newIsOpen)

    this.isOpen = newIsOpen ?? !this.isOpen
    // console.log('IS OPEN ', this.isOpen)
    if (!process.client) return

    if (newIsOpen) {
      document.body.classList.add('no-scroll')
    } else {
      document.body.classList.remove('no-scroll')
    }
  }

  /**
   * Closes the sidebar menu on mobile view.
   *
   * @param {Event} event
   * @returns {void}
   */
  closeSidebar(event: Event): void {
    const target = event.target as HTMLElement
    const toggleButton = document.getElementById('mobile-sidebar-toggle')

    if (!toggleButton) {
      this.toggleSidebar(false)
    } else if (!containsElement(toggleButton, target) && target.id !== 'mobile-sidebar-toggle') {
      this.toggleSidebar(false)
    }
  }

  get reportId() {
    return this.$route.params.reportId
  }
}
</script>

<style scoped>
.max-w-24 {
  max-width: 6rem;
}
</style>
