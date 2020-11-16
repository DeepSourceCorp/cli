<template>
  <div class="container mx-auto mt-10">
    <span class="text-xl block">Choose first repo</span>

    <div class="my-4">
      <span
        v-for="repo in repositoryList.edges"
        :key="repo.node.id"
        @click="selectRepository(repo.node)"
        class="block"
      >
        <span class="border p-2 my-2 cursor-pointer hover:bg-ink-100 hover:text-vanilla-100 block">
          {{ repo.node.name }}
        </span>
        <label v-for="analyzer in repo.node.supportedAnalyzers" :key="analyzer">
          <input type="checkbox" />
          {{ analyzer }}
        </label>
      </span>
    </div>

    <button
      v-if="Object.keys(selectedRepository).length"
      @click="onSubmit"
      class="border cursor-pointer p-2 my-4"
    >
      Select {{ this.$route.params.login }}/{{ selectedRepository.name }}
    </button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { ACT_FETCH_REPOSITORY_LIST } from '~/store/repository/list'
import { ACT_FETCH_REPOSITORY_DETAIL } from '~/store/repository/detail'
import { Component, namespace } from 'nuxt-property-decorator'
import { Repository, RepositoryConnection } from '~/types/types'

const repositoryList = namespace('repository/list')

@Component
export default class ChooseFirstRepo extends Vue {
  @repositoryList.State
  repositoryList!: RepositoryConnection

  selectedRepository: Repository = {} as Repository

  async fetch() {
    await this.$store.dispatch(`repository/list/${ACT_FETCH_REPOSITORY_LIST}`, {
      login: this.$route.params.login,
      provider: this.$route.params.provider,
      isActivated: false,
      limit: 10,
      currentPageNumber: 1,
      query: ''
    })
  }

  selectRepository(node: Repository) {
    this.selectedRepository = node
  }

  async onSubmit() {
    await this.$store.dispatch(`repository/detail/${ACT_FETCH_REPOSITORY_DETAIL}`, {
      id: this.selectedRepository.id
    })
    .then(() => {
      this.$router.push({
        path: `/onboard/${this.$route.params.provider}/${this.$route.params.login}/generate-config`
      })
    })
  }
}
</script>
