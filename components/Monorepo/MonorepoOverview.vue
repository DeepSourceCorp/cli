<template>
  <div
    class="space-y-4"
    :class="{ 'max-w-3xl': loading || subRepositoryList.length || searchQuery }"
  >
    <template v-if="loading">
      <div class="h-8 animate-pulse bg-ink-300"></div>

      <div class="space-y-3">
        <div v-for="idx in 4" :key="idx" class="h-18 animate-pulse bg-ink-300"></div>
      </div>
    </template>

    <template v-else-if="subRepositoryList.length || searchQuery">
      <div class="flex gap-x-2">
        <z-input
          v-focus
          :value="searchQuery"
          :show-border="false"
          background-color="ink-300"
          size="small"
          placeholder="Search for a sub-repository"
          class="w-full"
          @debounceInput="
            (searchQueryFromEmit) =>
              $emit('update-filter', {
                searchQueryFromEmit,
                currentPageFromEmit: 1
              })
          "
        >
          <template #left>
            <z-icon icon="search" class="ml-1.5" />
          </template>
        </z-input>
        <z-button
          v-if="showAddSubRepositoryCta"
          button-type="primary"
          size="small"
          icon="folder-plus"
          @click="$emit('toggle-add-sub-repository-modal-visibility', true)"
          >New sub-repository</z-button
        >
      </div>

      <div v-if="subRepositoryList.length" class="space-y-3">
        <repo-card
          v-for="repository in subRepositoryList"
          :key="repository.id"
          v-bind="repository"
          :is-exact-route="true"
          :owner-login="ownerLogin"
          :route="repository.name"
          :show-inactive-tag="!repository.isActivated"
          size="small"
        />
      </div>

      <lazy-empty-state
        v-else-if="searchQuery"
        :png-image-path="require('~/assets/images/ui-states/directory/empty-search.gif')"
        :title="`No results found for '${searchQuery}'`"
        :webp-image-path="require('~/assets/images/ui-states/directory/empty-search.webp')"
        subtitle="Please try changing your search query."
      />
    </template>

    <div
      v-else
      class="monorepo-empty-state-card-shadow mx-auto mt-36 max-w-md space-y-6 rounded-md border border-ink-200 bg-ink-300 p-8 lg:mt-52 lg:max-w-lg"
    >
      <source
        srcset="~/assets/images/ui-states/no-activated-sub-repositories-state.webp"
        type="image/webp"
      />

      <img
        src="~/assets/images/ui-states/no-activated-sub-repositories-state.png"
        alt="No activated sub-repositories"
      />

      <div class="space-y-2">
        <h2 class="text-base font-medium text-vanilla-100">Define a new sub-repository</h2>

        <p class="text-sm font-normal text-vanilla-400">
          This monorepo has no activated sub-repositories yet. Define a new sub-repository to start
          analyzing your code.
        </p>
      </div>

      <z-button
        v-if="showAddSubRepositoryCta"
        icon="folder-plus"
        size="small"
        @click="$emit('toggle-add-sub-repository-modal-visibility', true)"
      >
        New sub-repository
      </z-button>
    </div>

    <z-pagination
      v-if="totalPageCount > 1"
      :page="currentPage"
      :total-pages="totalPageCount"
      :total-visible="5"
      class="flex justify-center"
      @selected="(currentPageFromEmit) => $emit('update-filter', { currentPageFromEmit })"
    />
  </div>
</template>

<script lang="ts">
import { ZButton, ZIcon, ZInput, ZPagination } from '@deepsource/zeal'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { Repository } from '~/types/types'

@Component({
  name: 'MonorepoOverview',
  components: {
    ZButton,
    ZIcon,
    ZInput,
    ZPagination
  }
})
export default class MonorepoOverview extends Vue {
  @Prop({ default: false })
  loading: boolean

  @Prop({ required: true })
  showAddSubRepositoryCta: boolean

  @Prop({ required: true })
  currentPage: number

  @Prop({ required: true })
  totalPageCount: number

  @Prop({ required: true })
  ownerLogin: string

  @Prop({ required: true })
  searchQuery: string

  @Prop({ required: true })
  subRepositoryList: Repository[]
}
</script>

<style scoped>
.h-7\.5 {
  height: 30px;
}

.h-18 {
  height: 72px;
}

.monorepo-empty-state-card-shadow {
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.25);
}
</style>
