<template>
  <div class="container mx-auto mt-10">
    <span class="text-xl block">Issue preference</span>
    <label
      v-for="(issueType, index) in owner.ownerSetting.issueTypeSettings"
      :key="issueType.slug"
      class="block my-2"
    >
      <input
        type="checkbox"
        @change="onSettingChange(index, $event)"
        :checked="!issueType.isIgnoredInCheckStatus"
      />
      {{ issueType.name }}
      <p class="block text-sm ml-4">{{ issueType.description }}</p>
    </label>

    <button @click="onSubmit" class="border cursor-pointer p-2 my-4">
      Proceed with these issues
    </button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, namespace, Watch } from 'nuxt-property-decorator'
import { IssueTypeSetting, Owner } from '~/types/types'
import {
  ACT_SUBMIT_ISSUE_TYPE_SETTINGS,
  ACT_FETCH_ISSUE_TYPE_SETTINGS,
  ACT_SET_ISSUE_TYPE_SETTING,
  ACT_SET_OWNER
} from '~/store/owner/detail'

const owner = namespace('owner/detail')

@Component
export default class IssuePreferences extends Vue {
  @owner.State
  owner!: Owner
  
  @owner.State
  loading!: Boolean

  @owner.State
  error!: Object

  async fetch() {
    await this.$store.dispatch(`owner/detail/${ACT_FETCH_ISSUE_TYPE_SETTINGS}`, {
      login: this.$route.params.login,
      provider: this.$route.params.provider
    })
  }

  onSettingChange(issueTypeSettingIndex: number, event: Event) {
    /**
     * Method resposible to select/de-select issue type settings
     */
    this.$store.dispatch(`owner/detail/${ACT_SET_ISSUE_TYPE_SETTING}`, {
      issueTypeSetting: {
        isIgnoredInCheckStatus: !(<HTMLInputElement>event.target).checked,
        isIgnoredToDisplay: !(<HTMLInputElement>event.target).checked
      },
      issueTypeSettingIndex
    })
  }

  async onSubmit() {
    /**
     * Submitting the selected issue type settings
     */
    await this.$store
      .dispatch(`owner/detail/${ACT_SUBMIT_ISSUE_TYPE_SETTINGS}`)
      .then(() => {
        this.$router.push({
          path: `/onboard/${this.$route.params.provider}/${this.$route.params.login}/choose-first-repo`
        })
      })
  }
}
</script>
