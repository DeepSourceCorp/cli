<template>
  <section class="grid max-w-3xl grid-cols-1 p-4">
    <div class="flex justify-between mb-4">
      <h2 class="text-lg font-medium">Personal Access Tokens</h2>
      <div v-if="userAccessTokenList.length" class="space-x-2">
        <z-button
          size="small"
          button-type="secondary"
          icon="trash-2"
          @click="showDeleteAllConfirmation = true"
        >
          Delete all
        </z-button>
        <z-button size="small" button-type="primary" icon="plus" @click="showGenerateModal = true">
          Generate a new token
        </z-button>
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
          subtitle="Any applications or scripts using this token will no longer be able to access the DeepSource API. You cannot undo this action."
          primary-action-type="danger"
          primary-action-label="Delete"
          @onClose="showDeleteConfirm = false"
        >
          <template v-slot:footer="{ close }">
            <div class="flex items-center justify-end mt-6 space-x-4 text-right text-vanilla-100">
              <z-button
                :loading="deletingToken"
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
          subtitle="Any applications or scripts using these tokens will no longer be able to access the DeepSource API. You cannot undo this action."
          primary-action-type="danger"
          primary-action-label="Delete"
          @onClose="showDeleteAllConfirmation = false"
        >
          <template v-slot:footer="{ close }">
            <div class="flex items-center justify-end mt-6 space-x-4 text-right text-vanilla-100">
              <z-button
                :loading="deletingToken"
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
    <div class="grid grid-cols-1 gap-4">
      <template v-if="$fetchState.pending">
        <div v-for="index in 3" :key="index" class="h-20 rounded-md bg-ink-300 animate-pulse"></div>
      </template>
      <template v-else-if="userAccessTokenList.length">
        <token-card
          v-for="token in userAccessTokenList"
          :key="token.id"
          v-bind="token"
          @delete="confirmDeleteToken"
        />
        <z-pagination
          v-if="totalPageCount > 1"
          :total-pages="totalPageCount"
          :total-visible="5"
          class="flex justify-center"
          @selected="fetchTokens"
        />
      </template>
      <empty-state
        v-else
        title="No tokens found"
        subtitle="A Personal Access Token allows you to access the DeepSource API."
        class="py-20 border border-2 border-dashed rounded-lg border-ink-200"
      >
        <template slot="action">
          <z-button size="small" icon="plus" @click="showGenerateModal = true">
            Generate a token
          </z-button>
        </template>
      </empty-state>
    </div>
  </section>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZButton, ZConfirm } from '@deepsourcelabs/zeal'
import AccessTokenMixin from '~/mixins/accessTokenMixin'
import PaginationMixin from '~/mixins/paginationMixin'

/**
 * Personal access tokens page
 */
@Component({
  components: {
    ZButton,
    ZConfirm
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
  public deletingToken = true
  public tokenToDelete = ''
  public perPageCount = 8

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
   * Fetch the tokens for first page
   *
   * @return {Promise<void>}
   */
  async fetch(): Promise<void> {
    await this.fetchTokens(0)
  }
}
</script>
