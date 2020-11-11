<template>
  <div class="container mx-auto mt-10">
    <div>
      <h2 class="text-xl">Active Repos</h2>
      <span v-if="$apollo.loading">Loading</span>
      <nuxt-link
        to="/dummy/repository/overview"
        v-else
        v-for="repo in repositoryList.edges"
        :key="repo.node.id"
        class="border p-2 my-2 cursor-pointer hover:bg-ink-100 hover:text-vanilla-100 block"
      >
        {{ repo.node.name }}
      </nuxt-link>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { ACT_FETCH_REPOSITORY_LIST } from '~/types/action-types'
import { Component, namespace } from 'nuxt-property-decorator'
import { RepositoryConnection } from '~/types/types'

const repositoryList = namespace('repositoryList')

@Component
export default class Members extends Vue {
  @repositoryList.State
  repositoryList!: RepositoryConnection

  created() {
    this.$store.dispatch(`repositoryList/${ACT_FETCH_REPOSITORY_LIST}`, {
      login: 'String',
      provider: 'GITHUB',
      isActivated: true,
      limit: 20,
      after: 'String',
      query: 'String'
    })
  }
}
</script>
