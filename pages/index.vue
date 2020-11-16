<template>
  <div class="container">
    <span class="text-xl">Analyzer your code, fix issues in seconds</span>
    <a class="btn">Github</a>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'nuxt-property-decorator'

@Component
export default class Index extends Vue {}
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
