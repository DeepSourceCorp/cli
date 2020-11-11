<template>
  <div class="container mx-auto mt-10">
    <div>
      <h1 class="text-2xl mb-5">Welcome Ayushi! Let’s get you all set up</h1>

      <ul class="flex border-b">
        <li v-for="tab in progressTabs" class="mr-1">
          <nuxt-link
            :class="{ 'border-l border-t border-r': $route.fullPath === tab.route }"
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
export default class Repository extends Vue {
  progressTabs = [
    {
      name: 'Select preferences',
      route: '/onboard/gh/deepsourcelabs/issue-preferences'
    },
    {
      name: 'Choose repository',
      route: '/onboard/gh/deepsourcelabs/choose-first-repo'
    },
    {
      name: 'Generate config',
      route: '/onboard/gh/deepsourcelabs/generate-config'
    }
  ]
}
</script>
