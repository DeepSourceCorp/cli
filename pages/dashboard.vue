<template>
  <div class="container mx-auto mt-10">
    <div>
      <h1 class="text-2xl mb-5">Dashboard</h1>

      <ul class="flex border-b">
        <li v-for="tab in dashboardTabs" class="mr-1">
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
import { Component } from 'nuxt-property-decorator'

@Component
export default class Dashboard extends Vue {
  dashboardTabs = [
    {
      name: 'Active repositories',
      route: '/dashboard'
    },
    {
      name: 'Members',
      route: '/dashboard/members'
    },
    {
      name: 'Settings',
      route: '/dashboard/settings'
    }
  ]
}
</script>
