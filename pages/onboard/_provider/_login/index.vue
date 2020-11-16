<template>
  <div class="container mx-auto mt-10">
    <div>
      <h1 class="text-2xl mb-5">Welcome {{ viewer.firstName }}! Let’s get you all set up</h1>

      <ul class="flex border-b">
        <li v-for="tab in progressTabs" class="mr-1">
          <nuxt-link
            :class="{ 'border-l border-t border-r': $route.fullPath === tab.route }"
            class="bg-white inline-block py-2 px-4 font-semibold"
            :to="`${tab.route}`"
          >
            {{ tab.name }}
          </nuxt-link>
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
import { ACT_FETCH_VIEWER_INFO } from '~/store/user/active'
import { Component, namespace } from 'nuxt-property-decorator'
import { User } from '~/types/types'

const activeUser = namespace('user/active')

@Component
export default class Index extends Vue {
  @activeUser.State
  viewer!: User

  progressTabs = [
    {
      name: 'Select preferences',
      route: `/onboard/${this.$route.params.provider}/${this.$route.params.login}/issue-preferences`
    },
    {
      name: 'Choose repository',
      route: `/onboard/${this.$route.params.provider}/${this.$route.params.login}/choose-first-repo`
    },
    {
      name: 'Generate config',
      route: `/onboard/${this.$route.params.provider}/${this.$route.params.login}/generate-config`
    }
  ]

  async fetch() {
    await this.$store.dispatch(`user/active/${ACT_FETCH_VIEWER_INFO}`)
  }
  fetchOnServer = false
}
</script>
