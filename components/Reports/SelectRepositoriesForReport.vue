<template>
  <div class="p-4 pb-0 space-y-4">
    <z-input
      v-model="query"
      :show-border="false"
      icon="search"
      background-color="ink-200"
      size="small"
      placeholder="Search for a repository..."
      class="w-full"
      @debounceInput="handleSearch"
    >
      <template #left>
        <z-icon icon="search" class="ml-1.5" />
      </template>
    </z-input>

    <div ref="reportSelectRepositoryList" class="h-96 overflow-y-auto pb-5" @scroll="onScroll">
      <div v-if="repoList.length" class="space-y-2.5">
        <z-checkbox
          v-for="repo in repoList"
          :model-value="selectedRepos"
          :value="repo.id"
          :key="repo.id"
          :label="`${repo.ownerLogin} / ${repo.name}`"
          size="small"
          class="cursor-pointer hover:text-vanilla-100"
          @change="handleCheckboxSelection"
        />
      </div>
      <div v-if="repoListLoading" class="space-y-4 pt-px mt-4">
        <div v-for="idx in 8" :key="idx" class="w-72 flex items-center gap-x-2">
          <div class="h-4 bg-ink-200 animate-pulse w-4 rounded-sm"></div>
          <div class="h-4 bg-ink-200 animate-pulse flex-grow rounded-sm"></div>
        </div>
      </div>
      <lazy-empty-state
        v-else-if="query.length"
        :title="`No results found for '${query}'.`"
        :webp-image-path="require('~/assets/images/ui-states/directory/empty-search.webp')"
        :png-image-path="require('~/assets/images/ui-states/directory/empty-search.gif')"
        subtitle="Please try changing your search query."
        class="py-4"
      />

      <div
        v-if="
          !repoListLoading &&
          totalPageCount > 1 &&
          repoList.length > 0 &&
          repoList.length < totalCount
        "
        class="flex justify-center mt-5"
      >
        <z-button
          label="Show more"
          button-type="ghost"
          color="vanilla-100"
          size="small"
          class="bg-ink-200"
          @click="showMore"
        />
      </div>

      <button
        v-show="scrollTopVisible"
        class="fixed left-1/2 bottom-19 transform -translate-x-1/2 flex gap-1 items-center text-xs font-medium leading-4 rounded-full py-1.5 px-3.5 bg-ink-200 shadow-double-dark"
        @click="resetRepoListScroll"
      >
        <z-icon icon="arrow-up" color="vanilla-100" size="x-small" />
        Back to top
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins, Prop } from 'nuxt-property-decorator'
import { ZInput, ZIcon, ZCheckbox, ZButton } from '@deepsourcelabs/zeal'

import PaginationMixin from '~/mixins/paginationMixin'
import { resolveNodes } from '~/utils/array'

// Made a new query because, while editing the report, we need to know whether each repo
// has already been selected under a particular report.
import { publicReportSourceableRepositories } from '~/apollo/queries/reports/publicReportSourceableRepositories.gql'

import {
  PublicReportSourceableRepositoriesQueryVariables,
  SourceableRepository
} from '~/types/types'
import { GraphqlQueryResponse } from '~/types/apolloTypes'

/**
 * Component that contains repository selection UI for mutate owner report modal
 */
@Component({
  components: {
    ZInput,
    ZIcon,
    ZCheckbox,
    ZButton
  }
})
export default class SelectRepositoriesForReport extends mixins(PaginationMixin) {
  @Prop({ required: true })
  ownerLogin: string

  @Prop({ required: true })
  vcsProvider: string

  @Prop({ required: true })
  editMode: boolean

  @Prop({ default: '' })
  reportId: string

  selectedRepos: Array<string> = []
  unSelectedRepos: Array<string> = []
  repoList: Array<SourceableRepository> = []
  repoListLoading = false
  query = ''
  perPageCount = 20
  scrollTopVisible = false

