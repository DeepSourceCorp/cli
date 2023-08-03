<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="inline-flex items-center gap-x-3">
        <z-icon icon="list-end" class="flex-shrink-0 self-start" />

        <p
          class="page-context-text max-w-2xs break-words border-b-vanilla-400 text-sm font-medium leading-5 md:max-w-xs lg:max-w-sm"
        >
          Logs for Last 3 months Jan 6, 2023 - Apr 6, 2023
        </p>
      </div>

      <pagination-v2
        :page-number="1"
        :per-page-count="30"
        :total-count="90"
        :disabled="true"
        class="hidden md:flex"
      />
    </div>

    <timeline-v2 class="gradient-overlay-container ml-1">
      <timeline-item-v2 v-for="log in dummyAuditLog" :key="log.id">
        <log v-bind="log" />
      </timeline-item-v2>
    </timeline-v2>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import TimelineV2 from '../Common/TimelineV2.vue'

@Component({ name: 'DummyAuditLog', components: { TimelineV2 } })
export default class DummyAuditLog extends Vue {
  readonly dummyAuditLog = [
    {
      id: '11',
      eventName: 'jedi.change_role',
      description: "Role of the user Duck Norris (duck@quackotron.com) was changed to 'admin'.",
      ipAddress: '127.0.0.1',
      location: 'Quackotron',
      createdAt: '2023-02-24T08:15:24.207960+00:00',
      actor: {
        id: 'norris-deepsource',
        fullName: 'Duck Norris',
        firstName: 'Duck',
        email: 'duck@quackotron.com',
        avatar:
          'https://local-asgard-static.s3.us-east-1.amazonaws.com/dashboard/images/empty-avatar.svg'
      }
    },
    {
      id: '12',
      eventName: 'jedi.remove',
      description: 'User Bug Invader (bug@invaders.bug) was removed from team.',
      ipAddress: '127.0.0.1',
      location: 'Quackotron',
      createdAt: '2023-02-24T08:15:24.207960+00:00',
      actor: {
        id: 'bug-invader',
        fullName: 'Bug Invader',
        firstName: 'Bug',
        email: 'bug@invaders.bug',
        avatar:
          'https://local-asgard-static.s3.us-east-1.amazonaws.com/dashboard/images/empty-avatar.svg'
      }
    },
    {
      id: '13',
      eventName: 'jedi.change_role',
      description: "Role of the user Duck Norris (duck@quackotron.com) was changed to 'member'.",
      ipAddress: '127.0.0.1',
      location: 'Quackotron',
      createdAt: '2023-02-24T08:15:24.207960+00:00',
      actor: {
        id: 'norris-deepsource',
        fullName: 'Duck Norris',
        firstName: 'Duck',
        email: 'duck@quackotron.com',
        avatar:
          'https://local-asgard-static.s3.us-east-1.amazonaws.com/dashboard/images/empty-avatar.svg'
      }
    }
  ]
}
</script>

<style scoped>
.gradient-overlay-container {
  position: relative;
}
.gradient-overlay-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, #121317, transparent);
}
.gradient-overlay-container .content {
  position: relative;
  z-index: 1;
}
</style>
