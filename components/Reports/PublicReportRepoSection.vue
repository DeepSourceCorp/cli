<template>
  <div class="space-y-3">
    <span class="text-xs font-semibold tracking-wider uppercase text-slate">
      {{ repositoryList.length > 1 ? 'Repositories' : 'Repository' }}
    </span>
    <div class="text-sm text-vanilla-400 leading-6">
      <div v-if="repoListLoading && currentPage === 1" class="flex flex-wrap gap-x-1.5 gap-y-2">
        <div
          v-for="idx in defaultRepoVisible"
          :key="idx"
          class="animate-pulse bg-ink-200 rounded-full h-7 w-24"
        ></div>
      </div>

      <template v-else-if="Array.isArray(repositoryList) && repositoryList.length">
        <div class="flex flex-wrap gap-x-1.5 gap-y-2">
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
          <span
            v-if="totalCount > defaultRepoVisible"
            class="py-1 px-3 rounded-full h-7 border border-slate-400 leading-5"
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
              class="py-1 px-3 mt-4 border border-slate-400 hover:bg-ink-200"
              @click="toggle"
            >
              Show all repositories
            </z-button>
          </template>
          <template #body>
            <div
              class="px-3.5 py-3 space-y-3 max-h-64 overflow-y-auto hide-scroll cursor leading-5"
              @mousewheel.stop="scrollHandler"
            >
              <h6 class="uppercase text-slate tracking-wider text-xs font-semibold">
                Repositories
              </h6>
              <div
                v-for="repo in repositoryList"
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
import { ZButton, ZIcon, ZMenu } from '@deepsource/zeal'
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
    ZMenu,
    ZButton
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
