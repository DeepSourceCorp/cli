<template>
  <div class="container mx-auto mt-10">
    <span class="text-xl block">Choose first repo</span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { ACT_FETCH_REPOSITORY_LIST } from '~/types/action-types'
import { Component, namespace } from 'nuxt-property-decorator'
import { RepositoryConnection } from '~/types/types'

const repositoryList = namespace('repository/list')

@Component
export default class ChooseFirstRepo extends Vue {
  @repositoryList.State
  repositoryList!: RepositoryConnection

  fetch() {
    this.$store.dispatch(`repository/list/${ACT_FETCH_REPOSITORY_LIST}`, {
      login: 'deepsourcelabs',
      provider: 'gh',
      isActivated: false,
      limit: 10,
      after: '',
      query: ''
    })
  }
}
</script>
