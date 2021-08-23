<template>
  <list-section title="Recent activity" :allowLoadMore="true">
    <nuxt-link v-for="activity in activity" :key="activity.id" to="/gh/deepsourcelabs">
      <list-item :info="fromNow(activity.createdAt)">
        <template slot="avatar">
          <z-avatar
            v-if="activity.avatar"
            :userName="activity.avatar.fullName || activity.avatar.email"
            :image="activity.actor.avatar"
            size="sm"
          ></z-avatar>
        </template>
        <template slot="label">
          <span class="text-vanilla-400"> {{ activity.description }}</span>
        </template>
      </list-item>
    </nuxt-link>
  </list-section>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import TeamDetailMixin from '@/mixins/teamDetailMixin'

// import { Maybe, ActivityFeed } from '@/types/types'

import { ZButton, ZIcon, ZAvatar } from '@deepsourcelabs/zeal'

import { fromNow } from '@/utils/date'

@Component({
  components: { ZButton, ZIcon, ZAvatar }
})
export default class RecentlyActiveRepoList extends mixins(TeamDetailMixin) {
  private fromNow = fromNow

  async fetch(): Promise<void> {
    const { owner, provider } = this.$route.params
    // await this.fetchRecentActivity({
    //   login: owner,
    //   limit: 10,
    //   currentPage: 1,
    //   provider
    // })
  }

  // get activity(): (Maybe<ActivityFeed> | undefined)[] {
  //   if (this.team.recentActivities?.edges) {
  //     return this.team.recentActivities.edges.map((edge) => {
  //       if (edge?.node) return edge.node
  //       return null
  //     })
  //   }
  //   return []
  // }
}
</script>
