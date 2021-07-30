<template>
  <div class="relative top-0 p-0 xl:p-6 w-4/6 flex flex-col space-y-0 xl:space-y-4">
    <div v-if="issue.silenceRules && issue.silenceRules.length" class="flex flex-col space-y-2">
      <ignored-rule v-for="rule in issue.silenceRules" :key="rule.id" :rule="rule"></ignored-rule>
    </div>
    <div v-else class="w-full h-72 flex justify-center items-center">No ignore rules found.</div>
  </div>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { IgnoredRule } from '@/components/Repository/index'

import IssueDetailMixin from '@/mixins/issueDetailMixin'
import RepoDetailMixin from '@/mixins/repoDetailMixin'

@Component({
  components: {
    IgnoredRule
  },
  layout: 'repository'
})
export default class IssuesDetails extends mixins(IssueDetailMixin, RepoDetailMixin) {}
</script>
