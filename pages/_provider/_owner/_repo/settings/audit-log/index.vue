<template>
  <div class="flex flex-col max-w-3xl p-4 space-y-4">
    <!-- title -->
    <div class="text-lg font-medium text-vanilla-100">Audit log</div>
    <!-- Timeline -->
    <div v-if="fetchingLogs" class="space-y-2">
      <div v-for="idx in 4" :key="idx" class="w-2/3 h-20 rounded-md bg-ink-300 animate-pulse"></div>
    </div>
    <div v-else-if="repository.logs && repository.logs.edges && repository.logs.edges.length">
      <z-timeline>
        <z-timeline-item class="h-20" v-for="log in repository.logs.edges" :key="log.node.id">
          <template slot="icon">
            <z-avatar
              :image="log.node.actor.avatar"
              :user-name="log.node.actor.fullName"
              size="sm"
              class="flex-shrink-0"
            ></z-avatar
          ></template>
          <log v-bind="log.node"></log>
        </z-timeline-item>
      </z-timeline>
    </div>
    <div v-else class="flex items-center justify-center h-80">No Audit logs</div>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZTimeline, ZTimelineItem, ZAvatar } from '@deepsourcelabs/zeal'
import { RepoPerms } from '~/types/permTypes'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'

@Component({
  components: {
    ZIcon,
    ZTimeline,
    ZTimelineItem,
    ZAvatar
  },
  layout: 'repository',
  middleware: ['perm'],
  meta: {
    auth: {
      strict: true,
      repoPerms: [RepoPerms.VIEW_AUDIT_LOGS]
    }
  }
})
export default class SettingsAuditLog extends mixins(RepoDetailMixin, ActiveUserMixin) {
  public searchRule = ''
  public fetchingLogs = false

  async fetch(): Promise<void> {
    this.fetchingLogs = true
    try {
      await this.fetchRepositorySettingsAuditLogs(this.baseRouteParams)
    } catch (e) {
      this.logSentryErrorForUser(e, 'Audit Log', this.baseRouteParams)
    } finally {
      this.fetchingLogs = false
    }
  }
}
</script>
