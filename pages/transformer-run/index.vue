<template>
  <div class="container mx-auto mt-10">
    <div>
      <nuxt-link class="text-underline text-cherry underline" to="/repository/history"
        >Go back to history page</nuxt-link
      >
      <h1 class="text-2xl mb-5">Autofix Run</h1>

      <div class="text-md">
        <span class="block"
          >Run Status: <span class="text-robin">{{ transformerRun.status }}</span></span
        >
        <span class="block"
          >Changed Files Count:
          <span class="text-robin">{{ transformerRun.changedFilesCount }}</span></span
        >
        <span class="block"
          >Changeset:
          <span class="text-robin">{{ transformerRun.changeset }}</span></span
        >
        <span class="block"
          >Pull Request Status:
          <span class="text-robin">{{ transformerRun.pullRequestStatus }}</span></span
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { ACT_FETCH_TRANSFORMER_RUN } from '~/types/action-types'
import { Component, namespace } from 'nuxt-property-decorator'
import { TransformerRun } from '~/types/types'

const transformerRun = namespace('transformerRun')

@Component
export default class TransformerRunDetail extends Vue {
  @transformerRun.State
  transformerRun!: TransformerRun

  created() {
    this.$store.dispatch(`transformerRun/${ACT_FETCH_TRANSFORMER_RUN}`, {
      runId: 'NDc0OTA3MTgw'
    })
  }
}
</script>
