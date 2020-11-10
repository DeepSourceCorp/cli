<template>
  <div class="container mx-auto mt-10">
    <div>
      <nuxt-link class="text-underline text-cherry underline" to="/repository/issues"
        >Go back to issue list</nuxt-link
      >
      <h1 class="text-2xl mb-5">Repository Issue</h1>

      <div class="flex text-lg">
        <span
          >Issue title: <span class="text-robin">{{ issue.title }}</span></span
        >
        <span class="ml-2"
          >Issue shortcode: <span class="text-robin">{{ issue.shortcode }}</span></span
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { ACT_FETCH_ISSUE } from '~/types/action-types'
import { Component, namespace } from 'nuxt-property-decorator'
import { RepositoryIssue } from '~/types/types'

const issue = namespace('issue')

@Component
export default class Issue extends Vue {
  @issue.State
  issue!: RepositoryIssue

  created() {
    this.$store.dispatch(`issue/${ACT_FETCH_ISSUE}`, {
      repositoryId: 'Nzg2NTE2MzY4MQ==',
      shortcode: 'string'
    })
  }
}
</script>
