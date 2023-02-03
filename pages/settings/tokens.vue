<template>
  <section class="grid gap-4 max-w-3xl grid-cols-1 p-4">
    <div class="flex justify-between">
      <div class="w-full space-y-0.5">
        <h2 class="font-medium">Tokens</h2>
        <div class="text-sm text-vanilla-400">Manage your Personal Access Tokens (PAT).</div>
        <div v-if="userAccessTokenList.length" class="pt-3 w-full flex items-center gap-x-2">
          <z-input
            v-model="searchCandidate"
            :show-border="false"
            :clearable="searchCandidate !== ''"
            spacing="tight"
            background-color="ink-300"
            placeholder="Search..."
            size="small"
          >
            <template #left>
              <z-icon
                :color="searchCandidate ? 'vanilla-100' : 'vanilla-400'"
                icon="search"
                class="ml-1.5"
              />
            </template>
          </z-input>
          <z-button
            size="small"
            button-type="primary"
            icon="plus"
            @click="showGenerateModal = true"
          >
            New token
          </z-button>
        </div>
      </div>
      <portal to="modal">
        <create-token-modal
          v-if="showGenerateModal"
          @close="showGenerateModal = false"
          @refetch="fetchTokens(0, true)"
        />
        <z-confirm
          v-if="showDeleteConfirm"
          title="Are you sure you want to delete this token?"
          subtitle="Any application or script using this token will no longer be able to access the DeepSource API. You cannot undo this action."
          primary-action-type="danger"
          primary-action-label="Delete"
          @onClose="showDeleteConfirm = false"
        >
          <template #footer="{ close }">
            <div class="flex items-center justify-end mt-6 space-x-4 text-right text-vanilla-100">
              <z-button
                :is-loading="deletingToken"
                icon="trash-2"
                button-type="danger"
                size="small"
                label="Yes, delete this token"
                loading-label="Deleting token"
                class="modal-primary-action"
                @click="deleteToken(close)"
              />
            </div>
          </template>
        </z-confirm>
        <z-confirm
          v-if="showDeleteAllConfirmation"
          title="Are you sure you want to delete all tokens?"
          subtitle="Any application or script using these tokens will no longer be able to access the DeepSource API. You cannot undo this action."
          primary-action-type="danger"
          primary-action-label="Delete"
          @onClose="showDeleteAllConfirmation = false"
        >
          <template v-slot:footer="{ close }">
            <div class="flex items-center justify-end mt-6 space-x-4 text-right text-vanilla-100">
              <z-button
                :is-loading="deletingToken"
                icon="trash-2"
                button-type="danger"
                size="small"
                label="Yes, delete all tokens"
                loading-label="Deleting tokens"
                class="modal-primary-action"
                @click="deleteToken(close, true)"
              />
            </div>
          </template>
        </z-confirm>
      </portal>
    </div>
    <div
      :class="{ 'border border-ink-200': $fetchState.pending || filteredTokens.length }"
      class="grid grid-cols-1 divide-y divide-ink-200 rounded-md"
    >
      <template v-if="$fetchState.pending">
        <div v-for="index in 3" :key="index" class="h-20 rounded-md bg-ink-300 animate-pulse"></div>
      </template>
      <template v-else-if="filteredTokens.length">
        <token-card
          v-for="token in filteredTokens"
          :key="token.id"
          v-bind="token"
          @delete="confirmDeleteToken"
        />
      </template>
      <empty-state
        v-else
        :use-v2="!searchCandidate"
        :webp-image-path="emptyStateProps.images.webp"
        :png-image-path="emptyStateProps.images.png"
        :svg-image-path="emptyStateProps.images.svg"
        :show-border="true"
        :title="emptyStateProps.title"
        :subtitle="emptyStateProps.subtitle"
      >
        <template v-if="!searchCandidate" #action>
          <z-button size="small" icon="plus" @click="showGenerateModal = true">
            <span class="text-xs">New token</span>
          </z-button>
        </template>
      </empty-state>
    </div>
    <z-pagination
      v-if="totalPageCount > 1"
      :total-pages="totalPageCount"
      :total-visible="5"
      class="flex justify-center mb-4"
      @selected="fetchTokens"
    />
    <z-accordion
      v-if="filteredTokens.length && !searchCandidate"
      class="text-vanilla-100 border border-ink-200 rounded-md bg-ink-300"
    >
      <z-accordion-item title="Advanced settings" class="p-3">
        <template #title="{ open, toggleAccordion }">
          <div class="flex items-center cursor-pointer gap-1" @click="toggleAccordion">
            <z-icon
              icon="chevron-right"
              size="small"
              :class="
                open
                  ? 'animate-first-quarter-spin rotate-90'
                  : 'animate-reverse-quarter-spin rotate-0'
              "
              class="transform"
            />
            <span class="font-medium text-xs uppercase text-vanilla-400 tracking-wider"
              >Advanced settings</span
            >
          </div>
        </template>
        <div
          class="mt-4 flex gap-9 border border-cherry border-opacity-20 bg-cherry bg-opacity-5 rounded-md p-4"
        >
          <div class="space-y-1.5">
            <span class="text-cherry text-sm">Delete all tokens</span>
            <div class="text-cherry-300 text-xs leading-6">
              All applications using the tokens would no longer be granted access to DeepSource
              data. This operation cannot be undone.
            </div>
          </div>
          <z-button
            size="small"
            button-type="danger"
            icon="trash-2"
            @click="showDeleteAllConfirmation = true"
          >
            Delete all tokens
          </z-button>
        </div>
      </z-accordion-item>
    </z-accordion>
  </section>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZButton, ZConfirm, ZInput, ZIcon, ZAccordion, ZAccordionItem } from '@deepsource/zeal'
