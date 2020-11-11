<template>
  <div class="container mx-auto mt-10">
    <span class="text-xl">Issues List</span>
    <nuxt-link
      v-for="issue in issueList.edges"
      :key="issue.node.id"
      to="/dummy/issue"
      class="border p-2 my-2 cursor-pointer hover:bg-ink-100 hover:text-vanilla-100 block"
    >
      {{ issue.node.shortcode }}
    </nuxt-link>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { ACT_FETCH_ISSUE_LIST } from '~/types/action-types'
import { Component, namespace } from 'nuxt-property-decorator'
import { RepositoryIssueConnection } from '~/types/types'

const issueList = namespace('issueList')

@Component
export default class Issues extends Vue {
  @issueList.State
  issueList!: RepositoryIssueConnection

  created() {
    this.$store.dispatch(`issueList/${ACT_FETCH_ISSUE_LIST}`, {
      provider: 'GITHUB',
      owner: 'deepsourcelabs',
      name: 'bifrost',
      after: 'String',
      issueType: 'String',
      analyzer: 'String',
      sort: 'String',
      q: 'String'
    })
  }
}
</script>
