<template>
  <div class="space-y-3">
    <span class="text-xs font-semibold uppercase tracking-wider text-slate">
      {{ repositoryList.length > 1 ? 'Repositories' : 'Repository' }}
    </span>
    <div class="text-sm leading-6 text-vanilla-400">
      <div v-if="repoListLoading && currentPage === 1" class="flex flex-wrap gap-x-1.5 gap-y-2">
        <div
          v-for="idx in defaultRepoVisible"
          :key="idx"
          class="h-7 w-24 animate-pulse rounded-full bg-ink-200"
        ></div>
      </div>

      <template v-else-if="Array.isArray(repositoryList) && repositoryList.length">
        <div class="flex flex-wrap gap-x-1.5 gap-y-2">
          <div
            v-for="repo in repositoryList.slice(0, defaultRepoVisible)"
            :key="repo.id"
            class="cursor inline-flex items-center gap-x-1 rounded-full bg-ink-200 px-2.5 py-1"
          >
            <z-icon :icon="repo.isPrivate ? 'z-lock' : 'globe'" />
            <span
              v-tooltip="{ content: repo.name, delay: { show: 0, hide: 100 } }"
              class="max-w-3xs truncate"
            >
              {{ repo.name }}
            </span>
          </div>
          <span
            v-if="totalCount > defaultRepoVisible"
            class="h-7 rounded-full border border-slate-400 px-3 py-1 leading-5"
          >
            +{{ totalCount - defaultRepoVisible }}
          </span>
        </div>
        <z-menu
          v-if="totalCount > defaultRepoVisible"
          width="small"
          placement="top"
          direction="right"
          items-z-class="z-50"
        >
          <template #trigger="{ toggle, isOpen }">
            <z-button
              :full-width="true"
              button-type="secondary"
              size="small"
              icon="repositories"
              color="vanilla-400"
              icon-color="vanilla-400"
              :class="isOpen && 'bg-ink-200'"
              class="mt-4 border border-slate-400 px-3 py-1 hover:bg-ink-200"
              @click="toggle"
            >
              Show all repositories
            </z-button>
          </template>
          <template #body>
            <div
              class="hide-scroll cursor max-h-64 space-y-3 overflow-y-auto px-3.5 py-3 leading-5"
              @mousewheel.stop="scrollHandler"
            >
              <h6 class="text-xs font-semibold uppercase tracking-wider text-slate">
                Repositories
              </h6>
              <div
                v-for="repo in repositoryList"
                :key="repo.id"
                class="flex items-center gap-x-2 text-sm text-vanilla-400"
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
                <div v-for="idx in perPageCount" :key="idx" class="flex w-40 items-center gap-x-2">
                  <div class="h-4 w-4 animate-pulse rounded-sm bg-ink-200"></div>
                  <div class="h-4 flex-grow animate-pulse rounded-sm bg-ink-200"></div>
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
import publicReportRepoList from '@/apollo/queries/reports/publicReportRepoList.gql'
import { Repository } from '~/types/types'
import PaginationMixin from '~/mixins/paginationMixin'
import { GraphqlQueryResponse } from '~/types/apolloTypes'
import { resolveNodes } from '~/utils/array'

/**
 * Repo list component with popover to show paginated repo list
 */
@Component({})
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

      const newRepoList = resolveNodes(response.data.publicReport?.sourcedRepositories)

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
