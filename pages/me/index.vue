<template>
  <section class="flex flex-col-reverse gap-4 p-4 pb-12 lg:grid lg:grid-cols-fr-20">
    <div class="grid grid-cols-2 gap-4">
      <starred-repo-list class="col-span-full" />
      <!-- activity-feed-list /-->
      <div class="col-span-full">
        <recommended-issues />
      </div>
    </div>
    <div class="pt-9">
      <client-only>
        <viewer />
      </client-only>
    </div>
  </section>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import ActiveUserMixin from '@/mixins/activeUserMixin'

@Component({
  meta: {
    auth: {
      strict: true,
      redirectToLogin: true
    }
  },
  layout: 'user'
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
