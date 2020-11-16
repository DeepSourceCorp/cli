<template>
  <div class="container mx-auto mt-10">
    <span class="text-xl block">Generate Config</span>
    <label class="block">
      Test patterns:
      <textarea
        v-model="tomlJson.test_patterns"
        class="resize border rounded focus:outline-none focus:shadow-outline"
      ></textarea>
    </label>
    <label class="block">
      Exclude patterns:
      <textarea
        v-model="tomlJson.exclude_patterns"
        class="resize border rounded focus:outline-none focus:shadow-outline"
      ></textarea>
    </label>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'nuxt-property-decorator'

@Component
export default class GenerateConfig extends Vue {
  tomlJson = {
    version: 1,
    test_patterns: '',
    exclude_patterns: '',
    analyzers: {},
    transformers: {}
  }
}
</script>
