<template>
  <div class="container">
    <div>
      <button class="btn" @click="dispatchAction">Fetch</button>
      <span v-if="$apollo.loading">Loading</span>
      <div v-else v-for="analyzer in analyzerList.edges" class="bar">
        {{ analyzer.node.id }}/{{ analyzer.node.name }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { ACT_FETCH_ANALYZER_LIST } from '~/types/action-types'
import { Component, namespace } from 'nuxt-property-decorator'
import { AnalyzerConnection } from '~/types/types'

const analyzerList = namespace('analyzerList')

@Component
export default class Index extends Vue {
  @analyzerList.State
  analyzerList!: AnalyzerConnection

  public dispatchAction() {
    this.$store.dispatch(`analyzerList/${ACT_FETCH_ANALYZER_LIST}`)
  }
}
</script>

<style>
.container {
  margin-left: auto;
  margin-right: auto;
  padding: 100px;
}
.bar {
  color: grey;
  padding: 10px;
  border-radius: 2px;
  border: 1px lightgrey solid;
  margin-bottom: 5px;
  margin-top: 5px;
}
.btn {
  background: lightgray;
  border-radius: 2px;
  border: 1px lightgrey solid;
  padding: 10px 15px;
  color: black;
}
</style>
