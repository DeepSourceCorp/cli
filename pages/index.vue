<template>
  <div class="container">
    <div>
      <button class="btn" @click="dispatchAction">Fetch</button>
      <span v-if="$apollo.loading">Loading</span>
      <div v-else v-for="analyzer in analyzers" class="bar">
        {{ analyzer.node.id }}/{{ analyzer.node.name }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import gql from "graphql-tag";
import { mapState } from "vuex";
import { Component, Watch } from "nuxt-property-decorator";
import { namespace } from "vuex-class";

const analyzers = namespace("analyzers");

@Component
export default class Index extends Vue {
  @analyzers.State
  analyzers: any;
  public dispatchAction() {
    this.$store.dispatch("analyzers/fetchAnalyzers");
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