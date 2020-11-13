<template>
  <div class="container mx-auto mt-10">
    <span class="text-xl block">Issue preference</span>
    <label
      v-for="issueType in owner.ownerSetting.issueTypeSettings"
      :key="issueType.slug"
      class="block my-2"
    >
      <input
        type="checkbox"
        :checked="!issueType.isIgnoredInCheckStatus"
        @click="selectIssueType(issueType)"
      />
      {{ issueType.name }}
      <p class="block text-sm ml-4">{{ issueType.description }}</p>
    </label>

    <nuxt-link class="border cursor-pointer p-2" to="">Proceed with these issues</nuxt-link>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, namespace } from 'nuxt-property-decorator'
import { IssueTypeSetting, Owner } from '~/types/types'
import { ACT_FETCH_ISSUE_TYPE_SETTINGS } from '~/store/owner/detail'

const owner = namespace('owner/detail')

@Component
export default class IssuePreferences extends Vue {
  @owner.State
  owner!: Owner

  async fetch() {
    await this.$store.dispatch(`owner/detail/${ACT_FETCH_ISSUE_TYPE_SETTINGS}`, {
      login: 'deepsourcelabs',
      provider: 'GITHUB'
    })
  }

  selectIssueType(issueType: IssueTypeSetting) {
    /**
     * Select an issue type from the list
     * @param {Object} issueType - Object of an issue type
     */
    issueType.isIgnoredInCheckStatus = issueType.isIgnoredInCheckStatus ? false : true
    issueType.isIgnoredToDisplay = issueType.isIgnoredInCheckStatus
  }
}
</script>
