<template>
  <div class="container mx-auto mt-10">
    <span class="text-xl">TODO(Some problems with fetching queries)</span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { ACT_FETCH_REPOSITORY_SETTINGS_GENERAL } from '~/types/action-types'
import { Component, namespace } from 'nuxt-property-decorator'
import { Repository } from '~/types/types'

const repository = namespace('repository')

@Component
export default class Settings extends Vue {
  @repository.State
  repository!: Repository

  created() {
    // this.$store.dispatch(`repository/${ACT_FETCH_REPOSITORY_SETTINGS_GENERAL}`, {
    //   id: 'OTM3MDk0NjQ2Mg=='
    // })
  }
}
</script>
