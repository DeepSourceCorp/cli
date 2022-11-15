<template>
  <div class="space-y-3">
    <span class="text-xs font-semibold tracking-wider uppercase text-slate">
      {{ repositoryList.length > 1 ? 'Repositories' : 'Repository' }}
    </span>
    <div class="flex flex-wrap gap-x-1.5 gap-y-2 text-sm text-vanilla-400 leading-6">
      <template v-if="repoListLoading && currentPage === 1">
        <div
          v-for="idx in defaultRepoVisible"
          :key="idx"
          class="animate-pulse bg-ink-200 rounded-full h-7 w-24"
        ></div>
      </template>

      <template v-else>
        <div
          v-for="repo in repositoryList.slice(0, defaultRepoVisible)"
          :key="repo.id"
          class="inline-flex items-center rounded-full gap-x-1 cursor py-1 px-2.5 bg-ink-200"
        >
          <z-icon :icon="repo.isPrivate ? 'z-lock' : 'globe'" />
          <span
            v-tooltip="{ content: repo.name, delay: { show: 0, hide: 100 } }"
            class="truncate max-w-3xs"
          >
            {{ repo.name }}
          </span>
        </div>
        <z-menu
          v-if="repositoryList.length > defaultRepoVisible"
          width="small"
          placement="top"
          direction="left"
          items-z-class="z-50"
        >
          <template v-slot:trigger="{ toggle, isOpen }">
            <button
              class="py-1 px-3 rounded-full h-7 border border-ink-200 hover:bg-ink-200"
              :class="isOpen && 'bg-ink-200'"
              @click="toggle"
            >
              +{{ totalCount - 5 }}
            </button>
          </template>
          <template slot="body">
            <div
              @mousewheel.stop="scrollHandler"
              class="px-3.5 py-3 space-y-3 max-h-64 overflow-y-auto hide-scroll cursor leading-5"
            >
              <h6 class="uppercase text-slate tracking-wider text-xs font-semibold">
                Repositories
              </h6>
              <div
                v-for="repo in repositoryList.slice(defaultRepoVisible)"
                :key="repo.id"
                class="text-sm text-vanilla-400 flex items-center gap-x-2"
              >
                <z-icon :icon="repo.isPrivate ? 'z-lock' : 'globe'" class="flex-shrink-0" />
                <span
                  v-tooltip="{ content: repo.name, delay: { show: 0, hide: 100 } }"
                  class="truncate"
                >
                  {{ repo.name }}
                </span>
              </div>
              <template v-if="repoListLoading">
                <div v-for="idx in perPageCount" :key="idx" class="w-40 flex items-center gap-x-2">
                  <div class="h-4 bg-ink-200 animate-pulse w-4 rounded-sm"></div>
                  <div class="h-4 bg-ink-200 animate-pulse flex-grow rounded-sm"></div>
                </div>
              </template>
            </div>
          </template>
        </z-menu>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZMenu } from '@deepsourcelabs/zeal'
import publicReportRepoList from '@/apollo/queries/reports/publicReportRepoList.gql'
import { Repository } from '~/types/types'
import PaginationMixin from '~/mixins/paginationMixin'
import { GraphqlQueryResponse } from '~/types/apolloTypes'
import { resolveNodes } from '~/utils/array'

/**
 * Repo list component with popover to show paginated repo list
 */
@Component({
  components: {
    ZIcon,
    ZMenu
  }
})
export default class PublicReportRepoSection extends mixins(PaginationMixin) {
  @Prop({ required: true })
  reportId: number

  @Prop({ default: '' })
  token: string

  defaultRepoVisible = 5
  repositoryList: Array<Repository> = []
  repoListLoading = false
  perPageCount = 15

  /**
   * Mounted hook for vue component. Triggers first fetch of repo list.
   *
   * @returns {void}
   */
  mounted(): void {
    this.fetchPublicReportRepoList()
  }

  /**
   * Method that makes graphql query to fetch l
   * Used to get list of repos that were already selected by user.
   *
   * @returns {Promise<void>}
   */
  async fetchPublicReportRepoList(): Promise<void> {
    if (
      this.totalCount > 0 &&
      (this.repositoryList.length === this.totalCount || this.queryOffset >= this.totalCount)
    ) {
      return
    }

    try {
      this.repoListLoading = true
      const first = this.perPageCount
      const offset = this.queryOffset
      const reportId = this.reportId
      const token = this.token

      const response = (await this.$fetchGraphqlData(publicReportRepoList, {
        reportId,
        token,
        first,
        offset
      })) as GraphqlQueryResponse

      this.totalCount = response.data.publicReport?.sourcedRepositories?.totalCount ?? 0

      const newRepoList = resolveNodes(
        response.data.publicReport?.sourcedRepositories
      ) as Array<Repository>

      this.repositoryList = [...this.repositoryList, ...newRepoList]
    } catch (e) {
      this.$logErrorAndToast(e as Error, 'Unable to fetch report details. Please contact support.')
    } finally {
      this.repoListLoading = false
    }
  }

  /**
   * Handler method for scroll event. Triggers fetching of repo list.
   *
   * @returns {void}
   */
  scrollHandler(): void {
    this.currentPage += 1
    this.fetchPublicReportRepoList()
  }
}
</script>
