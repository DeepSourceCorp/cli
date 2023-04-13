<template>
  <audit-log-page
    v-bind="auditLogPageProps"
    class="max-w-2xl p-4"
    @close-export-logs-modal="showExportLogsSuccessModal = false"
    @export-logs="exportLogs"
    @update-filter="fetchAuditLogItems"
  />
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'

import AuditLogMixin from '~/mixins/auditLogMixin'
import { AuditLogLevel } from '~/types/auditLog'

import { TeamPerms } from '~/types/permTypes'

@Component({
  middleware: ['perm'],
  meta: {
    auth: {
      strict: true,
      teamPerms: [TeamPerms.VIEW_AUDIT_LOG]
    }
  }
})
export default class TeamLevelAuditLog extends mixins(AuditLogMixin) {
  level = AuditLogLevel.Team
}
</script>
