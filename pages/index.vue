<template>
  <div class="container">
    <span class="text-xl">Analyzer your code, fix issues in seconds</span>
    <a class="btn">Github</a>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { ACT_FETCH_ANALYZER_LIST } from '~/store/analyzerList'
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
