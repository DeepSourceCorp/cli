<template>
  <div class="container mx-auto p-4">
    <span class="text-xl">Analyzer your code, fix issues in seconds</span>
    <span class="block my-4">
      <a class="border cursor-pointer p-2" href="/api/github/login">Github</a>
      <a class="border cursor-pointer p-2" href="/api/gitlab/login">Gitlab</a>
      <a class="border cursor-pointer p-2" href="/api/bitbucket/login">Bitbucket</a>
    </span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { ACT_FETCH_ANALYZER_LIST } from '~/types/action-types'
import { Component, namespace } from 'nuxt-property-decorator'
import { AnalyzerConnection } from '~/types/types'

const analyzerList = namespace('analyzerList')

@Component
export default class SignUp extends Vue {
  
}
</script>
