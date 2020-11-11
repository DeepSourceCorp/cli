<template>
  <div class="container mx-auto mt-10">
    <div>
      <nuxt-link class="text-underline text-cherry underline" to="/dummy/repository/history"
        >Go back to history page</nuxt-link
      >
      <h1 class="text-2xl mb-5">Analysis Run</h1>

      <div class="text-md">
        <span class="block"
          >Run Status: <span class="text-robin">{{ run.status }}</span></span
        >
        <span class="block"
          >Issues Raised Count: <span class="text-robin">{{ run.issuesRaisedCount }}</span></span
        >
        <span class="block"
          >Issues Resolved Count:
          <span class="text-robin">{{ run.issuesResolvedCount }}</span></span
        >
        <span class="block"
          >Issues Resolved Count:
          <span class="text-robin">{{ run.issuesResolvedCount }}</span></span
        >
      </div>

      <div class="text-lg mt-4">
        <span class="text-xl">Concrete Issues</span>
        <span
          v-for="issue in concreteIssueList.edges"
          :key="issue.node.id"
          @click="$router.push({ name: 'run-issue', params: { issue: issue.node } })"
          class="border p-2 my-2 cursor-pointer hover:bg-ink-100 hover:text-vanilla-100 block"
        >
          Issue title: <span class="text-robin">{{ issue.node.title }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  ACT_FETCH_AUTOFIXABLE_ISSUES,
  ACT_FETCH_CONCRETE_ISSUE_LIST,
  ACT_FETCH_RUN
} from '~/types/action-types'
import { Component, namespace } from 'nuxt-property-decorator'
import { Check, IssueConnection } from '~/types/types'

const run = namespace('run')

@Component
export default class Run extends Vue {
  @run.State
  run!: Check

  @run.State
  concreteIssueList!: IssueConnection

  created() {
    this.$store.dispatch(`run/${ACT_FETCH_RUN}`, {
      checkId: 'NDc0OTA3MTgw'
    })
    this.$store.dispatch(`run/${ACT_FETCH_CONCRETE_ISSUE_LIST}`, {
      checkId: 'NDc0OTA3MTgw'
    })
    this.$store.dispatch(`run/${ACT_FETCH_AUTOFIXABLE_ISSUES}`, {
      checkId: 'NDc0OTA3MTgw'
    })
  }
}
</script>
