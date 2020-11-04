<template>
  <div class="container mx-auto mt-10">
    <div>
      <nuxt-link class="text-underline text-cherry underline" to="/dashboard">Go back to Dashboard</nuxt-link>
      <h1 class="text-2xl mb-5">Repository</h1>

      <ul class="flex border-b">
        <li v-for="tab in repoTabs" class="mr-1">
          <nuxt-link
            :class="{'border-l border-t border-r': $route.fullPath === tab.route}"
            class="bg-white inline-block py-2 px-4 font-semibold"
            :to="`${tab.route}`"
            >{{ tab.name }}</nuxt-link
          >
        </li>
      </ul>
    </div>
    <div>
      <NuxtChild />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {} from '~/types/action-types'
import { Component, namespace } from 'nuxt-property-decorator'
import { RepositoryConnection } from '~/types/types'

const repositoryList = namespace('repositoryList')

@Component
export default class Repository extends Vue {
  repoTabs = [
    {
      name: 'Overview',
      route: '/repository/overview'
    },
    {
      name: 'Issues',
      route: '/repository/issues'
    },
    {
      name: 'Metrics',
      route: '/repository/metrics'
    },
    {
      name: 'History',
      route: '/repository/history'
    },
    {
      name: 'Settings',
      route: '/repository/settings'
    }
  ]
}
</script>
