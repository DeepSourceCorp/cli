<template>
  <div class="container mx-auto mt-10">
    <span class="text-xl">Widgets List</span>
    <div
      v-for="widget in repository.widgets"
      class="border p-2 my-2 cursor-pointer hover:bg-ink-100 hover:text-vanilla-100"
    >
      {{ widget }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { ACT_FETCH_WIDGETS } from '~/types/action-types'
import { Component, namespace } from 'nuxt-property-decorator'
import { Repository } from '~/types/types'

const repository = namespace('repository')

@Component
export default class Overview extends Vue {
  @repository.State
  repository!: Repository

  created() {
    this.$store.dispatch(`repository/${ACT_FETCH_WIDGETS}`, {
      provider: 'GITHUB',
      owner: 'deepsourcelabs',
      name: 'asgard'
    })
  }
}
</script>
