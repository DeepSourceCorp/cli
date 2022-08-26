<template>
  <div class="p-4">
    <!-- min height so that there's pagination component doesn't move up and down when no of repo changes -->
    <div class="min-h-96 space-y-3">
      <z-input
        v-model="query"
        icon="search"
        :show-border="false"
        background-color="ink-200"
        size="small"
        class="w-full"
        @debounceInput="$fetch"
        placeholder="Search for a repository..."
      >
        <template slot="left">
          <z-icon icon="search" size="small" class="ml-1.5"></z-icon>
        </template>
      </z-input>

      <div v-if="repoListLoading" class="space-y-3 pt-px">
        <div v-for="idx in 10" :key="idx" class="h-5 bg-ink-200 animate-pulse pt-px"></div>
      </div>
      <div v-else-if="repoList.length" class="space-y-3">
        <z-checkbox
          v-for="repo in repoList"
          v-model="modelValue"
          :value="repo.id"
          :key="repo.id"
          :label="`${repo.ownerLogin} / ${repo.name}`"
          size="small"
          class="cursor-pointer hover:text-vanilla-100"
        />
      </div>
      <lazy-empty-state
        v-else-if="query.length"
        :title="`No results found for ${query}.`"
        :webp-image-path="require('~/assets/images/ui-states/directory/empty-search.webp')"
        :png-image-path="require('~/assets/images/ui-states/directory/empty-search.png')"
        class="py-4"
      />
    </div>

    <div v-if="totalPageCount > 1" class="flex justify-center text-sm">
      <z-pagination
        :page="currentPage"
        :total-pages="totalPageCount"
        :total-visible="5"
        @selected="updatePageNum"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins, ModelSync } from 'nuxt-property-decorator'
import { ZInput, ZIcon, ZCheckbox, ZPagination } from '@deepsourcelabs/zeal'

import PaginationMixin from '~/mixins/paginationMixin'
import { resolveNodes } from '~/utils/array'

// Made a new query because existing repoList was fetching too much data that was not needed here
import { repoListForReports } from '~/apollo/queries/reports/repoListForReports.gql'

import { Repository } from '~/types/types'
import { GraphqlQueryResponse } from '~/types/apolloTypes'

/**
 * Component that contains repository selection UI for mutate owner report modal
 */
@Component({
  components: {
    ZInput,
    ZIcon,
    ZCheckbox,
    ZPagination
  }
})
export default class SelectRepositoriesForReport extends mixins(PaginationMixin) {
  @ModelSync('selectedRepos', 'updateSelectedRepos', { type: Array, default: 'all' })
  readonly modelValue: Array<string>

  repoList: Array<Repository> = []
  repoListLoading = false
  query = ''
  perPageCount = 10

  /**
   * Fetch hook that fetches list of repos
   */
  async fetch() {
    const { provider, owner: login } = this.$route.params

    try {
      this.repoListLoading = true
      const response = (await this.$fetchGraphqlData(repoListForReports, {
        login,
        provider: this.$providerMetaMap[provider].value,
        isActivated: true,
        first: this.perPageCount,
        offset: this.queryOffset,
        q: this.query
      })) as GraphqlQueryResponse

      this.totalCount = response.data.owner?.repositories?.totalCount ?? 0
      this.repoList = resolveNodes(response.data.owner?.repositories) as Array<Repository>
    } catch (e) {
      this.$logErrorAndToast(e as Error, 'Unable to fetch repository list. Please contact support.')
    } finally {
      this.repoListLoading = false
    }
  }
}
</script>