  /**
   * Fetch hook that fetches list of repos
   */
  async fetch() {
    try {
      this.repoListLoading = true

      const args: PublicReportSourceableRepositoriesQueryVariables = {
        vcsProvider: this.$providerMetaMap[this.vcsProvider].value,
        ownerLogin: this.ownerLogin,
        publicReportId: this.reportId,
        first: this.perPageCount,
        offset: this.queryOffset,
        q: this.query
      }

      const response = (await this.$fetchGraphqlData(
        publicReportSourceableRepositories,
        args,
        true
      )) as GraphqlQueryResponse

      this.totalCount = response.data.publicReportSourceableRepositories?.totalCount ?? 0

      const newRepoList = resolveNodes(
        response.data.publicReportSourceableRepositories
      ) as Array<SourceableRepository>

      this.repoList = [...this.repoList, ...newRepoList]

      this.selectedRepos = Array.from(
        new Set([...this.selectedRepos, ...this.alreadySelectedRepos(newRepoList)])
      )
    } catch (e) {
      this.$logErrorAndToast(e as Error, 'Unable to fetch repository list. Please contact support.')
    } finally {
      this.repoListLoading = false
    }
  }

  /**
   * Scroll event handler for the repo list container.
   * Controls visibility of scroll-to-top button.
   *
   * @returns {void}
   */
  onScroll(e: Event): void {
    const { clientHeight, scrollHeight, scrollTop } = e.target as HTMLElement

    //  Calculation below has been done through trial and error
    // ! Update this anytime HTML markup of this component is updated.
    this.scrollTopVisible = scrollHeight - (clientHeight + scrollTop) >= 50 && scrollTop > 10
  }

  /**
   * Reset scroll for the repo list container
   *
   * @returns {void}
   */
  resetRepoListScroll(): void {
    const parentDiv = this.$refs.reportSelectRepositoryList as HTMLElement

    if (parentDiv) {
      parentDiv.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }

  /**
   * Trigger fetch of next list of repos
   *
   * @returns {void}
   */
  showMore(): void {
    this.updatePageNum(this.currentPage + 1)
  }

  /**
   * Reset repoList and page no before fetching search results
   *
   * @returns {void}
   */
  handleSearch(): void {
    this.repoList = []
    this.currentPage = 1
    this.$fetch()
  }

  /**
   * Handler method for checkbox selection/deselection event.
   * Emits add-repo and remove-repo accordingly.
   *
   * @param {Array<string>} newSelectedRepos
   * @returns {void}
   */
  handleCheckboxSelection(newSelectedRepos: Array<string>): void {
    // Check which repos that were already selected but are not present in selected repos list anymore
    const removedRepos = this.selectedRepos.filter((repoId) => !newSelectedRepos.includes(repoId))

    // Check which repos which were not already selected but now are present in selected repos list
    const addedRepos = newSelectedRepos.filter((repoId) => !this.selectedRepos.includes(repoId))

    if (removedRepos.length) {
      this.$emit('remove-repo', removedRepos)
    }

    if (addedRepos.length) {
      this.$emit('add-repo', addedRepos)

      // Removed just selected repo from unselected repos
      this.unSelectedRepos = this.unSelectedRepos.filter((repoId) => !addedRepos.includes(repoId))
    }

    this.selectedRepos = newSelectedRepos

    // Need to maintain state of un selected repos, so on refetching repoList context of un selected repos is not lost
    this.unSelectedRepos = [...this.unSelectedRepos, ...removedRepos]
  }

  /**
   * Method that returns repos with isSourced field as true.
   * Used to get list of repos that were already selected by user.
   *
   * @param {Array<SourceableRepository>} newRepoList
   * @returns {Array<string>}
   */
  alreadySelectedRepos(newRepoList: Array<SourceableRepository>): Array<string> {
    if (!this.editMode) return []

    const selectedRepos: Array<string> = []

    newRepoList.forEach(
      (repo) =>
        repo.isSourced && !this.unSelectedRepos.includes(repo.id) && selectedRepos.push(repo.id)
    )

    return selectedRepos
  }
}
</script>
