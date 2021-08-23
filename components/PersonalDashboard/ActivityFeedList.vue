<template>
  <list-section title="Activity Feed" footerLinkLabel="See all activity" footerLink="#">
    <div class="divide-y divide-solid divide-ink-300 max-h-52 overflow-y-scroll">
      <div
        v-for="act in activityFeed"
        :key="act.id"
        class="flex items-center text-vanilla-400 text-sm p-2"
      >
        <span
          ><b class="text-vanilla-100">{{ act.loggedForDisplay }}</b> {{ act.description }}
          {{ fromNow(act.createdAt) }}.
        </span>
      </div>
    </div>
  </list-section>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import ActiveUserMixin from '@/mixins/activeUserMixin'
import { ListSection } from '@/components/TeamHome'
import { fromNow } from '@/utils/date'

// import { ActivityFeed } from '~/types/types'

@Component({
  components: {
    ListSection
  }
})
export default class ActivityFeedList extends mixins(ActiveUserMixin) {
  async fetch(): Promise<void> {
    // await this.fetchActivityFeed()
  }

  // get activityFeed(): Array<ActivityFeed | null> {
  //   if (this.viewer?.recentActivities) {
  //     const { edges } = this.viewer.recentActivities
  //     return edges
  //       .map((edge) => {
  //         return edge?.node ? edge.node : null
  //       })
  //       .filter((node) => node?.id)
  //   }
  //   return []
  // }

  private fromNow = fromNow
}
</script>