import AccessTokenMixin from '~/mixins/accessTokenMixin'
import PaginationMixin from '~/mixins/paginationMixin'

interface EmptyStatePropsT {
  title: string
  subtitle: string
  images: {
    png: string
    webp: string
    svg?: string
  }
}

/**
 * Personal access tokens page
 */
@Component({
  components: {
    ZButton,
    ZConfirm,
    ZInput,
    ZIcon,
    ZAccordion,
    ZAccordionItem
  },
  meta: {
    auth: {
      strict: true,
      redirectToLogin: true
    }
  },
  layout: 'user'
})
export default class PersonalAccessTokenPage extends mixins(AccessTokenMixin, PaginationMixin) {
  public currentPage = 0
  public showGenerateModal = false
  public showDeleteConfirm = false
  public showDeleteAllConfirmation = false
  public deletingToken = false
  public tokenToDelete = ''
  public perPageCount = 5
  public searchCandidate = ''

  /**
   * Wrapper for delete and delete all tokens mutation
   *
   * @param {( close: () => void, all = false)}
   *
   *  @return {Promise<void>}
   */
  async deleteToken(close: () => void, all = false): Promise<void> {
    // set loading indicator
    this.deletingToken = true

    // skipcq: JS-D009
    if (all) {
      await this.deleteAllAccessTokens()
    } else {
      await this.deleteAccessToken({ tokenId: this.tokenToDelete })
    }

    // refetch token
    await this.fetchTokens(0, true)

    close()

    // reset state
    this.tokenToDelete = ''
    this.showDeleteConfirm = false
    this.showDeleteAllConfirmation = false

    // reset loading indicator
    this.deletingToken = false
  }

  /**
   * Toggle the delete confirmation modal and set the context for delete
   *
   * @param {string} id
   *
   * @return {any}
   */
  confirmDeleteToken(id: string) {
    this.showDeleteConfirm = true
    this.tokenToDelete = id
  }

  /**
   * Set the current page number and fetch/refetch tokens
   *
   * @param {number} pageNumber
   * @param {any} refetch=false
   *
   * @return {Promise<void>}
   */
  async fetchTokens(pageNumber: number, refetch = false): Promise<void> {
    this.currentPage = pageNumber
    await this.fetchAccessTokenList({
      currentPage: this.currentPage,
      limit: this.perPageCount,
      refetch
    })
    this.totalCount = this.totalUserAccessTokens
  }

  /**
   * Returns the list of access tokens filtered by the search query
   *
   * @returns {Array<AccessToken>}
   */
  get filteredTokens() {
    return this.userAccessTokenList.filter((token) =>
      token.description.includes(this.searchCandidate)
    )
  }

  /**
   * Getter for empty state props. Returns the prop values depending on `searchCandidate`
   *
   * @returns {EmptyStatePropsT}
   */
  get emptyStateProps(): EmptyStatePropsT {
    return this.searchCandidate
      ? {
          title: `No results for '${this.searchCandidate}'`,
          subtitle: `We could not find any token called '${this.searchCandidate}'.`,
          images: {
            png: require('~/assets/images/ui-states/directory/empty-search.gif'),
            webp: require('~/assets/images/ui-states/directory/empty-search.webp')
          }
        }
      : {
          title: 'No tokens found',
          subtitle: 'A Personal Access Token allows you to access the DeepSource API.',
          images: {
            png: require('~/assets/images/ui-states/no-tokens-found-136px.png'),
            webp: require('~/assets/images/ui-states/no tokens-found-136px.webp'),
            svg: require('~/assets/images/ui-states/no-tokens-found-80px.svg')
          }
        }
  }

  /**
   * Fetch the tokens for first page
   *
   * @return {Promise<void>}
   */
  async fetch(): Promise<void> {
    await this.fetchTokens(0)
  }
}
</script>
