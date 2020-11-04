<template>
  <div class="container mx-auto mt-10">
    Metrics
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {} from '~/types/action-types'
import { Component, namespace } from 'nuxt-property-decorator'
import { RepositoryConnection } from '~/types/types'

// const repositoryList = namespace('repositoryList')

@Component
export default class Metrics extends Vue {
  
  // @repositoryList.State
  // repositoryList!: RepositoryConnection
  // created() {
  //   this.$store.dispatch(`repositoryList/${ACT_FETCH_REPOSITORY_LIST}`, {
  //     login: 'String',
  //     provider: 'GITHUB',
  //     isActivated: true,
  //     limit: 20,
  //     after: 'String',
  //     query: 'String'
  //   })
  // }
}
</script>
