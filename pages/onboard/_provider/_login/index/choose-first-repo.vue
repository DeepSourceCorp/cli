<template>
  <div class="container mx-auto mt-10">
    <span class="text-xl block">Choose first repo</span>
    <span
      v-for="repo in repositoryList.edges"
      :key="repo.node.id"
      class="border p-2 my-2 cursor-pointer hover:bg-ink-100 hover:text-vanilla-100 block"
    >
      {{ repo.node.name }}
    </span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { ACT_FETCH_REPOSITORY_LIST } from '~/store/repository/list'
import { Component, namespace } from 'nuxt-property-decorator'
import { RepositoryConnection } from '~/types/types'

const repositoryList = namespace('repository/list')

@Component
export default class ChooseFirstRepo extends Vue {
  @repositoryList.State
  repositoryList!: RepositoryConnection

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
}
</script>
