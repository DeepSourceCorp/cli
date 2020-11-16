<template>
  <div class="container mx-auto mt-10">
    <span class="text-xl block">Generate Config</span>
    <em class="my-4 block">
      <strong>{{ repository.name }}</strong> repository has been selected
    </em>
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

    <button @click="onSubmit" class="border cursor-pointer p-2 my-4">
      Analyze and show results
    </button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, namespace } from 'nuxt-property-decorator'
import { Repository } from '~/types/types'
import { ACT_COMMIT_CONFIG_TO_VCS } from '~/store/repository/detail'

const repository = namespace('repository/detail')

@Component
export default class GenerateConfig extends Vue {
  @repository.State
  repository!: Repository

  tomlJson = {
    version: 1,
    test_patterns: '',
    exclude_patterns: '',
    analyzers: {},
    transformers: {}
  }

  async onSubmit() {
    await this.$store.dispatch(`repository/detail/${ACT_COMMIT_CONFIG_TO_VCS}`, {
      repositoryId: this.repository.id,
      config: ""
    })
  }
}
</script>
