<template>
  <div>
    <greeting :firstName="viewer.firstName || viewer.email"></greeting>
    <section class="flex flex-col-reverse lg:grid lg:grid-cols-fr-20 px-4 gap-4">
      <div class="grid grid-cols-2 gap-4">
        <starred-repo-list class="col-span-full" />
        <!-- activity-feed-list /-->
        <div class="col-span-full">
          <recommended-issues />
        </div>
      </div>
      <div>
        <viewer />
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import ActiveUserMixin from '@/mixins/activeUserMixin'

import { StatSection } from '@/components/Metrics'

import {
  Greeting,
  Viewer,
  RecommendedIssues,
  StarredRepoList,
  ActivityFeedList
} from '@/components/PersonalDashboard'

@Component({
  components: {
    StatSection,
    Greeting,
    Viewer,
    RecommendedIssues,
    StarredRepoList,
    ActivityFeedList
  },
  meta: {
    auth: {
      strict: true,
      redirectToLogin: true
    }
  },
  layout: 'sidebar-only'
})
export default class PersonalDashboard extends mixins(ActiveUserMixin) {
  head(): Record<string, string> {
    return {
      title: this.viewer.fullName ? `${this.viewer.fullName} • DeepSource` : `Me • DeepSource`,
      description:
        'DeepSource is an automated code review tool that helps developers automatically find and fix issues in their code.'
    }
  }
}
</script>
