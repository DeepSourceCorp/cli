<template>
  <div class="flex flex-col max-w-2xl p-4 gap-y-2">
    <!-- title -->
    <h2 class="mb-4 text-lg font-medium">Audit log</h2>
    <!-- Timeline -->
    <div v-if="$fetchState.pending" class="space-y-2">
      <div v-for="idx in 4" :key="idx" class="w-2/3 h-20 rounded-md bg-ink-300 animate-pulse"></div>
    </div>
    <div v-else-if="auditLogs.length">
      <z-timeline>
        <z-timeline-item class="h-20" v-for="log in auditLogs" :key="log.id">
          <template slot="icon">
            <z-avatar
              v-if="log.actor"
              :image="log.actor.avatar"
              :fallback-image="getDefaultAvatar(log.actor.email)"
              :user-name="getName(log)"
              size="sm"
              class="flex-shrink-0"
            />
            <div v-else class="flex items-center justify-center w-6 h-6 rounded-full bg-ink-200">
              <z-icon icon="circle" />
            </div>
          </template>
          <log v-bind="log" />
        </z-timeline-item>
      </z-timeline>
    </div>
    <empty-state
      v-else
      title="No Audit logs"
      subtitle="No events have been logged for this account yet. Please check back later!"
      class="py-20 border-2 border-dashed rounded-lg border-slate-400"
    />
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZTimeline, ZTimelineItem, ZAvatar } from '@deepsource/zeal'
import { RepoPerms } from '~/types/permTypes'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import { AuditLog } from '~/types/types'
import { resolveNodes } from '~/utils/array'
import { getDefaultAvatar } from '~/utils/ui'

@Component({
  components: {
    ZIcon,
    ZTimeline,
    ZTimelineItem,
    ZAvatar
  },
  layout: 'repository',
  middleware: ['perm'],
  methods: { getDefaultAvatar },
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

  get auditLogs(): AuditLog[] {
    return resolveNodes(this.repository.logs) as AuditLog[]
  }

  getName(log: AuditLog): string {
    if (log?.actor?.fullName) {
      return log.actor.fullName
    }

    if (log?.actor?.firstName) {
      return log.actor.firstName
    }

    if (log?.actor?.email) {
      return log.actor.email
    }

    return ''
  }

  async fetch(): Promise<void> {
    try {
      await this.fetchRepositorySettingsAuditLogs(this.baseRouteParams)
    } catch (e) {
      this.logErrorForUser(e as Error, 'Audit Log', this.baseRouteParams)
    }
  }
}
</script>
