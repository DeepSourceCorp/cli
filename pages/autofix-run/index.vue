<template>
  <div class="container mx-auto mt-10">
    <div>
      <nuxt-link class="text-underline text-cherry underline" to="/repository/history"
        >Go back to history page</nuxt-link
      >
      <h1 class="text-2xl mb-5">Autofix Run</h1>

      <div class="text-md">
        <span class="block"
          >Run Status: <span class="text-robin">{{ autofixRun.status }}</span></span
        >
        <span class="block"
          >Resolved Issues Count:
          <span class="text-robin">{{ autofixRun.resolvedIssuesCount }}</span></span
        >
        <span class="block"
          >Changeset:
          <span class="text-robin">{{ autofixRun.changeset }}</span></span
        >
        <span class="block"
          >Committed To Branch Status:
          <span class="text-robin">{{ autofixRun.committedToBranchStatus }}</span></span
        >
        <span class="block"
          >Pull Request Status:
          <span class="text-robin">{{ autofixRun.pullRequestStatus }}</span></span
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { ACT_FETCH_AUTOFIX_RUN } from '~/types/action-types'
import { Component, namespace } from 'nuxt-property-decorator'
import { AutofixRun } from '~/types/types'

const autofixRun = namespace('autofixRun')

@Component
export default class AutofixRunDetail extends Vue {
  @autofixRun.State
  autofixRun!: AutofixRun

  created() {
    this.$store.dispatch(`autofixRun/${ACT_FETCH_AUTOFIX_RUN}`, {
      runId: 'NDc0OTA3MTgw'
    })
  }
}
</script>
